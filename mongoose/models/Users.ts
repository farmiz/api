import mongoose from "mongoose";
import { IUser, userRoles } from "../../interfaces/users";
import { MongooseDefaults } from "../../constants";
import { defaultPlugin } from "../utils";
import { RequestError } from "../../helpers/errors";
import { Document } from "mongoose";

export interface UserModel extends IUser {}
export interface UserDocumentProps
  extends Omit<UserModel, "_id" | "id">,
    Document {}

const userSchema = new mongoose.Schema<UserModel>(
  {
    email: { type: String, required: true },
    phone: {
      prefix: { type: String },
      number: { type: String },
      country: { type: String },
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
    lastLoggedInDate: { type: Date },
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

userSchema.virtual("profileImageData", {
  ref: "ProfileImage",
  localField: "_id",
  foreignField: "userId",
  justOne: true,
});
export async function preSaveUsers(
  model: UserDocumentProps | null,
  fields?: any,
) {
  const existingUser = await User.findOne({
    $or: [
      { username: fields?.username },
      { email: model?.email },
      { phone: model?.phone?.number, prefix: model?.phone?.prefix },
    ],
  });

  if (existingUser) {
    return new RequestError(400, `User with already exists`);
  }
}
export async function preSaveUserHook(this: UserDocumentProps): Promise<void> {
  await preSaveUsers(this);
}
userSchema.pre("save", preSaveUserHook);
const User = mongoose.model<UserModel>("User", userSchema);

export default User;
