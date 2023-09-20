import chai from "chai";
import chaiHttp from "chai-http";
import chaiAsPromise from "chai-as-promised";
import { app } from "../../../core/app";
import { mockUser } from "../../../data/users/UserMock";
chai.use(chaiAsPromise);
chai.use(chaiHttp);
chai.should();
import { v4 as uuid } from "uuid";
import { ERROR_MESSAGES } from "../../../../constants";

describe("RESET PASSWORD /auth/update-password", function () {
  const password = `Test1234!`;
  const dummyKey = uuid();
  before(async () => {
    await mockUser.create({
      dummyKey,
      password,
      userPermission: "*",
    });
  });
  it("should not change user password if oldPassword is not provided", async function () {
    const res = await chai
      .request(app.app)
      .patch("/v1/auth/update-password")
      .set({
        Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
      })
      .send({});
    res.should.have.status(400);
    res.body.should.have.property("success").be.a("boolean").eql(false);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.fieldRequired("Old password"));
  });
  it("should not change user password if newPassword is not provided", async function () {
    const res = await chai
      .request(app.app)
      .patch("/v1/auth/update-password")
      .set({
        Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
      })
      .send({
        oldPassword: password,
      });
    res.should.have.status(400);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.fieldRequired("New password"));
  });

  it("should not change user password if passwords are the same", async function () {
    const res = await chai
      .request(app.app)
      .patch("/v1/auth/update-password")
      .set({
        Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
      })
      .send({
        oldPassword: password,
        newPassword: password,
      });
    res.should.have.status(400);
    res.body.should.have.property("success").be.a("boolean").eql(false);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.samePasswordCombination);
  });
  it("should change user password", async function () {
    const res = await chai
      .request(app.app)
      .patch("/v1/auth/update-password")
      .set({
        Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
      })
      .send({
        oldPassword: password,
        newPassword: `Test678!2`,
      });
    res.should.have.status(200);
    res.body.should.have.property("success").equal(true);
  });
});
