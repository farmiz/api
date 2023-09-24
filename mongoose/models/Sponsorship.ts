import mongoose, { Schema } from "mongoose";
import { SponsorshipProps } from "../../interfaces/sponsorship";
import { IDefaultPlugin } from "../../interfaces";
import { defaultPlugin } from "../utils";

export interface SponsorshipModel extends SponsorshipProps, IDefaultPlugin {}
const sponsorshipSchema = new Schema<SponsorshipModel>({
  userId: {
    type: String,
    required: true,
    ref: "User"
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
  estimatedProfitPercentage: {
    type: Number,
    required: true,
  },
  sponsoredAmount: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
  status: {
    type: String,
    required: false,
    enum: ["active", "cancelled", "closed"],
    default: "active"
  },
  walletId: {
    type: String,
    required: true,
    ref: "Wallet"
  },
  delayDays: {
    type: Number,
    required: true
  }
});

sponsorshipSchema.plugin(defaultPlugin);
const Sponsorship = mongoose.model<SponsorshipModel>(
  "Sponsorship",
  sponsorshipSchema,
);
export default Sponsorship;
