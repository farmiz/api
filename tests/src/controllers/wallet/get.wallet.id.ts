import chai from "chai";
import chaiHttp from "chai-http";
import chaiAsPromise from "chai-as-promised";
chai.use(chaiAsPromise);
chai.use(chaiHttp);
chai.should();
import { v4 as uuid } from "uuid";
import { mockUser } from "../../../data/users/UserMock";
import { mobileMoneyWalletMock } from "../../../data/wallet/mobileMoney/MobileMoneyWalletMock";
import { app } from "../../../core/app";
import { ERROR_MESSAGES } from "../../../../constants";

describe("GET WALLET /:id/wallet", () => {
  const dummyKey = uuid();
  const dummyKey2 = uuid();
  before(async () => {
   
    await mockUser.create({
        role: "admin",
      userPermission: "*",
      dummyKey,
    });
    await mockUser.create({
        role: "admin",
      userPermission: "*",
      dummyKey: dummyKey2,
    });

    await mobileMoneyWalletMock.create({
      dummyKey,
      userId: mockUser.getId(dummyKey),
      createdBy: mockUser.getId(dummyKey)
    });
    await mobileMoneyWalletMock.create({
      dummyKey: dummyKey2,
      userId: mockUser.getId(dummyKey2)
    });
  });


  it("Should not return wallet that doesn't belong to a user who didn't create that wallet", async()=>{
    const res = await chai
    .request(app.app)
    .get(`/api/${mobileMoneyWalletMock.getId(dummyKey2)}/wallet`)
    .set({
      Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
    })
  res.should.have.status(400);
  res.body.should.have.property("error").be.a("boolean").eql(true);
  res.body.should.have.property("response").be.a("object");
  res.body.response.should.have
    .property("message")
    .be.a("string")
    .eql(ERROR_MESSAGES.accessDenied)
  })
  it("Should return wallet", async()=>{
    const res = await chai
    .request(app.app)
    .get(`/api/${mobileMoneyWalletMock.getId(dummyKey)}/wallet`)
    .set({
      Authorization: `Bearer ${mockUser.getToken(dummyKey)}`,
    })
    res.should.have.status(200);
    res.body.should.have.property("success").be.a("boolean").eql(true);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have.property("userId").be.a("string").eql(mockUser.getId(dummyKey))
    res.body.response.should.have.property("createdBy").be.a("string").eql(mockUser.getId(dummyKey))
  })
  after(async()=>{
    await mobileMoneyWalletMock.destroy();
  })
});
