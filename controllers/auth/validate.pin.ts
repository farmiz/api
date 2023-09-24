/**
 * @api {POST} /auth/pin/validate Validate PIN
 * @apiSampleRequest https://staging-api.farmiz.co/v1
 * @apiName ValidatePIN
 * @apiGroup Auth
 * @apiVersion 0.0.1
 * @apiDescription Endpoint to validate a user's PIN code.
 * @apiSuccess {Boolean} success Indicates if the PIN is valid.
 * @apiSuccess {Object} response Response object with a success message.
 * @apiBody {String} code User's PIN code (4 characters).
 * @apiHeader {String} Authorization User's JWT token.
 * @apiHeaderExample {json} Header Example:
 *     {
 *       "Authorization": "Bearer YOUR_JWT_TOKEN"
 *     }
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "response": {
 *         "message": "Pin validated"
 *       }
 *     }
 * @apiErrorExample {json} Error Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "error": "Invalid pin"
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
import { httpCodes } from "../../constants";
interface Body {
  code: string;
}

import { AuthRequest } from "../../middleware";
import { pinService } from "../../services/auth/pin";
import { RequestError } from "../../helpers/errors";
import { passwordManager } from "../../helpers/auth/password";
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
async function validatePinHandler(
  req: AuthRequest<Body>,
  res: Response,
  next: NextFunction,
) {
  const {
    body: { code },
  } = req;
  try {
    const pin = await pinService.findOne({ userId: req.user?.id, deleted: false });

    const validPin = await passwordManager.comparePassword(
      code,
      pin?.code as string,
    );

    if (!validPin)
      return next(new RequestError(httpCodes.BAD_REQUEST.code, "Invalid pin"));
    sendSuccessResponse(res, next, {
      success: true,
      response: { message: "Pin validated" },
    });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}

export default {
  method: "post",
  url: "/auth/pin/validate",
  handler: validatePinHandler,
  data,
};
