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
import { RequestError } from "../../helpers/errors";
import { ERROR_MESSAGES } from "../../constants";

const data: IData = {
  requireAuth: false,
  rules: {
    body: {
      password: {
        required: true,
        validate: Validator.isPasswordStrong,
        fieldName: "Old password",
      },
      confirmPassword: {
        required: true,
        validate: Validator.isPasswordStrong,
        fieldName: "New password",
      },
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
    const { password, confirmPassword, email } = req.body;
    if (confirmPassword === password)
      return next(
        new RequestError(400, ERROR_MESSAGES.samePasswordCombination),
      );

    const user = await userService.findOne({ email, deleted: false });

    if (!user) return next(new RequestError(400, ERROR_MESSAGES.userNotFound));

    const newPasswordHashed = await passwordManager.hashPassword(password);

    await userService.updateOne({ email }, { password: newPasswordHashed });

    sendSuccessResponse(res, next, {
      success: true,
    });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}

export default {
  method: "put",
  url: "/auth/reset-password",
  handler: resetPasswordHandler,
  data,
};
