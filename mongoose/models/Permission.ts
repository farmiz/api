import mongoose, {  Schema } from "mongoose";
import { MongooseDefaults } from "../../constants";
import { defaultPlugin } from "../utils";
import { IDefaultPlugin } from "../../interfaces";

export interface PermissionDocument extends IDefaultPlugin {
  access: string;
  userId: string;
}

const permissionSchema = new Schema<PermissionDocument>(
  {
    access: { type: String, required: true },
    userId: { type: String, ref: "User", required: true },
  },
  MongooseDefaults,
);
permissionSchema.plugin(defaultPlugin)

const Permission = mongoose.model<PermissionDocument>(
  "Permission",
  permissionSchema,
);

export default Permission;
