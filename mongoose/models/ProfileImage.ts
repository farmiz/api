import mongoose, { Schema } from "mongoose";
import { IDefaultPlugin } from "../../interfaces";
import { defaultPlugin } from "../utils";

export interface ProfileImageProps extends IDefaultPlugin {
  directory: string;
  fileName: string;
  userId?: string;
}

const profileImageSchema = new Schema<ProfileImageProps>({
  directory: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: false,
    ref: "User",
  },
});

profileImageSchema.plugin(defaultPlugin);
const ProfileImageModel = mongoose.model<ProfileImageProps>("ProfileImage", profileImageSchema);

export default ProfileImageModel;
