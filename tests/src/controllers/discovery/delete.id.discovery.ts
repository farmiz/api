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

describe("DELETE DISCOVERY /:id/discovery", () => {
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


  it.only("Should delete a valid discovery", async()=>{
    const res = await chai
    .request(app.app)
    .delete(`/v1/${discoveryMock.getId(dummyKey)}/discovery`)
    .set({
      Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
    })
//   res.should.have.status(200);
//   res.body.should.have.property("success").be.a("boolean").eql(true);
//   res.body.should.have.property("response").be.a("object");
//   res.body.response.should.have.property("data").be.a("array");
//   res.body.response.data.length.should.eql(20)
console.log(res.body)

  })
  after(async()=>{
    await discoveryMock.destroy();
  })
});