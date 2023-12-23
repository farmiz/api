import { NextFunction, Response } from "express";
import { IPhone } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { hasValidPhone, validName, validatePermission } from "../../helpers";
import { Validator } from "../../mongoose/validators";
import { differenceInYears, parseISO } from "date-fns";
import { constructPermission } from "../../helpers/permissions/permissions";
import Permission from "../../mongoose/models/Permission";
import { buildPayloadUpdates } from "../../utils";
import { userService } from "../../services/users";
const data = {
  requireAuth: true,
  permission: ["users", "create"],
  rules: {
    body: {
      firstName: {
        required: false,
        validate: validName,
        fieldName: "First name",
      },
      lastName: {
        required: false,
        validate: validName,
        fieldName: "Last name",
      },
      username: {
        required: false,
        validate: validName,
        fieldName: "Username",
      },
      email: {
        required: false,
        fieldName: "Email",
        validate: Validator.isEmail,
      },
      phone: {
        required: false,
        validate: ({}, phone: IPhone) => hasValidPhone(phone),
        fieldName: "Phone",
      },
      dateOfBirth: {
        required: false,
        validate: ({}, date: string) =>
          !!(differenceInYears(new Date(), parseISO(date)) >= 18),
        fieldName: "Date of birth",
      },
      password: {
        required: false,
        fieldName: "Password",
        validate: Validator.isPasswordStrong,
      },
      userPermission: {
        required: false,
        validate: validatePermission,
      },
    },
  },
};

async function updateUserHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    let constructedPermission = "";
    if (
      req.body.userPermission &&
      Object.keys(req.body.userPermission).length
    ) {
      constructedPermission = constructPermission(req.body.userPermission);
    }

    const fieldsToUpdate = buildPayloadUpdates(req.body);
    const updatedUser = await userService.updateOne(
      { _id: id },
      {
        ...fieldsToUpdate,
        updatedBy: req.user?.id,
      },
    );

    if (constructedPermission) {
      await Permission.updateOne(
        { userId: id },
        {
          access: constructedPermission,
        },
      );
    }

    const response = {
      ...updatedUser,
    };
    sendSuccessResponse(res, next, { response, success: true });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}
export default {
  data,
  url: "/users/:id",
  handler: updateUserHandler,
  method: "put",
};
