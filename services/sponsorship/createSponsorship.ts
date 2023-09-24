import { sponsorshipService } from ".";
import { AuthRequest } from "../../middleware";
import { DiscoveryModel } from "../../mongoose/models/Discovery";
import { SponsorshipModel } from "../../mongoose/models/Sponsorship";
import { ProgramSponoredTransaction } from "../../mongoose/models/Transaction";
import { emailSender } from "../email/EmailSender";
import { walletService } from "../wallet";
import { v4 as uuid } from "uuid";
export const createSponsorship = async (data: {
  req: AuthRequest;
  discovery: DiscoveryModel;
  walletId: string;
  walletType: "mobile money" | "credit card";
}): Promise<Partial<SponsorshipModel>> => {
  const { req, discovery, walletId, walletType } = data;
  const discoveryId = discovery.id;
  const session = await sponsorshipService.session;
  let programSponsored: Partial<SponsorshipModel> = {};
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
      walletId,
      delayDays: req.body.delayDays
    });

    const amountDeducted = await walletService.updateOne(
      { _id: walletId, deleted: false },
      { $inc: { availableBalance: -discovery.amount } },
    );

    if (amountDeducted && programSponsored) {
      await ProgramSponoredTransaction.create({
        amount: discovery.amount,
        channel: walletType,
        fees: 0,
        reference: uuid(),
        paid_at: new Date(),
        transaction_date: new Date(),
        status: "success",
        currency: "GHS",
        ip_address: req.ip,
        walletId,
        discoveryId,
      });
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
