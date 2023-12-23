import mongoose, { Schema } from "mongoose";
import { defaultPlugin } from "../utils";
import { IDefaultPlugin } from "../../interfaces";
import { FilesProp } from "../../interfaces/files";
import { MongooseDefaults } from "../../constants";

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
}, MongooseDefaults);
filesSchema.plugin(defaultPlugin);

const Files = mongoose.model<FilesProp>("File", filesSchema);

export interface ProductFilesProps extends FilesModel {
  productId: string;
}
export const ProductFiles = Files.discriminator<ProductFilesProps>(
  "PRODUCT",
  new Schema({
    productId: {
      type: String,
      required: true,
      ref: "Product",
    },
  }),
);
export interface ProfileImageProps extends FilesModel {
  productId: string;
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