import mongoose, { Schema } from "mongoose";
import { defaultPlugin } from "../utils";
import { IDefaultPlugin } from "../../interfaces";
import { MongooseDefaults } from "../../constants";
import { TagsProps } from "../../interfaces/tags";

export interface TagsModel extends TagsProps, IDefaultPlugin {}

const tagsSchema = new Schema<TagsModel>(
  {
    name: {
      type: String,
      required: true,
    },
  },
  MongooseDefaults,
);
tagsSchema.plugin(defaultPlugin);

const Tags = mongoose.model<TagsModel>("Tags", tagsSchema);
export default Tags;
