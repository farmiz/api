import { IData } from "../../interfaces";

import { AuthRequest } from "../../middleware";
import { NextFunction, Response } from "express";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { userService } from "../../services/users";
import { RequestError } from "../../helpers/errors";

const data: IData = {
  requireAuth: true,
  permission: ["users", "read"],
  rules: {
    params: {
      id: {
        required: true,
        // authorize: userService.canViewDocument,
      },
    },
  },
};

const getSingleUserHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const filter: Record<string, any> = {
      _id: req.params.id,
    };

    const user = await userService.findOne(filter);
    if (!user) return next(new RequestError(404, "User not found"));

    sendSuccessResponse(res, next, {
      success: true,
      response: user,
    });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
};

export default {
  method: "get",
  url: "/users/:id",
  data,
  handler: getSingleUserHandler,
};
