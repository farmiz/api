import { sponsorshipService } from ".";
import { AuthRequest } from "../../middleware";
import { DiscoveryModel } from "../../mongoose/models/Discovery";
import { SponsorshipModel } from "../../mongoose/models/Sponsorship";
import { ProgramSponsoredTransaction } from "../../mongoose/models/Transaction";
import { emailSender } from "../email/EmailSender";
import { walletService } from "../wallet";
import { v4 as uuid } from "uuid";
import { convertDiscoveryDuration } from "./convertDiscoveryDuration";
import { addDays } from "date-fns";
export const createSponsorship = async (data: {
  req: AuthRequest;
  amount: number;
  discovery: DiscoveryModel;
  walletId: string;
  walletType: "mobile money" | "credit card";
}): Promise<Partial<SponsorshipModel>> => {
  const { req, discovery, walletId, walletType, amount } = data;
  const { closingDate, duration, id } = discovery;
  const discoveryId = id;
  const session = await sponsorshipService.session;
  let programSponsored: Partial<SponsorshipModel> = {};
  try {
    session.startTransaction();

    const convertedDiscoveryDuration = convertDiscoveryDuration(duration);
    programSponsored = await sponsorshipService.create({
      userId: String(req.user?.id),
      discoveryId,
      endDate: addDays(closingDate, convertedDiscoveryDuration + 10),
      status: "active",
      sponsoredAmount: amount,
      startDate: closingDate,
      walletId,
      delayDays: 10,
    });

    const amountDeducted = await walletService.updateOne(
      { _id: walletId, deleted: false },
      { $inc: { availableBalance: -discovery.amount } },
    );

    if (amountDeducted && programSponsored) {
      await ProgramSponsoredTransaction.create({
        amount: amount,
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
        userId: req.user?.id,
      });
      if (discoveryId && req.user?.email) {
        await emailSender.programSponsored({
          discoveryId: discoveryId,
          email: req.user?.email,
        });
      }
      session.commitTransaction();
    }
  } catch (error) {
    session.abortTransaction();
  } finally {
    session.abortTransaction();
  }
  return programSponsored;
};
