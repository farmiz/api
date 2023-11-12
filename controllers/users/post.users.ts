import { NextFunction, Response } from "express";
import { IData, IPhone } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { IUser } from "../../interfaces/users";
import { hasValidPhone, validName, validatePermission } from "../../helpers";
import { Validator } from "../../mongoose/validators";
import { addHours, differenceInYears, parseISO } from "date-fns";
import { constructPermission } from "../../helpers/permissions/permissions";
import Permission from "../../mongoose/models/Permission";
import { createUser } from "../../services/auth/createUser";
import crypto from "crypto";

import { emailSender } from "../../services/email/EmailSender";
import Tokens, { TokenWithExpiration } from "../../mongoose/models/Tokens";
import { generateVerificationUrl } from "../../utils";
const data: IData<IUser> = {
  requireAuth: true,
  permission: ["users", "create"],
  rules: {
    body: {
      firstName: {
        required: true,
        validate: validName,
        fieldName: "First name",
      },
      lastName: {
        required: true,
        validate: validName,
        fieldName: "Last name",
      },
      username: {
        required: true,
        validate: validName,
        fieldName: "Username",
      },
      email: {
        required: true,
        fieldName: "Email",
        validate: Validator.isEmail,
      },
      phone: {
        required: true,
        validate: ({}, phone: IPhone) => hasValidPhone(phone),
        fieldName: "Phone",
      },
      dateOfBirth: {
        required: true,
        validate: ({}, date: string) =>
          !!(differenceInYears(new Date(), parseISO(date)) >= 18),
        fieldName: "Date of birth",
      },
      password: {
        required: true,
        fieldName: "Password",
        validate: Validator.isPasswordStrong,
      },
      permission: {
        required: true,
        validate: validatePermission,
      },
    },
  },
};

async function createUserHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const constructedPermission = constructPermission(req.body.permission);
    const { permission, ...rest } = req.body;

    const data = {
      ...rest,
      createdBy: req.user?.id,
    };
    const createdUser = await createUser(data);
    await Permission.create({
      access: constructedPermission,
      userId: createdUser.id,
    });

    const response = {
      ...createdUser,
    };
    sendSuccessResponse(res, next, { response, success: true });

    // send user created email
    const verifyAccountToken: TokenWithExpiration = {
      type: "signup",
      token: `mha_${crypto.randomBytes(60).toString("hex")}`,
      expiresAt: addHours(new Date(), 5),
    };
    await Tokens.create({
      tokens: verifyAccountToken,
      userId: createdUser.id,
    });
    const verificationUrl = generateVerificationUrl(verifyAccountToken);
    await emailSender.accountVerification({
      email: req.body.email,
      accountVerificationToken: verificationUrl,
      recipientName: req.body.firstName,
    });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}
export default {
  data,
  url: "/users",
  handler: createUserHandler,
  method: "post",
};
