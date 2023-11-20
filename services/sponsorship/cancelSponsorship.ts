import { sponsorshipService } from ".";
import { SponsorshipModel } from "../../mongoose/models/Sponsorship";
import { walletService } from "../wallet";

export async function cancelSponsorship(
  sponsorShipId: string,
): Promise<SponsorshipModel | null> {
  const updated = await sponsorshipService.updateOne(
    {
      _id: sponsorShipId,
    },
    {
      isActive: false,
      status: "cancelled",
    },
  );
  await walletService.updateOne(
    { _id: updated?.walletId },
    { $inc: { availableBalance: (updated?.sponsoredAmount as number) / 100 } },
  );
  // TODO: add a cancelled sponsorship email
  // await programRefundedTransactionService.create({sponsorId: sponsorShipId, amount: updated.});
  return updated;
}
