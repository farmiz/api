import mongoose from "mongoose";
import { IUser, userRoles } from "../../interfaces/users";
import { MongooseDefaults } from "../../constants";
import { defaultPlugin } from "../utils";

export interface UserModel extends IUser {}

const userSchema = new mongoose.Schema<UserModel>(
  {
    email: { type: String, required: true },
    phone: {
      prefix: { type: String },
      number: { type: String },
      country: { type: String, default: "GH" },
    },
    password: { type: String, required: true },
    role: { type: String, default: "customer", enum: userRoles },
    firstName: { type: String },
    lastName: { type: String },
    username: { type: String },
    gender: { type: String, enum: ["male", "female"] },
    physicalAddress: {
      houseNumber: { type: String },
      zipCode: { type: String },
      country: { type: String },
      city: { type: String },
      state: { type: String },
      street: { type: String },
    },
    mailingAddress: {
      houseNumber: { type: String },
      zipCode: { type: String },
      country: { type: String },
      city: { type: String },
      state: { type: String },
      street: { type: String },
    },
    status: { type: String, default: "pendingApproval" },
    isLoggedIn: { type: Boolean },
    dateOfBirth: { type: Date },
    lastLoggedInDate: { type: Date }
  },
  MongooseDefaults,
);
userSchema.plugin(defaultPlugin);

userSchema.virtual("permission", {
  ref: "Permission",
  localField: "_id",
  foreignField: "userId",
  justOne: true,
});

const User = mongoose.model<UserModel>("User", userSchema);

export default User;