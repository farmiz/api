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
  permission: ["growth-stages", "update"],
  rules: {
    params: {
      id: { required: true },
    },
    body: {
      level: { required: true },
      title: {
        required: true,
      },
      description: {
        required: true,
      },
    },
  },
};

async function updateGrowthStagesHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { title = "", description = "", level } = req.body;
    const { id } = req.params;
    const data = {
      updatedBy: req.user?.id,
      updatedAt: new Date(),
      title,
      description,
      level,
    };
    const growthStage = await growthStagesService.updateOne(
      { _id: id },
      { ...data },
    );

    sendSuccessResponse(res, next, { response: growthStage, success: true });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}
export default {
  data,
  url: "/growth-stages/:id",
  handler: updateGrowthStagesHandler,
  method: "put",
};
