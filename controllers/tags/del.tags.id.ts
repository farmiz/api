import { NextFunction, Response } from "express";
import { IData } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { tagsService } from "../../services/tags";

const data: IData = {
  requireAuth: true,
  permission: ["tags", "delete"],
  rules: {
    params: {
      id: { required: true },
    },
  },
};

async function deleteTagHandler(
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
    const response = await tagsService.updateOne({ _id: id }, fieldsToUpdate);
    sendSuccessResponse(res, next, { response, success: true });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}
export default {
  data,
  url: "/tags/:id",
  handler: deleteTagHandler,
  method: "delete",
};
