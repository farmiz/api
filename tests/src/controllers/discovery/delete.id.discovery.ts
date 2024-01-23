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

describe("DELETE DISCOVERY /discoveries/:id", () => {
  const dummyKey = uuid();
  const dummyKey2 = uuid();
  before(async () => {

    await mockUser.create({
        role: "admin",
      userPermission: "*",
      dummyKey,
    });

    await discoveryMock.create({
      dummyKey,
      createdBy: mockUser.getId(dummyKey)
    });
   await discoveryMock.create({
      dummyKey: dummyKey2,
      createdBy: mockUser.getId(dummyKey),
      deleted: true
    });
  });


  it("Should delete a valid discovery", async()=>{
    const res = await chai
    .request(app.app)
    .delete(`/v1/discoveries/${discoveryMock.getId(dummyKey)}`)
    .set({
      Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
    })
  res.should.have.status(200);
  res.body.should.have.property("success").be.a("boolean").eql(true);
  res.body.should.have.property("response").be.a("object");
  res.body.response.should.have.property("deleted").be.a("boolean").eql(true);
  })
  it("Should not delete a discovery discovery that is already deleted", async()=>{
    const res = await chai
    .request(app.app)
    .delete(`/v1/discoveries/${discoveryMock.getId(dummyKey2)}`)
    .set({
      Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
    })
  res.should.have.status(400);
  res.body.should.have.property("success").be.a("boolean").eql(false);
  res.body.should.have.property("response").be.a("object");
  res.body.response.should.have.property("message").be.a("string").eql("Discovery doesn't exist");
  })
  after(async()=>{
    await discoveryMock.destroy();
  })
});