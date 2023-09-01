/**
 * @api {GET} /api/wallets Get Wallets
 * @apiName GetWallets
 * @apiGroup Wallet
 * @apiVersion 0.0.1
 * @apiDescription Endpoint used to retrieve wallets.
 *
 * @apiPermission authenticated user (with "wallet" and "read" permission)
 * @apiSampleRequest https://farmiz.onrender.com
 *
 * @apiSuccess {Boolean} success Indicates if the request was successful.
 * @apiSuccess {Object} response Response object containing wallets.
 * @apiSuccess {Array} response.data List of wallets.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "response": {
 *         "data": [
 *         "id": "43e25a93-c89e-4c98-8fcb-71f230498ec1",
 *         "userId": "a3a9477b-b9b9-468c-9f3d-9de03297ebfd",
 *         "phone": {
 *           "prefix": "233",
 *           "number": "200000000",
 *           "country": "GH"
 *         },
 *         "network": "MTN",
 *         "type": "mobile money",
 *         "availableBalance": 20,
 *         "primary": true,
 *         "createdAt": "2020-04-21T03:32:05.615754Z",
 *         "deletedAt": "2020-04-21T03:32:05.615754Z",
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

import { NextFunction, Response } from "express";
import { IData } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import { httpCodes } from "../../constants";
import { RequestError } from "../../helpers/errors";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { queryBuilder } from "../../utils";
import { walletService } from "../../services/wallet";
import { IWallet } from "../../interfaces/wallet";
import { ceil } from "lodash";

const data: IData = {
  requireAuth: true,
  permission: ["wallet", "read"],
};

const getWalletsHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    let { query } = req;

    const filter: Record<string, any> = {
      deleted: false,
    };
    if (req.user?.role === "customer") {
      filter.userId = req.user.id;
    }
    const buildQuery = queryBuilder<IWallet>(query, [
      "status",
      "type",
      "primary",
      "availableBalance",
    ]);
    buildQuery.filter = { ...buildQuery.filter, ...filter };

    const wallets = await walletService.findMany(
      buildQuery.filter,
      null,
      null,
      buildQuery.options,
    );
    if (!wallets) {
      return next(
        new RequestError(httpCodes.BAD_REQUEST.code, "No wallet found"),
      );
    }
    const totalDocuments = await walletService.countDocuments();
    const perPage = filter.perPage || 50;
    
    const response = {
      data: wallets,
      totalBalance: wallets
        .map(wa => wa.availableBalance)
        .reduce((acc = 0, inc = 0) => acc + inc, 0),
      paginator: {
        page: totalDocuments,
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
  url: "/wallets",
  data,
  handler: getWalletsHandler,
};
