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
  permission: ["growth-stages", "delete"],
  rules: {
    params: {
      id: { required: true },
    },
  },
};

async function deleteGrowthStageHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const fieldsToUpdate = {
      deleted: true,
      deletedBy: req.user?.id,
      deletedAt: new Date(),
    };
    const { id } = req.params;
    const response = await growthStagesService.updateOne(
      { _id: id },
      fieldsToUpdate,
    );
    if (response && response.deleted) {
      await sponsorshipService.updateOne(
        {
          growthStagesIds: { $in: [response._id] },
        },
        {
          $pull: {
            growthStagesIds: response._id,
          },
        },
      );
    }
    sendSuccessResponse(res, next, { response, success: true });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}
export default {
  data,
  url: "/growth-stages/:id",
  handler: deleteGrowthStageHandler,
  method: "delete",
};
