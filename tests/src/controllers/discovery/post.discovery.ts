import chai from "chai";
import chaiHttp from "chai-http";
import chaiAsPromise from "chai-as-promised";
chai.use(chaiAsPromise);
chai.use(chaiHttp);
chai.should();
import { v4 as uuid } from "uuid";
import { mockUser } from "../../../data/users/UserMock";
import { app } from "../../../core/app";
import { ERROR_MESSAGES } from "../../../../constants";
import { omit } from "lodash";
import { discoveryMock } from "../../../data/discovery/DiscoveryMock";
import { DiscoveryModel } from "../../../../mongoose/models/Discovery";
import { mockDiscoveryTemplate } from "../../../data/discovery/discoveryTemplate";

describe("POST DISCOVERY   /discovery", async () => {
  const dummyKey = uuid();
  const validDiscoveryData: Partial<DiscoveryModel> = {
    ...mockDiscoveryTemplate(),
    duration: {
      type: "day",
      value: 10,
    },
  };
  before(async () => {
    await mockUser.create({
      dummyKey,
      userPermission: { discovery: ["create"] },
    });
  });
  it("should not create discovery without discovery name", async () => {
    const res = await chai
      .request(app.app)
      .post("/v1/discovery")
      .set({
        Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
      })
      .send({ ...omit(validDiscoveryData, ["name"]) });
    res.should.have.status(400);
    res.body.should.have.property("success").be.a("boolean").eql(false);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.fieldRequired("Name"));
  });
  it("should not create discovery without a valid amount", async () => {
    const res = await chai
      .request(app.app)
      .post("/v1/discovery")
      .set({
        Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
      })
      .send({
        name: "Ab",
      });
    res.should.have.status(400);
    res.body.should.have.property("success").be.a("boolean").eql(false);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql("Name should be at least 3 chars long");
  });
  it("should not create discovery without discovery amount", async () => {
    const res = await chai
      .request(app.app)
      .post("/v1/discovery")
      .set({
        Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
      })
      .send({ ...omit(validDiscoveryData, ["amount"]) });
    res.should.have.status(400);
    res.body.should.have.property("success").be.a("boolean").eql(false);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.fieldRequired("Amount"));
  });
  it("should not create discovery without discovery duration", async () => {
    const res = await chai
      .request(app.app)
      .post("/v1/discovery")
      .set({
        Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
      })
      .send({ ...omit(validDiscoveryData, ["duration"]) });
    res.should.have.status(400);
    res.body.should.have.property("success").be.a("boolean").eql(false);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.fieldRequired("Duration"));
  });
  it("should not create discovery without discovery description", async () => {
    const res = await chai
      .request(app.app)
      .post("/v1/discovery")
      .set({
        Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
      })
      .send({ ...omit(validDiscoveryData, ["description"]) });
    res.should.have.status(400);
    res.body.should.have.property("success").be.a("boolean").eql(false);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.fieldRequired("Description"));
  });
  it("should not create discovery without a valid discovery description", async () => {
    const res = await chai
      .request(app.app)
      .post("/v1/discovery")
      .set({
        Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
      })
      .send({ ...validDiscoveryData, description: "Sb" });
    res.should.have.status(400);
    res.body.should.have.property("success").be.a("boolean").eql(false);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql("Description should be at least 3 chars long");
  });
  it("should not create discovery without discovery tags", async () => {
    const res = await chai
      .request(app.app)
      .post("/v1/discovery")
      .set({
        Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
      })
      .send({ ...omit(validDiscoveryData, ["tags"]) });
    res.should.have.status(400);
    res.body.should.have.property("success").be.a("boolean").eql(false);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.fieldRequired("Tags"));
  });
  it("should not create discovery without discovery profitPercentage", async () => {
    const res = await chai
      .request(app.app)
      .post("/v1/discovery")
      .set({
        Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
      })
      .send({ ...omit(validDiscoveryData, ["profitPercentage"]) });
    res.should.have.status(400);
    res.body.should.have.property("success").be.a("boolean").eql(false);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.fieldRequired("Profit percentage"));
  });
  it("should not create discovery without discovery riskLevel", async () => {
    const res = await chai
      .request(app.app)
      .post("/v1/discovery")
      .set({
        Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
      })
      .send({ ...omit(validDiscoveryData, ["riskLevel"]) });
    res.should.have.status(400);
    res.body.should.have.property("success").be.a("boolean").eql(false);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.fieldRequired("Risk level"));
  });
  it("should not create discovery without discovery startDate", async () => {
    const res = await chai
      .request(app.app)
      .post("/v1/discovery")
      .set({
        Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
      })
      .send({ ...omit(validDiscoveryData, ["startDate"]) });
    res.should.have.status(400);
    res.body.should.have.property("success").be.a("boolean").eql(false);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.fieldRequired("Start date"));
  });
  it("should not create discovery without discovery endDate", async () => {
    const res = await chai
      .request(app.app)
      .post("/v1/discovery")
      .set({
        Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
      })
      .send({ ...omit(validDiscoveryData, ["endDate"]) });
    res.should.have.status(400);
    res.body.should.have.property("success").be.a("boolean").eql(false);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.fieldRequired("End date"));
  });

  it("should create discovery with  valid discovery data", async () => {
    const res = await chai
      .request(app.app)
      .post("/v1/discovery")
      .set({
        Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
      })
      .send(validDiscoveryData);

    res.should.have.status(201);
    res.body.should.have.property("success").be.a("boolean").eql(true);
    res.body.should.have.property("response").be.a("object");
    const expectedFields = [
      "name",
      "amount",
      "duration",
      "profitPercentage",
      "description",
      "riskLevel",
      "tags",
      "startDate",
      "endDate",
      "createdBy",
      "deleted",
      "_id",
      "createdAt",
      "updatedAt",
    ];

    for(const field of expectedFields){
      res.body.response.should.have.property(field)
    }
  });

  after(async () => {
    await discoveryMock.destroy();
  });
});
