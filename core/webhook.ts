import { ITransaction } from "../interfaces/transaction";
import { walletTopupService } from "../services/transaction/topup";
import { roundNumber } from "../utils";
import { walletService } from "../services/wallet";
import { emailSender } from "../services/email/EmailSender";

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
      {_id: data.metadata?.walletId, deleted: false},
     {$inc: {availableBalance: data.amount as number / 100}},
    );

    // send email
    await emailSender.walletTopup({
      email: data.customer?.email,
      amount: roundNumber(data.amount as number),
    });
  }
  private async handleChargeFailure(data: any) {
    // store data to db
    // send email
  }
}

export const paystackWebhook = new PaystackWebhookHandler();
