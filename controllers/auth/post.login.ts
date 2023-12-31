/**
 * @api {POST} /auth/login Login
 * @apiName Login
 * @apiGroup Auth
 * @apiVersion 0.0.1
 * @apiDescription Endpoint use to login 
 * @apiSuccess {Object} response User Data
 * @apiPermission anyone
 * @apiSampleRequest https://staging-api.farmiz.co/v1
 * @apiBody {String} email  User's email
 * @apiBody {String} password  User's password
 * @apiSuccessExample {json}
    Success-Response:
 *  HTTP/1.1 200 OK
 * {
 * "success":true,
 * "response": {}
 * }
 * @apiError InvalidCredentials The details email and password of the user doesn't match  
 */

import { IData } from "../../interfaces";
import { NextFunction, Response } from "express";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { generateTokens } from "../../helpers/auth/jwt";
import { RATE_LIMITS } from "../../constants";
import { userService } from "../../services/users";
import { passwordManager } from "../../helpers/auth/password";
interface Body {
  email: string;
  password: string;
}
import { ERROR_MESSAGES } from "../../constants";
import { RequestError } from "../../helpers/errors";
import { AuthRequest } from "../../middleware";
import { farmizLogger } from "../../core/logger";
import { addDays } from "date-fns";
interface Body {
  email: string;
  password: string;
}
const data: IData = {
  requireAuth: false,
  rules: {
    body: {
      email: {
        required: true,
      },
      password: {
        required: true,
      },
    },
  },
  requestRateLimiter: RATE_LIMITS.login,
};
async function loginHandler(
  req: AuthRequest<Body>,
  res: Response,
  next: NextFunction,
) {
  const {
    body: { email, password },
  } = req;
  try {
    const user = await userService.findOne({ email, deleted: false }, null, {
      permission: ["access"],
    });

    if (!user)
      return next(new RequestError(400, ERROR_MESSAGES.wrongCombination));

    const hasValidPassword = await passwordManager.comparePassword(
      password,
      user.password,
    );
    if (!hasValidPassword)
      return next(new RequestError(400, ERROR_MESSAGES.wrongCombination));

    const { password: userPassword, ...userData } = user;

    const tokens = await generateTokens({
      email: userData.email,
      id: userData.id,
      role: userData.role,
    });
    const response = {
      accessToken: tokens.accessToken,
      user: userData,
    };
    res.cookie("refreshAuthToken", "", { expires: new Date(0) });
    res.cookie("refreshAuthToken", tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      expires: addDays(new Date(), 10),
      sameSite: "none",
      path: "/",
    });

    sendSuccessResponse(res, next, {
      success: true,
      response,
    });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
    farmizLogger.log("error", "refreshTokenHandler", error.message, {
      body: { ...req.body },
    });
  }
}

export default {
  method: "post",
  url: "/auth/login",
  handler: loginHandler,
  data,
};
