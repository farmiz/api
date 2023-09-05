import chai from "chai";
import chaiHttp from "chai-http";
import chaiAsPromise from "chai-as-promised";
chai.use(chaiAsPromise);
chai.use(chaiHttp);
chai.should();
import { v4 as uuid } from "uuid";
import { mockUser } from "../../../data/users/UserMock";
import { app } from "../../../core/app";
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
      userPermission: { discovery: ["update"] },
    });
    await discoveryMock.create({dummyKey});
  });

  it("should update discovery with valid discovery data", async () => {
    const res = await chai
      .request(app.app)
      .put(`/v1/${discoveryMock.getId(dummyKey)}/discovery`)
      .set({
        Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
      })
      .send(validDiscoveryData);
      console.log({
        name: "kofi"
      });
    // res.should.have.status(200);
    // res.body.should.have.property("success").be.a("boolean").eql(true);
    // res.body.should.have.property("response").be.a("object");
    // const expectedFields = [
    //   "name",
    //   "amount",
    //   "duration",
    //   "profitPercentage",
    //   "description",
    //   "riskLevel",
    //   "tags",
    //   "startDate",
    //   "endDate",
    //   "closingDate",
    //   "createdBy",
    //   "deleted",
    //   "_id",
    //   "createdAt",
    //   "updatedAt",
    // ];

    // for(const field of expectedFields){
    //   res.body.response.should.have.property(field)
    // }
    console.log(res.body)
  });

  after(async () => {
    await discoveryMock.destroy();
  });
});
