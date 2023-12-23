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
  permission: ["tags", "create"],
  rules: {
    body: {
      name: { required: true },
    },
  },
};

async function createTagHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { name = "" } = req.body;
    const response = await tagsService.create({
      name,
      createdBy: req.user?.id
    });
    sendSuccessResponse(res, next, { response, success: true });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}
export default {
  data,
  url: "/tags",
  handler: createTagHandler,
  method: "post",
};
