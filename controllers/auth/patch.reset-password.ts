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
  requireAuth: true,
  rules: {
    body: {
      oldPassword: {
        required: true,
        validate: Validator.isPasswordStrong,
        fieldName: "Old password",
      },
      newPassword: {
        required: true,
        validate: Validator.isPasswordStrong,
        fieldName: "New password",
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
    const { oldPassword, newPassword } = req.body;
    if(oldPassword === newPassword) return next(new RequestError(400, ERROR_MESSAGES.samePasswordCombination));

    const user = await userService.findOne(
      { _id: req?.user?.id },
      { includes: ["password"] },
    );

    if(!user) return next(new RequestError(400, ERROR_MESSAGES.userNotFound));

    const passwordIsValid = await passwordManager.comparePassword(oldPassword, user?.password);
    if(!passwordIsValid) return next(new RequestError(400, ERROR_MESSAGES.invalidPassword));

    const newPasswordHashed = await passwordManager.hashPassword(newPassword);

    await userService.updateOne(
      { _id: req?.user?.id },
      { password: newPasswordHashed },
    );

    sendSuccessResponse(res, next, {
      success: true,
    });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}

export default {
  method: "patch",
  url: "/auth/reset-password",
  handler: resetPasswordHandler,
  data,
};
