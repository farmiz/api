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
  permission: ["tags", "update"],
  rules: {
    params: {
      id: { required: true },
    },
    body: {
      name: { required: true },
    },
  },
};

async function updateTagHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { name = "" } = req.body;
    const { id } = req.params;
    const data = {
      updatedAt: new Date(),
      updatedBy: req.user?.id
    };
    const response = await tagsService.updateOne({ _id: id }, { name, ...data });
    sendSuccessResponse(res, next, { response, success: true });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}
export default {
  data,
  url: "/tags/:id",
  handler: updateTagHandler,
  method: "put",
};
