import { Response, NextFunction } from "express";

import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";

import { userService } from "../../services/users";

import { IData } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import { tokenService } from "../../helpers/auth/jwt";
import { generateVerificationUrl } from "../../utils";
import Tokens, { TokenWithExpiration } from "../../mongoose/models/Tokens";
import { emailSender } from "../../services/email/EmailSender";
import { RequestError } from "../../helpers/errors";
import { httpCodes } from "../../constants";

const data: IData = {
  requireAuth: false,
  rules: {
    query: {
      token: {
        required: true,
        fieldName: "Token",
      },
      type: {
        required: true,
        fieldName: "Type",
      },
    },
  },
};

async function resetPasswordHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { token = "", type } = req.query;

    if (!type || type !== "recovery")
      return next(
        new RequestError(
          httpCodes.BAD_REQUEST.code,
          "Unable to verify account",
        ),
      );

    const tokenVerified = await tokenService.verifyEmailRecoveryToken(
      token as string,
    );
    if (!tokenVerified)
      return next(
        new RequestError(
          httpCodes.BAD_REQUEST.code,
          "Unable to verify account",
        ),
      );
    sendSuccessResponse<{ message: string }>(res, next, {
      success: true,
      response: {
        message: "Token verified",
      },
    });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}

export default {
  method: "patch",
  url: "/auth/password-recovery",
  handler: resetPasswordHandler,
  data,
};
