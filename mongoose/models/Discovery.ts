import mongoose, { Schema } from "mongoose";
import { IDefaultPlugin } from "../../interfaces";
import { DiscoveryProps, RiskLevel } from "../../interfaces/discovery";
import { defaultPlugin } from "../utils";
import { MongooseDefaults } from "../../constants";

export interface DiscoveryModel extends DiscoveryProps, IDefaultPlugin {}

export const riskLevels: RiskLevel[] = ["high", "low", "moderate"];
const discoverySchema = new Schema<DiscoveryModel>({
  name: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  duration: {
    type: Object,
    required: true,
  },
  profitPercentage: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  riskLevel: {
    type: String,
    required: true,
    enum: riskLevels,
  },
  tags: {
    type: [String],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
}, MongooseDefaults);
discoverySchema.plugin(defaultPlugin);

discoverySchema.virtual("discoveryFile", {
  ref: "File",
  localField: "_id",
  foreignField: "discoveryId",
  justOne: true,
  match: { deleted: false },
});


export const Discovery = mongoose.model<DiscoveryModel>(
  "Discovery",
  discoverySchema,
);
