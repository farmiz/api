import { NextFunction, Response } from "express";
import { IData } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { sponsorshipService } from "../../services/sponsorship";
import { RequestError } from "../../helpers/errors";

const data: IData = {
  requireAuth: true,
  permission: ["sponsorship", "read"],
};

async function getSingleSponsorHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    let filter: { id: string; userId?: string } = {
      id,
    };
    if (req.user?.role === "customer") {
      filter.userId = req.user.id;
    }
    
    const sponsorShip = await sponsorshipService.findOne(filter, null, {
      wallet: [],
      discovery: [],
      ...(["admin", "support"].includes(String(req.user?.role)) && {
        customer: [],
      }),
      growthStages: []
    });

    if (!sponsorShip) {
      return next(new RequestError(404, "Sponsorship not found"));
    }
    const response = {
      ...sponsorShip,
    };
    sendSuccessResponse(res, next, { response, success: true });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}
export default {
  data,
  url: "/sponsorships/:id",
  handler: getSingleSponsorHandler,
  method: "GET",
};
