/**
 * @api {DELETE} /:id/discovery Get Discovery
 * @apiName Delete Discovery
 * @apiGroup Discovery
 * @apiVersion 0.0.1
 * @apiDescription Endpoint used to delete a single discovery.
 *
 * @apiPermission authenticated (with "discovery" - "delete" permission)
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
 *         "deleted": true
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
import { discoveryService } from "../../services/discovery";
import { discoveryExists } from "../../services/discovery/discoveryExists";
const data: IData = {
  requireAuth: true,
  permission: ["discovery", "delete"],
  rules: {
    params: {
      id: {
        required: true,
        validate: [
          async ({}, _id: string) => await discoveryExists(_id),
          "Discovery doesn't exist",
        ],
      },
    },
  },
};

const deleteSingleDiscoveryHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req;
    const data = {
      deletedBy: user?.id,
      deleted: true,
      deletedAt: new Date(),
    };

    const filter: Record<string, any> = {
      _id: req.params.id,
    };
    const deletedDiscovery = await discoveryService.updateOne(filter, data);
    sendSuccessResponse(res, next, {
      success: true,
      response: deletedDiscovery,
    });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
};

export default {
  method: "delete",
  url: "/discoveries/:id",
  data,
  handler: deleteSingleDiscoveryHandler,
};
