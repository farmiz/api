import { Model } from "mongoose";
import { BaseService } from "..";
import  { TransactionModel, WalletTopup } from "../../mongoose/models/Transaction";

class WalletTopupTransactionService extends BaseService<TransactionModel> {
  protected readonly model: Model<TransactionModel>;

  constructor(model: Model<TransactionModel>) {
    super(model);
    this.model = model;
  }
}
export const walletTopupService = new WalletTopupTransactionService(WalletTopup);
