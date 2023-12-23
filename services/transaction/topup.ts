import { Model } from "mongoose";
import { BaseService } from "..";
import  { TransactionModel, WalletTopUp } from "../../mongoose/models/Transaction";

class WalletTopUpTransactionService extends BaseService<TransactionModel> {
  protected readonly model: Model<TransactionModel>;

  constructor(model: Model<TransactionModel>) {
    super(model);
    this.model = model;
  }
}
export const walletTopUpService = new WalletTopUpTransactionService(WalletTopUp);
