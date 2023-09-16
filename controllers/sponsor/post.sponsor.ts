import { NextFunction, Response } from "express";
import { IData } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { discoveryService } from "../../services/discovery";
import { RequestError } from "../../helpers/errors";
import { httpCodes } from "../../constants";
import { differenceInDays } from "date-fns";
import { createSponsorship } from "../../services/sponsorship/createSponsorship";
import { sponsorshipService } from "../../services/sponsorship";
import { assert } from "../../helpers/asserts";
import { walletService } from "../../services/wallet";
import { SponsorshipModel } from "../../mongoose/models/Sponsorship";

const data: IData = {
  requireAuth: true,
  permission: ["wallet", "create"],
  rules: {
    body: {
      discoveryId: {
        required: true,
        async validate({}, discoveryId: string) {
          return await discoveryService._exists({ _id: discoveryId });
        },
        fieldName: "Discovery",
      },
      walletId: {
        required: true,
        async validate({}, walletId: string) {
          return await walletService._exists({ _id: walletId });
        },
        fieldName: "Wallet",
      },
    },
  },
};

async function createSponsorshipHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = String(req.user?.id);
    const discoveryId = req.body.id;
    const discovery = await discoveryService.findOne({_id: discoveryId, deleted: false});

    if (!discovery) {
      return next(
        new RequestError(httpCodes.NOT_FOUND.code, "Discovery not found"),
      );
    }

    const walletBalance = await walletService.findOne({
      _id: req.body.walletId,
    });
    if (!walletBalance) {
      return next(
        new RequestError(httpCodes.NOT_FOUND.code, "Wallet not found"),
      );
    }

    const amountOnWallet = walletBalance.availableBalance;
    if (differenceInDays(discovery.endDate, new Date()) < 0) {
      return next(
        new RequestError(
          httpCodes.BAD_REQUEST.code,
          "This discovery is no longer open for sponsorship",
        ),
      );
    }

    if (!amountOnWallet || amountOnWallet < discovery.amount) {
      return next(
        new RequestError(
          httpCodes.BAD_REQUEST.code,
          "Not enough wallet balance",
        ),
      );
    }

    const hasSponsoredProgram = await sponsorshipService.findOne({
      userId,
      discoveryId,
      isActive: true,
    });
    if (hasSponsoredProgram) {
      assert(false, "Programmed is already sponsored by you");
    }
    const programSponsored = await createSponsorship(
      req,
      discovery,
      req.body.walletId,
    );

    const response = {
     ...programSponsored
    };
    sendSuccessResponse<Partial<SponsorshipModel>>(res, next, {
      response,
      success: true,
    });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}

export default {
  data,
  url: "/sponsor",
  handler: createSponsorshipHandler,
  method: "post",
};
