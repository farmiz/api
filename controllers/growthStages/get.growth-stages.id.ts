import { NextFunction, Response } from "express";
import { IData } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { growthStagesService } from "../../services/growthStages";

const data: IData = {
  requireAuth: true,
  permission: ["growth-stages", "read"],
  rules: {
    params: {
      id: { required: true }
    },
  },
};

async function getSingleGrowthStageHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id = "" } = req.params;
    const response = await growthStagesService.findOne({
      _id: id,
      deleted: false,
    });
    sendSuccessResponse(res, next, { response, success: true });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}
export default {
  data,
  url: "/growth-stages/:id",
  handler: getSingleGrowthStageHandler,
  method: "get",
};
