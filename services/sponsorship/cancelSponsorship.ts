import { sponsorshipService } from ".";
import { SponsorshipModel } from "../../mongoose/models/Sponsorship";
import { programRefundedTransactionService } from "../transaction/programRefunded";
import { walletService } from "../wallet";
import { cancelSponsorshipTransaction } from "./defaults";

export async function cancelSponsorship(
  sponsorShipId: string,
  userId: string,
  reason?: string,
  ip?: string
): Promise<SponsorshipModel | null> {
  if (userId && sponsorShipId) {
    const updated = await sponsorshipService.updateOne(
      {
        _id: sponsorShipId,
      },
      {
        cancelledBy: userId,
        cancelledAt: new Date(),
        status: "cancelled",
        cancellationReason: reason
      },
    );

    if (updated && updated.id) {
      await walletService.updateOne(
        { _id: updated?.walletId },
        { $inc: { availableBalance: updated?.sponsoredAmount / 100 } },
      );

      const cancelSponsorshipRefund = cancelSponsorshipTransaction(userId);
      await programRefundedTransactionService.create({
        sponsorId: updated.id,
        amount: updated.sponsoredAmount,
        channel: "OTHER",
        ...cancelSponsorshipRefund,
        walletId: updated.walletId,
        ip_address: ip

      });
    }
    // TODO: add a cancelled sponsorship email
    return updated;
  }
  return null;
}
