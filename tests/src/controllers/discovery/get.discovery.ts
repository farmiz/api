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

describe("GET ALL DISCOVERY /discovery", () => {
  const dummyKey = uuid();
  before(async () => {

    await mockUser.create({
        role: "admin",
      userPermission: "*",
      dummyKey,
    });

   await discoveryMock.createMany(20, {
      dummyKey,
      createdBy: mockUser.getId(dummyKey)
    });
  });


  it("Should return discoveries", async()=>{
    const res = await chai
    .request(app.app)
    .get(`/v1/discovery`)
    .set({
      Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
    })
    console.log(res.body)
  res.should.have.status(200);
  res.body.should.have.property("success").be.a("boolean").eql(true);
  res.body.should.have.property("response").be.a("object");
  res.body.response.should.have.property("data").be.a("array");
  res.body.response.data.length.should.eql(20)

  })
  after(async()=>{
    await discoveryMock.destroy();
  })
});