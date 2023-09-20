import { defaultFrom } from "../utils";

export const walletUpTemplate = async (data: Record<string, any>) => ({
  from: defaultFrom(data.from),
  to: data.email,
  subject: `Wallet topup`,
  text: "Your farmiz wallet has been topped up",
  html: `Some cut message was here`,
});
