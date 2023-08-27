/**
 * @api {DELETE} /api/:walletId/wallet Delete Single Wallet
 * @apiName DeleteSingleWallet
 * @apiGroup Wallet
 * @apiVersion 0.0.1
 * @apiDescription Endpoint used to delete a single wallet by its ID.
 *
 * @apiPermission authenticated user (with "wallet" and "delete" permission)
 * @apiSampleRequest https://staging-api.farmiz.co
 *
 * @apiParam {String} walletId The unique ID of the wallet to be deleted.
 * @apiParam {String} [userId] Optional user ID of the wallet owner (if different from the authenticated user). Required for non-customer users.
 *
 * @apiSuccess {Boolean} success Indicates if the request was successful.
 * @apiSuccess {Object} response Response object indicating the deleted wallet.
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
 *         // ... other updated fields
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
 *       "error": "User ID is required for non-customer users"
 *     }
 *
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

const data: IData = {
  requireAuth: true,
  permission: ["wallet", "delete"],
  rules: {
    params: {
      walletId: { 
        required: true,
        authorize: walletService.canViewDocument,
      },
    },
    body: {
      userId: {
        required: (req: AuthRequest) => !(req.user?.role !== "customer"),
      },
    },
  },
};

const deleteSingleWalletHandler = async (
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
    if (req.user?.role !== "customer") {
      filter.userId = req.body.userId;
    }
    const deletedWallet = await walletService.updateOne(filter, data);
    sendSuccessResponse(res, next, {
      success: true,
      response: deletedWallet,
    });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
};

export default {
  method: "delete",
  url: "/:walletId/wallet",
  data,
  handler: deleteSingleWalletHandler,
};
