import { NextFunction, Response } from "express";
import { IData } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { growthStagesService } from "../../services/growthStages";
import { sponsorshipService } from "../../services/sponsorship";

const data: IData = {
  requireAuth: true,
  permission: ["growth-stages", "create"],
  rules: {
    params: {
      sponsorshipId: {
        required: true,
      },
    },
    body: {
      level: { required: true },
      title: {
        required: true,
      },
      description: {
        required: true,
      },
      sponsorshipId: {
        required: true,
      },
    },
  },
};

async function createGrowthStageHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { level = "", title = "", description = "" } = req.body;
    const growthStage = await growthStagesService.create({
      description,
      level,
      title,
      createdBy: req.user?.id,
    });

    await sponsorshipService.updateOne(
      {
        _id: req.body.sponsorshipId,
      },
      {
        $push: {
          growthStagesIds:  growthStage._id,
        }
      },
    );

    sendSuccessResponse(res, next, { response: growthStage, success: true });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}
export default {
  data,
  url: "/growth-stages",
  handler: createGrowthStageHandler,
  method: "post",
};
