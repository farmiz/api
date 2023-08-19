import mongoose, { Document, Types } from "mongoose";
import { IDefaultPlugin, Statuses } from "../../interfaces";
import { MongooseDefaults } from "../../constants";
import { defaultPlugin } from "../utils";

export type UserActivityType = "LOGIN" | "LOGOUT" | "PAGE_VIEW" | "FORM_SUBMIT";
export interface IUserActivity extends IDefaultPlugin {
  userId:string;
  activityType: UserActivityType;
  activityStatus: Omit<Statuses, "pending">;
  activityDate: Date;
  ipAddress: string;
  userAgent: string;
}

const userActivitySchema = new mongoose.Schema({
  userId: { type: String, ref: "User", required: true },
  activityType: { type: String, required: true },
  activityStatus: { type: String, required: true },
  activityDate: { type: Date, required: true },
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
}, MongooseDefaults);

userActivitySchema.plugin(defaultPlugin)
const UserActivity = mongoose.model<IUserActivity>(
  "UserActivity",
  userActivitySchema
);

export default UserActivity;
