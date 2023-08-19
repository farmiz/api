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

describe("UPADTE PIN /auth/pin", function () {
  const password = `Test1234!`;
  const dummyKey = uuid();
  before(async () => {
    await mockUser.create({
      dummyKey,
      password,
      userPermission: "*",
    });

    await mockPin.create({ userId: mockUser.getId(dummyKey) });
  });
  it("should not update pin if old code is not provided", async function () {
    const res = await chai
      .request(app.app)
      .put("/api/auth/pin")
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
      .eql(ERROR_MESSAGES.fieldRequired("Current Code"));
  });

  it("should not update pin if new code is not provided", async function () {
    const res = await chai
      .request(app.app)
      .put("/api/auth/pin")
      .set({
        Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
      })
      .send({ oldCode: "1234" });
    res.should.have.status(400);
    res.body.should.have.property("error").be.a("boolean").eql(true);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.fieldRequired("New Code"));
  });
  it("should not update pin if old code and new code are the same", async function () {
    const res = await chai
      .request(app.app)
      .put("/api/auth/pin")
      .set({
        Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
      })
      .send({ newCode: "1234", oldCode: "1234" });
    res.should.have.status(500);
    res.body.should.have.property("error").be.a("boolean").eql(true);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql("Pin Code cannot be the same");
  });
  it("should update pin if old code and new code are valid", async function () {
    const res = await chai
      .request(app.app)
      .put("/api/auth/pin")
      .set({
        Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
      })
      .send({ newCode: "1233", oldCode: "1234" });
    res.should.have.status(200);
    res.body.should.have.property("success").be.a("boolean").eql(true);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql("Pin updated successfully");
  });

  after(async () => {
    await mockPin.destroy();
  });
});
