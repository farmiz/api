import { renderEmailTemplate } from "../template";
import { defaultFrom } from "../utils";

export const walletTopUpTemplate = async (data: Record<string, any>) => {
  return {
    from: defaultFrom("PAYMENT"),
    to: data.email,
    subject: `WALLET TOPUP`,
    text: "Your farmiz wallet has been topped up",
    html: await renderEmailTemplate("walletTopup.ejs", data),
  };
}