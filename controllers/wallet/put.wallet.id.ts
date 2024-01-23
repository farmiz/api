/**
 * @api {PUT} /:id/wallet Update Single Wallet
 * @apiName UpdateSingleWallet
 * @apiGroup Wallet
 * @apiVersion 0.0.1
 * @apiDescription Endpoint used to update a single wallet by its ID.
 *
 * @apiPermission authenticated user (with "wallet" and "read" permission)
 * @apiSampleRequest https://staging-api.farmiz.co/v1/v1
 *
 * @apiParam {String} id The unique ID of the wallet to be updated.
 *
 * @apiBody {String} [status] New status for the wallet (e.g., "active", "inactive", "suspended").
 * @apiBody {String} [primary] Wallet should be primary wallet.
 *
 * @apiSuccess {Boolean} success Indicates if the request was successful.
 * @apiSuccess {Object} response Response object containing the updated wallet data.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "response": {
 *         "id": "43e25a93-c89e-4c98-8fcb-71f230498ec1",
 *         "userId": "a3a9477b-b9b9-468c-9f3d-9de03297ebfd",
 *         "phone": {
 *           "prefix": "233",
 *           "number": "200000000",
 *           "country": "GH"
 *         },
 *         "network": "MTN",
 *         "type": "mobile money",
 *         "availableBalance": 0,
 *         "primary": true,
 *         "createdAt": "2020-04-21T03:32:05.615754Z",
 *         "deletedAt": "2020-04-21T03:32:05.615754Z",
 *         "deleted": false,
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
 *       "error": "Wallet not found"
 *     }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Invalid status provided"
 *     }
 */

// The rest of your code remains unchanged

import { IData } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import { NextFunction, Response } from "express";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { walletService } from "../../services/wallet";
import { buildPayloadUpdates } from "../../utils";
import { WalletStatus } from "../../interfaces/wallet";
import { walletStatuses } from "../../mongoose/models/Wallet";

const data: IData = {
  requireAuth: true,
  permission: ["wallet", "update"],
  rules: {
    params: {
      id: {
        required: true,
        authorize: walletService.walletExists,
      },
    },
    body: {
      status: {
        required: false,
        authorize: ({}, status: WalletStatus) =>
          walletStatuses.includes(status),
      },
      primary: {
        required: false
      }
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

    if (req.user?.role === "customer") {
      filter.userId = req.user.id;
    }
    const fieldsToUpdate = buildPayloadUpdates(req.body);
    const wallet = await walletService.updateOne(filter, fieldsToUpdate);

    sendSuccessResponse(res, next, {
      success: true,
      response: { ...wallet },
    });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
};

export default {
  method: "put",
  url: "/wallets/:id",
  data,
  handler: updateSingleWalletHandler,
};
