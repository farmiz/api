import { sponsorshipService } from ".";
import { SponsorshipModel } from "../../mongoose/models/Sponsorship";

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

  // TODO: add a transaction reversal worker
  // TODO: add a cancelled sponsorship email
  return updated;
}
