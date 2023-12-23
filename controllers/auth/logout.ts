import { IData } from "../../interfaces";
import { NextFunction, Response } from "express";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { userService } from "../../services/users";
import { RequestError } from "../../helpers/errors";
import { AuthRequest } from "../../middleware";
import { farmizLogger } from "../../core/logger";
import Tokens from "../../mongoose/models/Tokens";

const data: IData = {
  requireAuth: true,
};
async function logoutHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user;

    if (!user) return next(new RequestError(401, "Unauthorized"));

    const authUser = await userService.findOne({
      _id: user.id,
      deleted: false,
    });

    if (!authUser) return next(new RequestError(404, "Not Found"));

    await Tokens.deleteMany({ userId: authUser.id });
    res.clearCookie("refreshAuthToken");
    const response = {
      message: "Logged out successfully",
    };
    req.user = null;

    sendSuccessResponse(res, next, {
      success: true,
      response,
    });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
    farmizLogger.log("error", "logoutHandler", error.message);
  }
}

export default {
  method: "get",
  url: "/logout",
  handler: logoutHandler,
  data,
};
