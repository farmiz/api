import chai from "chai";
import chaiHttp from "chai-http";
import chaiAsPromise from "chai-as-promised";
chai.use(chaiAsPromise);
chai.use(chaiHttp);
chai.should();
import { v4 as uuid } from "uuid";
import { mockUser } from "../../../data/users/UserMock";
import { WalletModel } from "../../../../mongoose/models/Wallet";
import { mobileMoneyWalletMock } from "../../../data/wallet/mobileMoney/MobileMoneyWalletMock";
import { app } from "../../../core/app";
import { ERROR_MESSAGES } from "../../../../constants";
import { pick, set } from "lodash";

describe("CREATE WALLET /wallet", async () => {
  const dummyKey = uuid();
  const validWalletData: WalletModel = {
    type: "mobile money",
    mobileMoneyDetails: {
      network: "MTN",
      phone: {
        number: "387794868",
        prefix: "233",
        country: "GH",
      },
    },
  };
  before(async () => {
    await mockUser.create({ dummyKey, userPermission: { wallet: ["create"] } });
    await mockUser.create({
      role: "admin",
      userPermission: "*",
      dummyKey,
    });
    await mobileMoneyWalletMock.create({ dummyKey });
  });
  it("should not create wallet without wallet type", async () => {
    const res = await chai
      .request(app.app)
      .post("/v1/wallet")
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
      .eql(ERROR_MESSAGES.fieldRequired("Wallet type"));
  });
  it("should not create wallet without mobile money details", async () => {
    const res = await chai
      .request(app.app)
      .post("/v1/wallet")
      .set({
        Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
      })
      .send({ ...pick(validWalletData, ["type"]) });
    res.should.have.status(400);
    res.body.should.have.property("error").be.a("boolean").eql(true);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.fieldRequired("Mobile money details"));
  });

  for (const detail in validWalletData.mobileMoneyDetails) {
    it("should not create wallet without a valid mobileMoneyDetails", async () => {
      const res = await chai
        .request(app.app)
        .post("/v1/wallet")
        .set({
          Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
        })
        .send({
          ...pick(validWalletData, ["type", `mobileMoneyDetails.${detail}`]),
        });
      res.should.have.status(400);
      res.body.should.have.property("error").be.a("boolean").eql(true);
      res.body.should.have.property("response").be.a("object");
      res.body.response.should.have
        .property("message")
        .be.a("string")
        .eql(ERROR_MESSAGES.invalidField("Mobile money details"));
    });
  }

  it("should not create wallet without a valid phone number ", async () => {
    const res = await chai
      .request(app.app)
      .post("/v1/wallet")
      .set({
        Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
      })
      .send({
        ...set(validWalletData, "mobileMoneyDetails.phone.number", "348594958"),
      });
    res.should.have.status(500);
    res.body.should.have.property("error").be.a("boolean").eql(true);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql("Invalid phone number");
  });
  it("should not create wallet with an unresolved number", async () => {
    const res = await chai
      .request(app.app)
      .post("/v1/wallet")
      .set({
        Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
      })
      .send({
        ...set(validWalletData, "mobileMoneyDetails.phone.number", "244000000"),
      });
    res.should.have.status(400);
    res.body.should.have.property("error").be.a("boolean").eql(true);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql("Invalid wallet details");
  });
  it.only("should create wallet with a validnumber", async () => {
    const res = await chai
      .request(app.app)
      .post("/v1/wallet")
      .set({
        Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
      })
      .send({
        ...set(validWalletData, "mobileMoneyDetails.phone.number", "543814868"),
      });
    res.should.have.status(201);
    res.body.should.have.property("success").be.a("boolean").eql(true);
    res.body.should.have.property("response").be.a("object");
    res.body.response.deleted.should.be.eql(false);
  });
});
