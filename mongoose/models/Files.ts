import mongoose, { Schema } from "mongoose";
import { defaultPlugin } from "../utils";
import { IDefaultPlugin } from "../../interfaces";
import { FilesProp } from "../../interfaces/files";

export interface FilesModel extends FilesProp, IDefaultPlugin {}

const filesSchema = new Schema<FilesModel>({
  directory: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});
filesSchema.plugin(defaultPlugin);

const Files = mongoose.model<FilesProp>("File", filesSchema);

export interface DiscoveryFilesProps extends FilesModel {
  discoveryId: string;
}
export const DiscoveryFiles = Files.discriminator<DiscoveryFilesProps>(
  "DISCOVERY",
  new Schema({
    discoveryId: {
      type: String,
      required: true,
      ref: "Discovery",
    },
  }),
);
export interface ProfileImageProps extends FilesModel {
  discoveryId: string;
}
export const ProfileImage = Files.discriminator<ProfileImageProps>(
  "PROFILE_IMAGE",
  new Schema({
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
  }),
);
export default Files;