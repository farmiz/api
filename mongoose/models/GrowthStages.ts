import { Schema, model } from "mongoose";
import { IDefaultPlugin } from "../../interfaces";
import { MongooseDefaults } from "../../constants";
import { defaultPlugin } from "../utils";

export interface GrowthStageProps extends IDefaultPlugin {
  title: string;
  description: string;
  level: string;
}

export const growthStageSchema = new Schema<GrowthStageProps>(
  {
    level: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  MongooseDefaults,
);

growthStageSchema.plugin(defaultPlugin);

const GrowthStages = model("GrowthStage", growthStageSchema);
export default GrowthStages;
