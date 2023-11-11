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
import { differenceInYears, parseISO } from "date-fns";
import { constructPermission } from "../../helpers/permissions/permissions";
import Permission from "../../mongoose/models/Permission";
import { buildPayloadUpdates } from "../../utils";
import { userService } from "../../services/users";
const data: IData<IUser> = {
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
      permission: {
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
    if (req.body.permission && Object.keys(req.body.permission).length) {
      constructedPermission = constructPermission(req.body.permission);
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
      await Permission.create({
        access: constructedPermission,
        userId: id,
      });
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
  url: "/:id/users",
  handler: updateUserHandler,
  method: "put",
};
