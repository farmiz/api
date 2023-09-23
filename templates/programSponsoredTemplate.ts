import { defaultFrom } from "../utils";


// TODO: REMEMBER TO ADD DISCOVERY DETAILS
export const walletDeductionTemplate = (data: Record<string, any>) => ({
  from: defaultFrom("payment"),
  to: data.email,
  subject: `Program sponsored`,
  text: "You have sponsored a program",
  html: `Some deduction message was here`,
});
