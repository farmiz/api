import mongoose, { Schema } from "mongoose";
import { SponsorshipProps } from "../../interfaces/sponsorship";
import { IDefaultPlugin } from "../../interfaces";
import { defaultPlugin } from "../utils";
import { MongooseDefaults } from "../../constants";

export interface SponsorshipModel extends SponsorshipProps, IDefaultPlugin {}
const sponsorshipSchema = new Schema<SponsorshipModel>(
  {
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    discoveryId: {
      type: String,
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
    sponsoredAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: false,
      enum: ["active", "cancelled", "closed"],
      default: "active",
    },
    walletId: {
      type: String,
      required: true,
      ref: "Wallet",
    },
    delayDays: {
      type: Number,
      required: true,
    },
    cancelledAt: {
      type: Date,
      required: false,
    },
    cancelledBy: {
      type: String,
      ref: "User",
      required: false,
    },
    cancellationReason: {
      type: String,
      required: false,
    },
    growthStagesIds: {
      type: [String],
      required: false,
      ref: "GrowthStages",
    },
  },
  MongooseDefaults,
);

sponsorshipSchema.virtual("wallet", {
  ref: "Wallet",
  localField: "walletId",
  foreignField: "_id",
  justOne: true,
});
sponsorshipSchema.virtual("discovery", {
  ref: "Discovery",
  localField: "discoveryId",
  foreignField: "_id",
  justOne: true,
});
sponsorshipSchema.virtual("customer", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});
sponsorshipSchema.virtual("growthStages", {
  ref: "GrowthStage",
  localField: "growthStagesIds",
  foreignField: "_id",
  justOne: false,
  match: {
    deleted: false,
  },
});
sponsorshipSchema.plugin(defaultPlugin);
const Sponsorship = mongoose.model<SponsorshipModel>(
  "Sponsorship",
  sponsorshipSchema,
);
export default Sponsorship;
