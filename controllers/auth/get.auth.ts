/**
 * @api {GET} /auth Auth
 * @apiName Authenticate
 * @apiGroup Auth
 * @apiVersion 0.0.1
 * @apiDescription Endpoint use to check if a user is logged
 * @apiSuccess {Object} response User Data
 * @apiPermission anyone
 * @apiSuccessExample {json}
    Success-Response:
 *  HTTP/1.1 200 OK
 * {
 * "success":true,
 * "response": {}
 * }
 * @apiError Unauthorized You're unauthorized
 * @apiErrorExample {json}
 * Error-Response:
 * HTTP/1.1 401 UNAUTHORIZED
 * {
 * "success":false,
 * "response": {}
 * }
 */
import { IData } from "../../interfaces";
import { NextFunction, Response } from "express";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { userService } from "../../services/users";
import { RequestError } from "../../helpers/errors";
import { AuthRequest } from "../../middleware";
import { farmizLogger } from "../../core/logger";

const data: IData = {
  requireAuth: true,
};
async function checkAuthHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user;

    if (!user) return next(new RequestError(401, "Unauthorized"));

    const authUser = await userService.findOne(
      { _id: user.id, deleted: false },
      { excludes: ["password"] },
      { permission: ["access"] },
    );

    if (!authUser) return next(new RequestError(404, "Not Found"));

    const response = {
      user: authUser,
      authorized: true,
    };

    sendSuccessResponse(res, next, {
      success: true,
      response,
    });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
    farmizLogger.log("error", "checkAuthHandler",  error.message)
  }
}

export default {
  method: "get",
  url: "/auth",
  handler: checkAuthHandler,
  data,
};
