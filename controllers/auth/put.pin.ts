/**
 * @api {PUT} /auth/pin Update PIN
 * @apiName UpdatePIN
 * @apiGroup Auth
 * @apiVersion 0.0.1
 * @apiSampleRequest https://staging-api.farmiz.co/v1
 * @apiDescription Endpoint to update a user's PIN code.
 * @apiSuccess {Boolean} success Indicates if the PIN was updated successfully.
 * @apiSuccess {Object} response Response object with a success message.
 * @apiBody {String} oldCode User's current PIN code (4 characters).
 * @apiBody {String} newCode User's new PIN code (4 characters).
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
 *         "message": "Pin updated successfully"
 *       }
 *     }
 * @apiErrorExample {json} Error Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "error": "Pin Code cannot be the same"
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
interface Body {
  oldCode: string;
  newCode: string;
}

import { AuthRequest } from "../../middleware";
import { pinService } from "../../services/auth/pin";
import { assert } from "../../helpers/asserts";
import { passwordManager } from "../../helpers/auth/password";
const data: IData = {
  requireAuth: true,
  rules: {
    body: {
      oldCode: {
        required: true,
        validate: ({}, val: string) => val.length === 4,
        fieldName: "Current Code",
      },
      newCode: {
        required: true,
        validate: ({}, val: string) => val.length === 4,
        fieldName: "New Code",
      },
    },
  },
};
async function pinUpdateHandler(
  req: AuthRequest<Body>,
  res: Response,
  next: NextFunction,
) {
  const {
    body: { oldCode, newCode },
  } = req;
  try {
    assert(!(newCode === oldCode), "Pin Code cannot be the same");
    const hashedPin = await passwordManager.hashPassword(newCode);
    await pinService.updateOne({ userId: req.user?.id }, { code: hashedPin });

    sendSuccessResponse(res, next, {
      success: true,
      response: {
        message: "Pin updated successfully",
      },
    });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}

export default {
  method: "put",
  url: "/auth/pin",
  handler: pinUpdateHandler,
  data,
};
