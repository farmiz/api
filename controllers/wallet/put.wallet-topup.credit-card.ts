/**
 * @api {POST} /api/wallet/:id/topup/credit-card Top Up Wallet with Credit Card
 * @apiName TopUpWalletWithCreditCard
 * @apiGroup Wallet
 * @apiVersion 0.0.1
 * @apiDescription Endpoint used to top up a wallet using a credit card.
 *
 * @apiPermission authenticated user
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
 *       "response": {}
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
import { ChargeWithCardPayload } from "paystackly";
import { creditCardWalletService } from "../../services/wallet/creditCard";
import { walletTopupService } from "../../services/transaction/topup";
import { RequestError } from "../../helpers/errors";
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
async function topupWalletWithCardHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const reference = uuid();
    const wallet = await creditCardWalletService.findOne({
      _id: req.params.id,
    });

    const chargePayload: ChargeWithCardPayload = {
      amount: req.body.amount,
      email: req.user?.email as string,
      card: {
        cvv: String(wallet?.cardDetails.cvv),
        expiry_month: String(wallet?.cardDetails.expiry_month),
        expiry_year: String(wallet?.cardDetails.expiry_year),
        number: String(wallet?.cardDetails.number),
      },
      reference,
      metadata: {
        walletId: wallet?.id,
      },
    };

    const result = await paystack.charges.chargeWithCard(chargePayload);

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
      response: {
        ...result.data,
      },
    });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}

export default {
  method: "post",
  url: "/wallet/:id/topup/credit-card",
  handler: topupWalletWithCardHandler,
  data,
};
