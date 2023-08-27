import { IData } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import { NextFunction, Response } from "express";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { httpCodes } from "../../constants";
import { RequestError } from "../../helpers/errors";
import { discoveryService } from "../../services/discovery";

const data: IData = {
  requireAuth: true,
  permission: ["discovery", "read"],
  rules: {
    params: {
      id: {
        required: true,
      },
    },
  },
};

const getSingleDiscoveryHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { params } = req;
    const filter: Record<string, any> = {
      _id: params.id,
      deleted: false,
    };

    const wallet = await discoveryService.findOne(filter);

    if (!wallet)
      return next(
        new RequestError(httpCodes.NOT_FOUND.code, "Discovery not found"),
      );

    sendSuccessResponse(res, next, {
      success: true,
      response: { ...wallet },
    });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
};

export default {
  method: "get",
  url: "/:id/discovery",
  data,
  handler: getSingleDiscoveryHandler,
};
