import mongoose, { Schema } from "mongoose";
import { IDefaultPlugin } from "../../interfaces";
import { DiscoveryProps, RiskLevel } from "../../interfaces/discovery";
import { defaultPlugin } from "../utils";
import { MongooseDefaults } from "../../constants";

export interface DiscoveryModel extends DiscoveryProps, IDefaultPlugin {}

export const riskLevels: RiskLevel[] = ["high", "low", "moderate"];
const discoverySchema = new Schema<DiscoveryModel>(
  {
    product: {
      type: String,
      required: true,
      ref: "Product",
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
    closingDate: {
      type: Date,
      required: true,
    },
  },
  MongooseDefaults,
);
discoverySchema.plugin(defaultPlugin);


export const Discovery = mongoose.model<DiscoveryModel>(
  "Discovery",
  discoverySchema,
);
