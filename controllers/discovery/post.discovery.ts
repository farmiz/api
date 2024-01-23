/**
 * @api {POST} /discovery Create Discovery
 * @apiName Create Discovery
 * @apiGroup Discovery
 * @apiVersion 0.0.1
 * @apiDescription Endpoint used to create a discovery.
 *
 * @apiPermission authenticated (with "discovery" - "create" permission)
 * @apiSampleRequest https://staging-api.farmiz.co/v1
 *
 * @apiBody {String} name Name of the discovery.
 * @apiBody {String} duration.type Duration type of the discovery. should be one of these `day`,`month`, or `year`
 * @apiBody {String} duration.value Duration value of the discovery.
 * @apiBody {String} description Description of the discovery.
 * @apiBody {String[]} tags Tags associated with the discovery..
 * @apiBody {Number} amount Amount of the discovery.
 * @apiBody {Number} profitPercentage Profit percentage of the discovery.
 * @apiBody {String} riskLevel Risk level of the discovery. Should be one of: `high`, `moderate` or `low`
 * @apiBody {Date} startDate Start date of the discovery.
 * @apiBody {Date} endDate End date of the discovery.
 * @apiBody {Date} closingDate Closing date of the discovery.
 *
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
 *         "duration": {
 *          type: "month",
 *          value: 10
 *          },
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
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Invalid input data"
 *     }
 */

import { NextFunction, Response } from "express";
import { IData } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import { discoveryService } from "../../services/discovery";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { DiscoveryModel } from "../../mongoose/models/Discovery";
import { toNumber } from "lodash";
import validator from "validator";
const data: IData = {
  requireAuth: true,
  permission: ["discovery", "create"],
  rules: {
    body: {
      product: {
        required: true,
        fieldName: "Product",
        sanitize: validator.trim,
      },
      amount: {
        required: true,
        fieldName: "Amount",
        sanitize: toNumber,
      },
      duration: {
        required: true,
        fieldName: "Duration",
      },
      description: {
        required: true,
        fieldName: "Description",
        validate: [
          ({}, description: string) => description.length >= 3,
          "Description should be at least 3 chars long",
        ],
        sanitize: validator.trim,
      },
      tags: {
        required: true,
        fieldName: "Tags",
      },
      profitPercentage: {
        required: true,
        fieldName: "Profit percentage",
      },
      riskLevel: {
        required: true,
        fieldName: "Risk level",
      },
      startDate: {
        required: true,
        fieldName: "Start date",
      },
      endDate: {
        required: true,
        fieldName: "End date",
      },
    },
  },
};

async function createDiscoveryHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const discoveryCreated = await discoveryService.create({
      ...req.body,
      createdBy: req.user?.id,
    });


    sendSuccessResponse<DiscoveryModel>(
      res,
      next,
      {
        success: true,
        response: discoveryCreated,
      },
      201,
    );
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}

export default {
  method: "post",
  url: "/discoveries",
  data,
  handler: createDiscoveryHandler,
};
