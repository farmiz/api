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
import { mockPin } from "../../../data/pin/PinMock";

describe("VALIDATE PIN /auth/pin", function () {
  const password = `Test1234!`;
  const dummyKey = uuid();
  before(async () => {
    await mockUser.create({
      dummyKey,
      password,
      userPermission: "*",
    });

    await mockPin.create({ userId: mockUser.getId(dummyKey), code: "1233" });
  });
  it("should not validate pin if code is not provided", async function () {
    const res = await chai
      .request(app.app)
      .post("/api/auth/pin/validate")
      .set({
        Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
      })
      .send({});
    res.should.have.status(400);
    res.body.should.have.property("error").be.a("boolean").eql(true);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.fieldRequired("code"));
  });

  it("should not validate pin if new code is not valid", async function () {
    const res = await chai
      .request(app.app)
      .post("/api/auth/pin/validate")
      .set({
        Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
      })
      .send({ code: "1234" });
    res.should.have.status(400);
    res.body.should.have.property("error").be.a("boolean").eql(true);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql("Invalid pin");
  });
  it("should validate pin if code is valid", async function () {
    const res = await chai
      .request(app.app)
      .post("/api/auth/pin/validate")
      .set({
        Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
      })
      .send({ code: "1233" });
    res.should.have.status(200);
    res.body.should.have.property("success").be.a("boolean").eql(true);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql("Pin validated");
  });

  after(async () => {
    await mockPin.destroy();
  });
});
