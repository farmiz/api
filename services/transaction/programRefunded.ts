import { Model } from "mongoose";
import { BaseService } from "..";
import {
  ProgramRefundedTransaction,
  ProgramRefundedTransactionModelProps
} from "../../mongoose/models/Transaction";

class ProgramRefundedTransactionService extends BaseService<ProgramRefundedTransactionModelProps> {
  protected readonly model: Model<ProgramRefundedTransactionModelProps>;

  constructor(model: Model<ProgramRefundedTransactionModelProps>) {
    super(model);
    this.model = model;
  }
}
export const programRefundedTransactionService = new ProgramRefundedTransactionService(
  ProgramRefundedTransaction,
);
