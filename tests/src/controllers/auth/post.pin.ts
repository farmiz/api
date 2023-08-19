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

describe("CREATE PIN /auth/pin", function () {
  const password = `Test1234!`;
  const dummyKey = uuid();
  const dummyKey2 = uuid();
  before(async () => {
    await mockUser.create({
      dummyKey,
      password,
      userPermission: "*",
    });
    await mockUser.create({
      dummyKey: dummyKey2,
      password,
      userPermission: "*",
    });
    await mockPin.create({ userId: mockUser.getId(dummyKey) });
  });
  it("should not create pin if code is not provided", async function () {
    const res = await chai
      .request(app.app)
      .post("/api/auth/pin")
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

  it("should not create pin if code is not invalid", async function () {
    const res = await chai
      .request(app.app)
      .post("/api/auth/pin")
      .set({
        Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
      })
      .send({ code: "123456" });
    res.should.have.status(400);
    res.body.should.have.property("error").be.a("boolean").eql(true);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.invalidField("code"));
  });
  it("should not create if pin exists ", async function () {
    const res = await chai
      .request(app.app)
      .post("/api/auth/pin")
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
      .eql("Pin already exists");
  });
  it("should create pin with code ", async function () {
    const res = await chai
      .request(app.app)
      .post("/api/auth/pin")
      .set({
        Authorization: `Bearer ${mockUser.getToken(dummyKey2)}`,
      })
      .send({ code: "1234" });
    res.should.have.status(201);
    res.body.should.have.property("success").be.a("boolean").eql(true);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql("Pin created");
  });

  after(async () => {
    await mockPin.destroy();
  });
});
