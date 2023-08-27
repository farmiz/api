/**
 * @api {POST} /api/wallet/:id/topup/mobile-money Top Up Wallet with Mobile Money
 * @apiName Wallet topup via mobile money
 * @apiGroup Wallet
 * @apiVersion 0.0.1
 * @apiDescription Endpoint used to top up a wallet using mobile money.
 *
 * @apiPermission authenticated (with "wallet" - "create" permission)
 * @apiSampleRequest https://staging-api.farmiz.co
 *
 * @apiParam {String} id ID of the wallet to be topped up.
 *
 * @apiBody {Number} amount Amount to top up.
 *
 * @apiSuccess {Boolean} success Indicates if the request was successful.
 * @apiSuccess {Object} response Response data.
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
 *       "error": "Invalid wallet ID"
 *     }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Invalid top-up amount"
 *     }
 */

import { IData } from "../../interfaces";
import { NextFunction, Response } from "express";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { RATE_LIMITS, httpCodes } from "../../constants";
import { AuthRequest } from "../../middleware";
import { walletService } from "../../services/wallet";
import { paystack } from "../../core/paystack";
import {
  BaseChargeResponse,
  ChargeWithMobileMoneyPayload,
  TransactionResponse,
} from "paystackly";
import { mobileMoneyWalletService } from "../../services/wallet/mobileMoney";
import { RequestError } from "../../helpers/errors";
import { walletTopupService } from "../../services/transaction/topup";
import { v4 as uuid } from "uuid";
const data: IData = {
  requireAuth: true,
  permission: ["wallet", "create"],
  rules: {
    body: {
      amount: {
        required: true,
        validate({}, arg: number) {
          return arg !== 0;
        },
      },
    },
    params: {
      id: {
        authorize: async (req: AuthRequest, id: string) =>
          await walletService._exists({
            _id: id,
            userId: req.user?.id,
          }),
      },
    },
  },
  requestRateLimiter: RATE_LIMITS.addWallet,
};
async function topupWalletWithMomoHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const reference = uuid();
    const wallet = await mobileMoneyWalletService.findOne({
      _id: req.params.id,
    });
    const chargePayload: ChargeWithMobileMoneyPayload = {
      amount: req.body.amount,
      email: req.user?.email as string,
      mobile_money: {
        phone: "0" + wallet?.mobileMoneyDetails.phone.number,
        provider: wallet?.mobileMoneyDetails.network as string,
      },
      reference,
      metadata: {
        walletId: wallet?.id,
      },
    };

    const result: BaseChargeResponse | TransactionResponse =
      await paystack.charges.chargeWithMobileMoney(chargePayload);

    if (!result.status)
      return next(new RequestError(httpCodes.BAD_REQUEST.code, result.message));
    await walletTopupService.create({
      amount: req.body.amount,
      userId: req.user?.id,
      reference,
      walletId: wallet?.id,
    });
    sendSuccessResponse(res, next, {
      success: true,
      response: { ...result.data },
    });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}

export default {
  method: "post",
  url: "/wallet/:id/topup/mobile-money",
  handler: topupWalletWithMomoHandler,
  data,
};
