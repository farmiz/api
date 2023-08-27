import { IData } from "../../interfaces";

import { AuthRequest } from "../../middleware";
import { NextFunction, Response } from "express";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { walletService } from "../../services/wallet";
import { discoveryService } from "../../services/discovery";

const data: IData = {
  requireAuth: true,
  permission: ["discovery", "delete"],
  rules: {
    params: {
      id: { 
        required: true,
        authorize: discoveryService._exists
      },
    }
  },
};

const deleteSingleDiscoveryHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req;
    const data = {
      deletedBy: user?.id,
      deleted: true,
      deletedAt: new Date(),
    };

    const filter: Record<string, any> = {
      _id: req.params.id,
    };

    const deletedDiscovery = await walletService.updateOne(filter, data);
    sendSuccessResponse(res, next, {
      success: true,
      response: deletedDiscovery,
    });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
};

export default {
  method: "delete",
  url: "/:id/discovery",
  data,
  handler: deleteSingleDiscoveryHandler,
};
