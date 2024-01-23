import { NextFunction, Response } from "express";
import { IData } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { cancelSponsorship } from "../../services/sponsorship/cancelSponsorship";
import { sponsorshipService } from "../../services/sponsorship";
import { differenceInDays } from "date-fns";
import { RequestError } from "../../helpers/errors";

const data: IData = {
  requireAuth: true,
  permission: ["sponsorship", "update"],
  rules: {
    params: {
      id: {
        required: true,
      },
      userId: {
        required: (req: AuthRequest) => !(req.user?.role !== "customer"),
      },
      reason: {
        required: false
      }
    },
  },
};

async function cancelSponsorShipHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId = "", id = "" } = req.params;

    const sponsorship = await sponsorshipService.findOne({ _id: id });

    // Avoid cancellation of sponsorship if it's more than 7 days
    if (sponsorship && sponsorship.createdAt) {
      if (differenceInDays(new Date(), sponsorship.createdAt) >= 7) {
        return next(
          new RequestError(
            400,
            "Cannot cancel sponsorship after 7 days of creating it",
          ),
        );
      }
    }

    const programCancelled = await cancelSponsorship(id, userId, req.body.reason, req.ip);

    const response = {
      ...programCancelled,
    };
    sendSuccessResponse(res, next, { response, success: true });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}
export default {
  data,
  url: "/sponsorships/:id/cancel",
  handler: cancelSponsorShipHandler,
  method: "put",
};
