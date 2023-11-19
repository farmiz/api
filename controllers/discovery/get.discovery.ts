/**
 * @api {GET} /discovery Get Discoveries
 * @apiName Get Discoveries
 * @apiGroup Discovery
 * @apiVersion 0.0.1
 * @apiDescription Endpoint used to retrieve discoveries.
 *
 * @apiPermission authenticated user (with "discovery" - "read" permission)
 * @apiSampleRequest https://staging-api.farmiz.co/v1
 *
 * @apiSuccess {Boolean} success Indicates if the request was successful.
 * @apiSuccess {Object} response Response object containing discoveries.
 * @apiSuccess {Array} response.data List of discoveries.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "response": {
 *         "data": [
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
 *            ],
 *        "totalBalance": 20,
 *        "paginator": {
 *          "page": 2,
 *          "perPage": 50,
 *          "totalPages": 5
 *         }
 *       }
 *     }
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "Unauthorized access to the resource is denied"
 *     }
 */

import { AuthRequest } from "../../middleware";
import { NextFunction, Response } from "express";
import { IData } from "../../interfaces";
import { httpCodes } from "../../constants";
import { RequestError } from "../../helpers/errors";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { queryBuilder } from "../../utils";
import { ceil } from "lodash";
import { DiscoveryProps } from "../../interfaces/discovery";
import { discoveryService } from "../../services/discovery";

const data: IData = {
  requireAuth: true,
  permission: ["discovery", "read"],
};

const getDiscoveryHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    let { query } = req;

    const filter: Record<string, any> = {
      deleted: false,
    };

    const buildQuery = queryBuilder<DiscoveryProps>(query, [
      "amount",
      "description",
      "duration",
      "endDate",
      "name",
      "profitPercentage",
      "tags",
      "riskLevel",
    ]);
    buildQuery.filter = { ...buildQuery.filter, ...filter };

    const discoveries = await discoveryService.findMany(
      buildQuery.filter,
      null,
      null,
      buildQuery.options,
    );
    if (!discoveries) {
      return next(
        new RequestError(httpCodes.BAD_REQUEST.code, "No discoveries found"),
      );
    }
    const totalDocuments = await discoveryService.countDocuments(filter);
    const perPage = filter.perPage || 50;
    const response = {
      data: discoveries,
      paginator: {
        page: ceil(perPage / totalDocuments),
        perPage,
        totalPages: ceil(totalDocuments / perPage),
      },
    };
    sendSuccessResponse(res, next, {
      success: true,
      response,
    });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
};
export default {
  method: "get",
  url: "/discovery",
  data,
  handler: getDiscoveryHandler,
};
