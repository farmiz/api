import { Response, NextFunction } from "express";

import { passwordManager } from "../../helpers/auth/password";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";

import { userService } from "../../services/users";

import { IData } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import { Validator } from "../../mongoose/validators";
import { tokenService } from "../../helpers/auth/jwt";
import { generateVerificationUrl } from "../../utils";
import { TokenWithExpiration } from "../../mongoose/models/Tokens";
import { emailSender } from "../../services/email/EmailSender";

const data: IData = {
  requireAuth: false,
  rules: {
    body: {
      email: {
        required: true,
        validate: Validator.isEmail,
        fieldName: "Email",
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
    const { email } = req.body;

    const user = await userService.findOne({ email });

    if (user) {
      const tokenCreated = await tokenService.createEmailRecoveryToken(
        user.id as string,
      );
      const recoveryLink = generateVerificationUrl(
        tokenCreated?.tokens.emailRecoveryToken as TokenWithExpiration,
      );
      await emailSender.accountPasswordRecovery({email, recoveryLink})
    }
    sendSuccessResponse<{ message: string }>(res, next, {
      success: true,
      response: {
        message:
          "You should receive a recovery email if the email provided was registered with us",
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
