import { IData } from "../../interfaces";
import { NextFunction, Request, Response } from "express";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { generateTokens, tokenService } from "../../helpers/auth/jwt";
import { RATE_LIMITS, httpCodes } from "../../constants";
import { userService } from "../../services/users";
import Tokens from "../../mongoose/models/Tokens";
import { RequestError } from "../../helpers/errors";
import { UserModel } from "../../mongoose/models/Users";
import { farmizLogger } from "../../core/logger";
import { addDays } from "date-fns";
const data: IData = {
  requestRateLimiter: RATE_LIMITS.refreshToken,
};
async function refreshTokenHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const cookies = req.cookies;
    const { code } = httpCodes.FORBIDDEN;
    if (!cookies?.refreshAuthToken) return next(new RequestError(code));
    const refreshAuthToken = cookies.refreshAuthToken;
    const token = await Tokens.findOne({
      "tokens.refreshToken": refreshAuthToken,
    });

    if (!token) return next(new RequestError(code));
    const refreshToken = token.tokens.refreshToken;

    const verifyToken = tokenService.verifyRefreshToken(refreshToken);
    if (!verifyToken) return next(new RequestError(code));

    const user = (await userService.findOne(
      {
        _id: token.userId,
      },
      {
        excludes: ["password"],
      },
      {
        permission: ["access"],
      }
    )) as UserModel;

    if (!!user && Object.keys(user).length && !user?.email)
      return next(new RequestError(403, "Forbidden"));

    const { email, id, role } = user;

    const newGeneratedTokens = await generateTokens({ email, id, role });
    res.cookie("refreshAuthToken", "", { expires: new Date(0) });
    res.cookie("refreshAuthToken", newGeneratedTokens.refreshToken, {
      httpOnly: true,
      secure: true,
      expires: addDays(new Date(), 10),
      sameSite: "none",
      path: "/",
    });

    const response = {
      accessToken: newGeneratedTokens.accessToken,
      user,
    };
    sendSuccessResponse(res, next, {
      success: true,
      response,
    });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
    farmizLogger.log("error", "refreshTokenHandler", error.message);
  }
}

export default {
  method: "get",
  url: "/auth/refresh",
  handler: refreshTokenHandler,
  data,
};
