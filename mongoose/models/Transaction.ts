import mongoose, { Schema } from "mongoose";
import { ITransaction } from "../../interfaces/transaction";
import { defaultPlugin } from "../utils";
import { IDefaultPlugin } from "../../interfaces";
import { MongooseDefaults } from "../../constants";

export interface TransactionModel extends ITransaction, IDefaultPlugin {}
const transactionSchema = new Schema<TransactionModel>(
  {
    domain: {
      type: String,
    },
    walletId: {
      type: String,
      ref: "Wallet",
    },
    status: {
      type: String,
      default: "pending",
    },
    reference: {
      type: String,
    },
    amount: {
      type: Number,
      default: 0,
    },
    message: String,
    gateway_response: String,
    paid_at: Date,
    created_at: Date,
    channel: String,
    currency: {
      type: String,
      enum: ["NGN", "GHS", "ZAR", "USD"],
    },
    ip_address: String,
    metadata: Object,
    fees: Number,
    createdAt: Date,
    source: {
      type: Schema.Types.Mixed,
      default: null,
    },
    authorization: {
      type: Schema.Types.Mixed,
      default: null,
    },
    transaction_date: Date,
    plan_object: {
      type: Schema.Types.Mixed,
      default: null,
    },
    userId: String,
  },
  MongooseDefaults,
);
transactionSchema.plugin(defaultPlugin);

const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema,
);
export const WalletTopUp = Transaction.discriminator<TransactionModel>(
  "WalletTopUp",
  transactionSchema,
);
export interface ProgramSponsoredTransactionModelProps
  extends TransactionModel {
  discoveryId: string;
}
export interface ProgramRefundedTransactionModelProps extends TransactionModel {
  sponsorId: string;
}
export const ProgramSponsoredTransaction =
  Transaction.discriminator<ProgramSponsoredTransactionModelProps>(
    "ProgramSponsoredTransaction",
    new Schema({
      discoveryId: {
        type: String,
        required: true,
      },
    }),
  );
export const ProgramRefundedTransaction =
  Transaction.discriminator<ProgramRefundedTransactionModelProps>(
    "ProgramRefundedTransaction",
    new Schema({
      sponsorId: {
        type: String,
        required: true,
      },
    }),
  );

transactionSchema.virtual("userDetails", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  match: {
    deleted: false,
  },
  justOne: true,
});
transactionSchema.virtual("walletDetails", {
  ref: "Wallet",
  localField: "walletId",
  foreignField: "_id",
  match: {
    deleted: false,
  },
  justOne: true,
});
export default Transaction;
