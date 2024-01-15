
import { ProgramRefundedTransactionModelProps } from "../../mongoose/models/Transaction";
import { v4 as uuid } from "uuid";
export const cancelSponsorshipTransaction = (
  userId: string,
): Omit<ProgramRefundedTransactionModelProps, "sponsorId"> => {
  return {
    currency: "GHS",
    createdAt: new Date(),
    createdBy: userId,
    fees: 0,
    channel: "other",
    status: "success",
    userId: userId,
    reference: uuid()
  };
};
