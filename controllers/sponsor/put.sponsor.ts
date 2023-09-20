import { NextFunction, Response } from "express";
import { IData } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { cancelSponsorship } from "../../services/sponsorship/cancelSponsorship";

const data: IData = {
  requireAuth: true,
  permission: ["sponsor", "update"],
  rules: {
    params: {
      id: {
        required: true,
      },
    },
  },
};

async function updateSponsorShipHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const programCancelled = await cancelSponsorship(req.params.id);

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
  url: "/:id/sponsor/cancel",
  handler: updateSponsorShipHandler,
  method: "put",
};
