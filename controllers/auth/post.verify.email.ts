import { IData } from "../../interfaces";
import { NextFunction, Response } from "express";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { RATE_LIMITS } from "../../constants";
import { userService } from "../../services/users";
import { RequestError } from "../../helpers/errors";
import { AuthRequest } from "../../middleware";

const data: IData = {
  requestRateLimiter: RATE_LIMITS.refreshToken,
  requireAuth: true,
};
async function checkAuthHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user;

    if (!user) return next(new RequestError(401, "Unauthorized"));

    const authUser = await userService.findOne(
      { _id: user.id, deleted: false },
      { excludes: ["password"] },
      { permission: ["access"]},
    );

    if (!authUser) return next(new RequestError(401, "Unauthorized"));
    const response = {
      user: authUser,
      authorized: true,
    };

    sendSuccessResponse(res, next, {
      success: true,
      response,
    });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}

export default {
  method: "get",
  url: "/auth",
  handler: checkAuthHandler,
  data,
};
