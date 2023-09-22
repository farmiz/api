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
      "tokens.refreshToken": { $in: [refreshAuthToken] },
    });

    if (!token) return next(new RequestError(code));
    const refreshToken = token.tokens.refreshToken;
    const refreshTokenIsActive =
      refreshToken[refreshToken.length - 1];
    if (refreshAuthToken !== refreshTokenIsActive)
      return next(new RequestError(code));

    const verifyToken = tokenService.verifyRefreshToken(refreshAuthToken);
    if (!verifyToken) return next(new RequestError(code));

    const user = (await userService.findOne({
      _id: token.userId,
    })) as UserModel;

    if (!!user && Object.keys(user).length && !user?.email)
      return next(new RequestError(403, "Forbidden"));

    const { email, id, role } = user;

    const newGeneratedTokens = await generateTokens({ email, id, role });

    res.cookie("refreshAuthToken", newGeneratedTokens.refreshToken[0], {
      httpOnly: true,
      secure: true,
      expires: new Date(Date.now() + 60 * 60 * 1000),
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
  }
}

export default {
  method: "get",
  url: "/auth/refresh",
  handler: refreshTokenHandler,
  data,
};
