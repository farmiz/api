import mongoose, { Schema } from "mongoose";
import { ITransaction } from "../../interfaces/transaction";
import { defaultPlugin } from "../utils";
import { IDefaultPlugin } from "../../interfaces";

export interface TransactionModel extends ITransaction, IDefaultPlugin {}
const transactionSchema = new Schema<TransactionModel>({
  domain: {
    type: String,
  },
  walletId: {
    type: String,
    ref: "Wallet"
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
});
transactionSchema.plugin(defaultPlugin);

const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema,
);
export const WalletTopup = Transaction.discriminator<TransactionModel>(
  "WalletTopup",
  transactionSchema,
);
export interface ProgramSponoredTransactionModelProps extends TransactionModel{
  discoveryId: string
}
export const ProgramSponoredTransaction = Transaction.discriminator<ProgramSponoredTransactionModelProps>(
  "ProgramSponoredTransaction",
  new Schema({
    discoveryId: {
      type: String, 
      required: true
    }
  }),
);

export default Transaction;
