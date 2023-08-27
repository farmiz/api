/**
 * @api {GET} /api/:id/wallet Get Single Wallet
 * @apiName GetSingleWallet
 * @apiGroup Wallet
 * @apiVersion 0.0.1
 * @apiDescription Endpoint used to retrieve a single wallet by its ID.
 *
 * @apiPermission authenticated user (with "wallet" - "read" permission)
 * @apiSampleRequest https://staging-api.farmiz.co
 *
 * @apiParam {String} id The unique ID of the wallet.
 *
 * @apiSuccess {Boolean} success Indicates if the request was successful.
 * @apiSuccess {Object} response Response object containing the wallet data.
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
 */

// The rest of your code remains unchanged

import { IData } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import { NextFunction, Response } from "express";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { httpCodes } from "../../constants";
import { RequestError } from "../../helpers/errors";
import { walletService } from "../../services/wallet";

const data: IData = {
  requireAuth: true,
  permission: ["wallet", "read"],
  rules: {
    params: {
      id: {
        required: true,
      },
    },
  },
};

const getSingleWalletHandler = async (
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

    if (req.user?.role === "customer") {
      filter.userId = req.user.id;
    }

    const wallet = await walletService.findOne(filter);

    if (!wallet)
      return next(
        new RequestError(httpCodes.NOT_FOUND.code, "Wallet not found"),
      );

    sendSuccessResponse(res, next, {
      success: true,
      response: { ...wallet },
    });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
};

export default {
  method: "get",
  url: "/:id/wallet",
  data,
  handler: getSingleWalletHandler,
};
