/**
 * @api {POST} /auth/register Register
 * @apiName Register
 * @apiGroup Auth
 * @apiVersion 0.0.1
 * @apiDescription Endpoint used to register a new client.
 *
 * @apiPermission anyone
 * @apiSampleRequest https://staging-api.farmiz.co/v1
 *
 * @apiBody {String} email User's email.
 * @apiBody {String} password User's password.
 * @apiBody {String="customer"} [role] User's role (default: "customer").
 * @apiBody {String} username User's username.
 * @apiBody {String} firstName User's first name.
 * @apiBody {String} LastName User's last name.
 * @apiBody {Object} phone User's phone details.
 * @apiBody {String} phone.prefix Phone number prefix.
 * @apiBody {String} phone.number Phone number.
 * @apiBody {String} phone.country Phone number country code.
 * @apiBody {Date} dateOfBirthday User's date of birth (format: YYYY-MM-DD).
 *
 * @apiSuccess {Boolean} success Indicates if the request was successful.
 * @apiSuccess {Object} response Response object containing user data.
 * @apiSuccess {Object} response.token Token object containing access token.
 * @apiSuccess {String} response.token.accessToken Access token.
 * @apiSuccess {String} response.email User's email.
 * @apiSuccess {Object} response.phone User's phone details.
 * @apiSuccess {String} response.phone.prefix Phone number prefix.
 * @apiSuccess {String} response.phone.number Phone number.
 * @apiSuccess {String} response.phone.country Phone number country code.
 * @apiSuccess {String} response.role User's role.
 * @apiSuccess {String} response.status User's status.
 * @apiSuccess {String} response.username User's username.
 * @apiSuccess {String} response.firstName User's first name.
 * @apiSuccess {String} response.lastName User's last name.
 * @apiSuccess {String} response.dateOfBirth User's date of birth.
 * @apiSuccess {Boolean} response.deleted Indicates if the user is deleted.
 * @apiSuccess {String} response.createdAt User's creation date.
 * @apiSuccess {String} response.updatedAt User's last update date.
 * @apiSuccess {String} response.id User's unique ID.
 * @apiSuccess {Object} response.permission User's permission details.
 * @apiSuccess {String} response.permission.access User's access permissions.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 CREATED
 *     {
 *       "success": true,
 *       "response": {
 *         "token": {
 *           "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDljZjZlMzVlYTA1OTQ5OTZkMzZiYTYiLCJpYXQiOjE2ODgwMDg0MTksImV4cCI6MzM3NjAxNjg0NX0.dE-A_Snj93z67VbL_aoxeowif6CQQr6gTRO8ve_Fuuo"
 *         },
 *         "email": "Joyce_Spencer@yahoo.com",
 *         "phone": {
 *           "prefix": 233,
 *           "number": 245245245,
 *           "country": "GH"
 *         },
 *         "role": "orgAdmin",
 *         "status": "pendingApproval",
 *         "username": "gob3developer",
 *         "firstName": "Ben",
 *         "lastName": "Yoo",
 *         "dateOfBirth": "1956-09-12",
 *         "deleted": false,
 *         "createdAt": "2023-06-29T03:13:39.052Z",
 *         "updatedAt": "2023-06-29T03:13:39.052Z",
 *         "id": "649cf6e35ea0594996d36ba6",
 *         "permission": {
 *           "access": "-./0"
 *         }
 *       }
 *     }
 *
 * @apiError {String} error Error message.
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 BAD REQUEST
 *     {
 *       "success": false,
 *       "response": {
 *         "message": "{Field} Required"
 *       }
 *     }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 BAD REQUEST
 *     {
 *       "success": false,
 *       "response": {
 *         "message": "User already exists"
 *       }
 *     }
 *
 */

// The rest of your code remains unchanged

import { IData, IPhone } from "../../interfaces";
import { NextFunction, Response } from "express";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { generateTokens } from "../../helpers/auth/jwt";
import { DEFAULT_USER_PERMISSION, RATE_LIMITS, httpCodes } from "../../constants";
import { createUser } from "../../services/auth/createUser";
import { userService } from "../../services/users";
import { Validator } from "../../mongoose/validators";
import Permission from "../../mongoose/models/Permission";
import { UserRole } from "../../interfaces/users";
import { AuthRequest } from "../../middleware";
import { constructPermission } from "../../helpers/permissions/permissions";
import { RequestError } from "../../helpers/errors";
import { hasValidPhone, validName } from "../../helpers";
import { differenceInYears, parseISO } from "date-fns";
import { TokenWithExpiration } from "../../mongoose/models/Tokens";
import { generateVerificationUrl } from "../../utils";
import { emailSender } from "../../services/email/EmailSender";

interface Body {
  email: string;
  password: string;
  role: UserRole;
  username: string;
  firstName: string;
  LastName: string;
  phone: IPhone;
  dateOfBirthday: Date;
}

const data: IData = {
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
    },
  },
  requestRateLimiter: RATE_LIMITS.register,
};
async function registerHandler(
  req: AuthRequest<Body>,
  res: Response,
  next: NextFunction,
) {
  const {
    body: { email = "", role = "customer", username = "", phone },
  } = req;
  try {
    const filter = {
      $or: [{ email }, { username }, { phone: { ...phone, country: "GH" } }],
    };

    const user = await userService.findOne({ ...filter, deleted: false });

    if (user) {
      if (user.email === email)
        return next(
          new RequestError(400, `User with email ${email} already exists`),
        );

      if (user.username === username)
        return next(
          new RequestError(
            400,
            `User with username ${username} already exists`,
          ),
        );

      if (user.phone?.number === req.body.phone.number)
        return next(
          new RequestError(
            400,
            `User with phone 0${user.phone.number} already exists`,
          ),
        );
    }

    const createdUser = await createUser({
      ...req.body,
    });

    const constructedPermission = constructPermission(DEFAULT_USER_PERMISSION);

    // store user permission
    const createdPermission = await Permission.create({
      access: constructedPermission,
      userId: createdUser.id,
    });
    createdUser.permission = {
      access: createdPermission.access,
    };

    const {
      password: userPassword,
      id,
      email: userEmail,
      ...rest
    } = createdUser;
    const tokens = await generateTokens(
      { email, role, id, username },
      "signup",
    );

    const userResponse = { ...rest, id, email };
    const response = {
      accessToken: tokens.accessToken,
      ...userResponse,
    };

    res.cookie("refresh", tokens.refreshToken[0], {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 60 * 60 * 1000),
      sameSite: "none",
    });

    const verifyAccountToken = tokens.verifyAccountToken;
    const verificationUrl = generateVerificationUrl(
      verifyAccountToken as TokenWithExpiration,
    );
    // Send Email
    await emailSender.accountVerification({
      email,
      accountVerificationToken: verificationUrl,
      recipientName: req.body.firstName
    });
    sendSuccessResponse(
      res,
      next,
      {
        success: true,
        response,
      },
      httpCodes.CREATED.code,
    );
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}

export default {
  method: "post",
  url: "/auth/register",
  handler: registerHandler,
  data,
};
