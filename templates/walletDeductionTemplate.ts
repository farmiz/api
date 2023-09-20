import { defaultFrom } from "../utils";

export const walletDeductionTemplate = async(data: Record<string, any>) => ({
  from: defaultFrom(data.from),
  to: data.email,
  subject: `Wallet deduction`,
  text: "Your farmiz wallet has been deducted",
  html: `Some deduction message was here`,
});
