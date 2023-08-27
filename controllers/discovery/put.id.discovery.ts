/**
 * @api {PUT} /api/:id/discovery Update Discovery
 * @apiName Update Discovery
 * @apiGroup Discovery
 * @apiVersion 0.0.1
 * @apiDescription Endpoint used to update a discovery.
 *
 * @apiPermission authenticated (with "discovery" - "update" permission)
  * @apiSampleRequest https://staging-api.farmiz.co
 *
 * @apiParam {String} id Id of the discovery.
 * @apiBody {String} [duration] Duration of the discovery.
 * @apiBody {String} [duration] Duration of the discovery.
 * @apiBody {String} [description] Description of the discovery.
 * @apiBody {String[]} [tags] Tags associated with the discovery..
 * @apiBody {Number} [amount] Amount of the discovery.
 * @apiBody {Number} [profitPercentage] Profit percentage of the discovery.
 * @apiBody {String} [riskLevel] Risk level of the discovery. Should be one of: `high`, `moderate` or `low`
 * @apiBody {Date} [startDate] Start date of the discovery.
 * @apiBody {Date} [endDate] End date of the discovery.
 * @apiBody {Date} [closingDate] Closing date of the discovery.
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
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Invalid input data"
 *     }
 */

import { IData } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import { NextFunction, Response } from "express";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { buildPayloadUpdates } from "../../utils";
import { discoveryService } from "../../services/discovery";
import { hasValidLength } from "../../helpers";

const data: IData = {
  requireAuth: true,
  permission: ["discovery", "update"],
  rules: {
    params: {
      id: {
        required: true,
        authorize: discoveryService._exists,
      },
    },
    body: {
        name: {
          required: false,
          fieldName: "Name",
          validate: [
            ({}, name: string) => hasValidLength(name, 3),
            "Name should be at least 3 chars long",
          ],
        },
        duration: {
          required: false,
          fieldName: "Duration",
        },
        description: {
          required: false,
          fieldName: "Description",
          validate: [
            ({}, name: string) => hasValidLength(name, 3),
            "Description should be at least 3 chars long",
          ],
        },
        tags: {
          required: false,
          fieldName: "Tags",
        },
        amount: {
          required: false,
          fieldName: "Amount",
        },
        profitPercentage: {
          required: false,
          fieldName: "Profit percentage",
        },
        riskLevel: {
          required: false,
          fieldName: "Risk level",
        },
        startDate: {
          required: false,
          fieldName: "Start date",
        },
        endDate: {
          required: false,
          fieldName: "End date",
        },
        closingDate: {
          required: false,
          fieldName: "Closing date",
        },
      },
  },
};

const updateSingleWalletHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { params } = req;

    const filter: Record<string, any> = {
      _id: params.id,
      deleted: true,
    };

    const fieldsToUpdate = buildPayloadUpdates(req.body);
    const discovery = await discoveryService.updateOne(filter, fieldsToUpdate);

    sendSuccessResponse(res, next, {
      success: true,
      response: discovery,
    });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
};

export default {
  method: "put",
  url: "/:id/discovery",
  data,
  handler: updateSingleWalletHandler,
};
