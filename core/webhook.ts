import { ITransaction } from "../interfaces/transaction";
import { walletTopupService } from "../services/transaction/topup";
import { roundNumber } from "../utils";
import { walletService } from "../services/wallet";
import { emailSender } from "../services/email/EmailSender";
import { userService } from "../services/users";

export type PaystackWebhookEvent =
  | "charge.success"
  | "charge.failure"
  | "charge.daily.reconciliation"
  | "subscription.create"
  | "subscription.disable"
  | "subscription.enable"
  | "subscription.terminate";

export class PaystackWebhookHandler {
  async handleEvent(event: PaystackWebhookEvent, data: ITransaction) {
    switch (event) {
      case "charge.success":
        await this.handleChargeSuccess(data);
        break;
      case "charge.failure":
        await this.handleChargeFailure(data);
    }
  }
  private async handleChargeSuccess(data: ITransaction) {
    const reference = data.reference;
    await walletTopupService.updateOne(
      { reference },
      {
        ...data,
        amount: roundNumber(data.amount as number),
        fees: roundNumber(data.fees as number),
      },
    );
    await walletService.updateOne(
      { _id: data.metadata?.walletId, deleted: false },
      { $inc: { availableBalance: (data.amount as number) / 100 } },
    );

    const user = await userService.findOne({ email: data.customer?.email });
    const wallet = await walletService.findOne({
      _id: data.metadata?.walletId,
    });

    let walletNumbers =
      wallet?.type === "credit card"
        ? wallet.cardDetails.number
        : `0${wallet?.mobileMoneyDetails.phone.number}`;
    await emailSender.walletTopup({
      email: data.customer?.email,
      amount: roundNumber(data.amount as number),
      recipientName: user?.firstName as string,
      transactionDate: new Date(),
      transactionStatus: data.status as string,
      paymentMethod: determinePaymentMethod(data.authorization),
      paymentNumber: maskString(walletNumbers as string),
      transactionId: data.reference as string,
    });
  }
  private async handleChargeFailure(data: any) {
    // store data to db
    // send email
  }
}
function determinePaymentMethod(data?: Record<string, any>): string {
  if (!data || !Object.keys(data).length) return "";
  const channelArray = data.channel.split("_");
  return channelArray.includes("mobile")
    ? "Mobile Money"
    : channelArray.includes("card")
    ? `${data.channel}${data.card_type}`
    : "Unknown";
}
function maskString(inputString: string) {
  if (!inputString) return "";
  // Check if the inputString has a length of 10
  if (inputString.length === 10) {
    return (
      inputString.substring(0, 3) +
      inputString.substring(4, 9).replace(/./g, "*") +
      inputString.substring(8)
    );
  } else if (inputString.length > 10) {
    return (
      inputString.substring(0, 4) +
      inputString.substring(4, inputString.length - 3).replace(/./g, "*") +
      inputString.substring(inputString.length - 4)
    );
  }
  return inputString;
}
export const paystackWebhook = new PaystackWebhookHandler();
