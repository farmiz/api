import { Model } from "mongoose";
import { BaseService } from "..";
import Transaction, { TransactionModel } from "../../mongoose/models/Transaction";

class TransactionService extends BaseService<TransactionModel> {
  protected readonly model: Model<TransactionModel>;

  constructor(model: Model<TransactionModel>) {
    super(model);
    this.model = model;
  }
}
export const transactionService = new TransactionService(Transaction);
