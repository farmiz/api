import { sponsorshipService } from ".";
import { DiscoveryModel } from "../../mongoose/models/Discovery";
import { walletService } from "../wallet";

export const createSponsorship = async (
  userId: string,
  discovery: DiscoveryModel,
  wallettId: string,
): Promise<boolean> => {
  const session = await sponsorshipService.session;
  let programSponsored: boolean = false;
  try {
    session.startTransaction();

    const sponsored = await sponsorshipService.create({
      userId,
      discoveryId: discovery._id,
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

    if (amountDeducted && sponsored) {
      programSponsored = true;
      // send email
      session.commitTransaction();
    }
  } catch (error) {
    session.abortTransaction();
  } finally {
    session.abortTransaction();
  }
  return programSponsored;
};
