import { sponsorshipService } from ".";
import { AuthRequest } from "../../middleware";
import { DiscoveryModel } from "../../mongoose/models/Discovery";
import { SponsorshipModel } from "../../mongoose/models/Sponsorship";
import { emailSender } from "../email/EmailSender";
import { walletService } from "../wallet";

export const createSponsorship = async (
  req: AuthRequest,
  discovery: DiscoveryModel,
  wallettId: string,
): Promise<Partial<SponsorshipModel>> => {
  const discoveryId = discovery.id;
  const session = await sponsorshipService.session;
  let programSponsored: Partial<SponsorshipModel>= {};
  try {
    session.startTransaction();

     programSponsored = await sponsorshipService.create({
      userId: String(req.user?.id),
      discoveryId,
      endDate: discovery.endDate,
      estimatedProfitPercentage: discovery.profitPercentage,
      isActive: true,
      sponsoredAmount: discovery.amount,
      startDate: discovery.startDate,
    });

    const amountDeducted = await walletService.updateOne(
      { _id: wallettId, deleted: false },
      { $inc: { availableBalance: -discovery.amount } },
    );

    if (amountDeducted && programSponsored) {

      await emailSender.programSponsored({
        discoveryId: String(discoveryId),
        email: String(req.user?.email),
      });
      session.commitTransaction();
    }
  } catch (error) {
    session.abortTransaction();
  } finally {
    session.abortTransaction();
  }
  return programSponsored;
};
