/**
 * @api {GET} /:id/discovery Get Discovery
 * @apiName Get Discovery
 * @apiGroup Discovery
 * @apiVersion 0.0.1
 * @apiDescription Endpoint used to get a single discovery.
 *
 * @apiPermission authenticated (with "discovery" - "read" permission)
  * @apiSampleRequest https://staging-api.farmiz.co/v1
 *
 * @apiParam {String} id Id of the discovery.
 * @apiSuccess {Boolean} success Indicates if the request was successful.
 * @apiSuccess {Object} response Created discovery data.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "response": {
 *         "id": "43e25a93-c89e-4c98-8fcb-71f230498ec1",
 *         "name": "Sample Discovery",
 *         "duration": "2 weeks",
 *         "description": "A sample discovery",
 *         "tags": ["sample", "example"],
 *         "amount": 1000,
 *         "profitPercentage": 10,
 *         "riskLevel": "low",
 *         "startDate": "2023-08-27T00:00:00Z",
 *         "endDate": "2023-09-10T00:00:00Z",
 *         "closingDate": "2023-08-31T00:00:00Z",
 *         "deleted": false
 *       }
 *     }
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "Unauthorized access to the resource is denied"
 *     }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "Discovery not found"
 *     }
 */

import { IData } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import { NextFunction, Response } from "express";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { httpCodes } from "../../constants";
import { RequestError } from "../../helpers/errors";
import { discoveryService } from "../../services/discovery";

const data: IData = {
  requireAuth: true,
  permission: ["discovery", "read"],
  rules: {
    params: {
      id: {
        required: true
      },
    },
  },
};

const getSingleDiscoveryHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { params } = req;
    const filter: Record<string, any> = {
      _id: params.id,
      deleted: false,
    };

    const discovery = await discoveryService.findOne(filter);

    if (!discovery)
      return next(
        new RequestError(httpCodes.NOT_FOUND.code, "Discovery not found"),
      );

    sendSuccessResponse(res, next, {
      success: true,
      response: { ...discovery },
    });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
};

export default {
  method: "get",
  url: "/:id/discovery",
  data,
  handler: getSingleDiscoveryHandler,
};
