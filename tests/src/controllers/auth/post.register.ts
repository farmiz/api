import chai from "chai";
import chaiHttp from "chai-http";
import chaiAsPromise from "chai-as-promised";
import { app } from "../../../core/app";
import { faker } from "@faker-js/faker";
import { ERROR_MESSAGES, httpCodes } from "../../../../constants";
import { mockUser } from "../../../data/users/UserMock";
import { v4 as uuid } from "uuid";
import { UserRole } from "../../../../interfaces/users";
import { omit, pick } from "lodash";
import { subYears } from "date-fns";
chai.use(chaiAsPromise);
chai.use(chaiHttp);
chai.should();

const email = faker.internet.email();
const username = faker.internet.userName()

describe("REGISTER USER /auth/register", function () {
  before(async () => {
    await mockUser.create({ email, dummyKey: uuid(), userPermission: "*", username });
  });
  const userDetails = {
    firstName: "Rex",
    lastName: "Ford",
    username: "rexbot",
    email: `${uuid()}@test.com`,
    password: `Test12345!`,
    phone: {
      number: "543814868",
      prefix: "233",
      country: "GH",
    },
    dateOfBirth: subYears(new Date(), 20)
  };

  it("should not register user without firstName", async () => {
    const res = await chai
      .request(app.app)
      .post("/v1/auth/register")
      .send({ firstName: "" });
    res.should.have.status(httpCodes.BAD_REQUEST.code);
    res.body.should.have.property("success").be.a("boolean").eql(false);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.fieldRequired("First name"));
  });
  it("should not register user if firstName is less than three characters", async () => {
    const res = await chai
      .request(app.app)
      .post("/v1/auth/register")
      .send({ firstName: "Sm" });
    res.should.have.status(httpCodes.BAD_REQUEST.code);
    res.body.should.have.property("success").be.a("boolean").eql(false);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.invalidField("First name"));
  });
  it("should not register user without lastName", async () => {
    const res = await chai
      .request(app.app)
      .post("/v1/auth/register")
      .send({ firstName: userDetails.firstName, lastName: "" });
    res.should.have.status(httpCodes.BAD_REQUEST.code);
    res.body.should.have.property("success").be.a("boolean").eql(false);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.fieldRequired("Last name"));
  });
  it("should not register user if lastName is less than three characters", async () => {
    const res = await chai
      .request(app.app)
      .post("/v1/auth/register")
      .send({ firstName: userDetails.firstName, lastName: "Lf" });
    res.should.have.status(httpCodes.BAD_REQUEST.code);
    res.body.should.have.property("success").be.a("boolean").eql(false);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.invalidField("Last name"));
  });
  it("should not register user without username", async () => {
    const res = await chai
      .request(app.app)
      .post("/v1/auth/register")
      .send({ ...pick(userDetails, ["firstName", "lastName"]), username: "" });
    res.should.have.status(httpCodes.BAD_REQUEST.code);
    res.body.should.have.property("success").be.a("boolean").eql(false);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.fieldRequired("Username"));
  });
  it("should not register user if username is less than three characters", async () => {
    const res = await chai
      .request(app.app)
      .post("/v1/auth/register")
      .send({
        ...pick(userDetails, ["firstName", "lastName"]),
        username: "Lf",
      });
    res.should.have.status(httpCodes.BAD_REQUEST.code);
    res.body.should.have.property("success").be.a("boolean").eql(false);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.invalidField("Username"));
  });

  it("should not register user with invalid email", async function () {
    const res = await chai
      .request(app.app)
      .post("/v1/auth/register")
      .send({
        ...pick(userDetails, ["firstName", "lastName", "username"]),
        email: "something.sss",
      });
    res.should.have.status(httpCodes.BAD_REQUEST.code);
    res.body.should.have.property("success").be.a("boolean").eql(false);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.invalidEmail);
  });


  it("should not register user without phone", async function () {
    const res = await chai
      .request(app.app)
      .post("/v1/auth/register")
      .send({ ...omit(userDetails, ["dateOfBirth", "phone"]) });
    res.should.have.status(httpCodes.BAD_REQUEST.code);
    res.body.should.have.property("success").be.a("boolean").eql(false);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.fieldRequired("Phone"));
  });
  it("should not register user invalid phone object", async function () {
    const res = await chai
      .request(app.app)
      .post("/v1/auth/register")
      .send({
        ...omit(userDetails, ["dateOfBirth", "phone.country", "phone.number"]),
        phone: { number: "543814868" },
      });
    res.should.have.status(httpCodes.BAD_REQUEST.code);
    res.body.should.have.property("success").be.a("boolean").eql(false);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.invalidField("Phone"));
  });
  it("should not register user without date of birth", async function () {
    const res = await chai
      .request(app.app)
      .post("/v1/auth/register")
      .send({ ...omit(userDetails, ["dateOfBirth"]) });
    res.should.have.status(httpCodes.BAD_REQUEST.code);
    res.body.should.have.property("success").be.a("boolean").eql(false);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.fieldRequired("Date of birth"));
  });
  it("should not register user if user is not 18yrs or above", async function () {
    const res = await chai
      .request(app.app)
      .post("/v1/auth/register")
      .send({...userDetails, dateOfBirth: new Date()});
    res.should.have.status(httpCodes.BAD_REQUEST.code);
    res.body.should.have.property("success").be.a("boolean").eql(false);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.invalidField("Date of birth"));
  });
  it("should not register user with a short password format", async function () {
    const res = await chai
      .request(app.app)
      .post("/v1/auth/register")
      .send({
       ...userDetails,
        password: "12345",
      });
    res.should.have.status(httpCodes.BAD_REQUEST.code);
    res.body.should.have.property("success").be.a("boolean").eql(false);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.invalidPasswordLength);
  });

  it("should not register user with no lowercase letter in password", async function () {
    const res = await chai
      .request(app.app)
      .post("/v1/auth/register")
      .send({
      ...userDetails,
        password: "12345678",
      });
    res.should.have.status(httpCodes.BAD_REQUEST.code);
    res.body.should.have.property("success").be.a("boolean").eql(false);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.noLowerCaseInPassword);
  });

  it("should not register user with no uppercase letter in password", async function () {
    const res = await chai
      .request(app.app)
      .post("/v1/auth/register")
      .send({
      ...userDetails,
        password: "12345678a",
      });
    res.should.have.status(httpCodes.BAD_REQUEST.code);
    res.body.should.have.property("success").be.a("boolean").eql(false);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.noUpperCaseInPassword);
  });

  it("should not register user with no special character in password", async function () {
    const res = await chai
      .request(app.app)
      .post("/v1/auth/register")
      .send({
        ...userDetails,
        password: "12345678aA",
      });
    res.should.have.status(httpCodes.BAD_REQUEST.code);
    res.body.should.have.property("success").be.a("boolean").eql(false);
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.noSpecialCharacterInPassword);
  });
  it("should not register user if username already exists", async function () {
    const res = await chai
      .request(app.app)
      .post("/v1/auth/register")
      .send({ ...userDetails, username });
    res.should.have.status(httpCodes.BAD_REQUEST.code);
    res.body.should.have.property("success").be.a("boolean").eql(false);
    res.body.should.have.property("response").be.a("object");
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.userFieldExists("username", username));
  });
  it("should not register user if email already exists", async function () {
    const res = await chai
      .request(app.app)
      .post("/v1/auth/register")
      .send({ ...userDetails, email });
    res.should.have.status(httpCodes.BAD_REQUEST.code);
    res.body.should.have.property("success").be.a("boolean").eql(false);
    res.body.should.have.property("response").be.a("object");
    res.body.should.have.property("response").be.a("object");
    res.body.response.should.have
      .property("message")
      .be.a("string")
      .eql(ERROR_MESSAGES.userFieldExists("email", email));
  });
  it("should register user with valid user credentials", async function () {
    const newEmail = faker.internet.email();
    const res = await chai
      .request(app.app)
      .post("/v1/auth/register")
      .send({ ...userDetails, email: "bernardarhia@gmail.com" });
    res.should.have.status(httpCodes.CREATED.code);
    res.body.should.have.property("success").eql(true);
    res.body.should.have.property("response");
    // res.body.response.should.have.property("email").eql(newEmail);
    res.body.response.should.have.property("status").eql("pendingApproval");
  });

  after(async () => {
    mockUser.destroy();
  });
});
