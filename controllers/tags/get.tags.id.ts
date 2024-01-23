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
  permission: ["tags", "read"],
  rules: {
    params: {
      id: { required: true },
    },
  },
};

async function getSingleTagHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id = "" } = req.params;
    const response = await tagsService.findOne({ _id: id, deleted: false });
    sendSuccessResponse(res, next, { response, success: true });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}
export default {
  data,
  url: "/tags/:id",
  handler: getSingleTagHandler,
  method: "get",
};
