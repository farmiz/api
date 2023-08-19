/**
 * @api {POST} /auth/pin Add PIN
 * @apiName AddPIN
 * @apiGroup Auth
 * @apiVersion 0.0.1
 * @apiDescription Endpoint to add a PIN to a user's account.
 * @apiSuccess {Boolean} success Indicates if the PIN was added successfully.
 * @apiSuccess {Object} response Response object containing the PIN data.
 * @apiBody {String} code User's PIN code (4 characters).
 * @apiHeader {String} Authorization User's JWT token.
 * @apiHeaderExample {json} Header Example:
 *     {
 *       "Authorization": "Bearer YOUR_JWT_TOKEN"
 *     }
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 201 CREATED
 *     {
 *       "success": true,
 *       "response": {}
 *     }
 * @apiErrorExample {json} Error Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "error": "Pin already exists"
 *     }
 * @apiErrorExample {json} Unauthorized:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "success": false,
 *       "error": "Unauthorized"
 *     }
 */

import { IData } from "../../interfaces";
import { NextFunction, Response } from "express";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import {  httpCodes } from "../../constants";
interface Body {
  code: string;
}

import { AuthRequest } from "../../middleware";
import { pinService } from "../../services/auth/pin";
import { RequestError } from "../../helpers/errors";
interface Body {
  email: string;
  password: string;
}
const data: IData = {
  requireAuth: true,
  rules: {
    body: {
      code: {
        required: true,
        validate: ({}, val: string) => val.length === 4,
      },
    },
  },
};
async function pinHandler(
  req: AuthRequest<Body>,
  res: Response,
  next: NextFunction,
) {
  const {
    body: { code },
  } = req;
  try {
    const pinExists = await pinService._exists({ userId: req.user?.id });

    if (pinExists)
      return next(
        new RequestError(httpCodes.BAD_REQUEST.code, "Pin already exists"),
      );
    const response = await pinService.create({
      userId: req.user?.id,
      createdBy: req.user?.id,
      code,
    });
    sendSuccessResponse(res, next, {
      success: true,
      response: {message: "Pin created"},
    }, httpCodes.CREATED.code);
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}

export default {
  method: "post",
  url: "/auth/pin",
  handler: pinHandler,
  data,
};
