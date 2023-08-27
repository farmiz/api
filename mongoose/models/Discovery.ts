import mongoose, { Model, Schema } from "mongoose";
import { IDefaultPlugin } from "../../interfaces";
import { IDiscovery, RiskLevel } from "../../interfaces/discovery";
import { defaultPlugin } from "../utils";

export interface DiscoveryModel extends IDiscovery, IDefaultPlugin {}

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
  closingDate: {
    type: Date,
    required: true,
  },
});

discoverySchema.plugin(defaultPlugin);

export const Discovery = mongoose.model("Discovery", discoverySchema);
