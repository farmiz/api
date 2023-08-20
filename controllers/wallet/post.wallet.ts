/**
 * @api {POST} /api/wallet Create Wallet
 * @apiName Wallet
 * @apiGroup Wallet
 * @apiVersion 0.0.1
 * @apiDescription Endpoint used to add a wallet.
 *
 * @apiPermission anyone
 * @apiSampleRequest https://farmiz.onrender.com
 *
 * @apiBody {String} type Type of wallet. Should be one of: `mobile money` or `credit card`.
 * @apiBody {Object} mobileMoneyDetails Mobile money details (required if type is "mobile money").
 * @apiBody {String} mobileMoneyDetails.network Network type. Should be one of: "MTN", "VOD", "ATL".
 * @apiBody {Object} mobileMoneyDetails.phone Phone details.
 * @apiBody {String} mobileMoneyDetails.phone.prefix Prefix of the phone number.
 * @apiBody {String} mobileMoneyDetails.phone.number Phone number.
 * @apiBody {String} [mobileMoneyDetails.phone.country] Country code of the phone number.
 * @apiBody {Boolean} [primary] Indicates if the wallet is primary (default: false).
 *
 * @apiSuccess {Boolean} success Indicates if the request was successful.
 * @apiSuccess {Object} response Wallet data.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "response": {
 *         "id": "43e25a93-c89e-4c98-8fcb-71f230498ec1",
 *         "userId": "a3a9477b-b9b9-468c-9f3d-9e03297ebfd",
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
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Invalid wallet type"
 *     }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Account verification failed"
 *     }
 */

// The rest of your code remains unchanged

import { IData } from "../../interfaces";
import { NextFunction, Response } from "express";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { RATE_LIMITS, httpCodes } from "../../constants";
import { AuthRequest } from "../../middleware";
import {
  IWallet,
  TCreditCardWallet,
  TMobileMoneyWallet,
  WalletPayload,
  WalletType,
} from "../../interfaces/wallet";
import { paystack } from "../../core/paystack";
import { CardBINResponse, ResolveAccountResponse } from "paystackly";
import { extractWalletData, getNetworkBaseOnNumber } from "../../utils";
import { RequestError } from "../../helpers/errors";
import { BankCodes } from "paystackly/dist/types";
import { walletTypes } from "../../mongoose/models/Wallet";
import { mobileMoneyWalletService } from "../../services/wallet/mobileMoney";
import {
  hasValidCreditCardDetails,
  hasValidMobileMoneyDetails,
} from "../../helpers";
import { assert } from "../../helpers/asserts";
import { creditCardWalletService } from "../../services/wallet/creditCard";

const data: IData = {
  requireAuth: true,
  permission: ["wallet", "create"],
  rules: {
    body: {
      type: {
        required: true,
        validate: ({}, type: WalletType) => [
          walletTypes.includes(type),
          "Invalid wallet type. Wallet type should be mobile money or credit card",
        ],
        fieldName: "Wallet type",
      },
      status: {
        required: false,
      },
      mobileMoneyDetails: {
        required: (req: AuthRequest) => !!(req.body.type === "mobile money"),
        validate: (
          req: AuthRequest,
          data: TMobileMoneyWallet["mobileMoneyDetails"],
        ) =>
          req.body.type !== "mobile money"
            ? true
            : hasValidMobileMoneyDetails(data),
        fieldName: "Mobile money details",
      },
      cardDetails: {
        required: (req: AuthRequest) => req.body.type === "credit card",
        validate: (req: AuthRequest, data: TCreditCardWallet["cardDetails"]) =>
          req.body.type !== "credit card"
            ? true
            : hasValidCreditCardDetails(data),
        fieldName: "Card details",
      },
      primary: {
        required: false,
      },
    },
  },
  requestRateLimiter: RATE_LIMITS.addWallet,
};
async function createWalletHandler(
  req: AuthRequest<WalletPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const walletData = req.body;

    if (!["mobile money", "credit card"].includes(walletData.type))
      return next(
        new RequestError(httpCodes.BAD_REQUEST.code, "Invalid wallet type"),
      );

    let accountVerified: ResolveAccountResponse | CardBINResponse = {
      message: "",
      status: false,
    };
    let dataToStore: IWallet | null = null;
    let response;
    if (walletData.type === "mobile money") {
      const bankCode = getNetworkBaseOnNumber(
        walletData.mobileMoneyDetails.phone.number,
      ) as BankCodes;

      assert(bankCode, "Invalid phone number");
      const account_number = `0${walletData.mobileMoneyDetails.phone.number}`;
      accountVerified = await paystack.verification.resolveAccount({
        account_number,
        bank_code: bankCode,
      });
      if (accountVerified.status === true) {
        dataToStore = extractWalletData(
          walletData,
          req.user?.id as string,
          accountVerified.data,
        );
        response = await mobileMoneyWalletService.create({
          ...(dataToStore as TMobileMoneyWallet),
          createdBy: req.user?.id,
        });
      }
    } else if (walletData.type === "credit card") {
      const binNumber = walletData.cardDetails.number.substring(0, 6);
      accountVerified = await paystack.verification.verifyCardBIN({
        binNumber,
      });

      if (accountVerified.status === true) {
        dataToStore = extractWalletData(
          walletData,
          req.user?.id as string,
          accountVerified.data,
        );
        response = await creditCardWalletService.create({
          ...(dataToStore as TCreditCardWallet),
          createdBy: req.user?.id,
        });
      }
    } else
      throw next(
        new RequestError(httpCodes.BAD_REQUEST.code, "Invalid wallet type"),
      );

    if (accountVerified.status === false) {
      return next(
        new RequestError(httpCodes.BAD_REQUEST.code, "Invalid wallet details"),
      );
    }

    sendSuccessResponse(
      res,
      next,
      {
        success: true,
        response,
      },
      httpCodes.CREATED.code,
    );
    // send wallet created email
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}

export default {
  method: "post",
  url: "/wallet",
  handler: createWalletHandler,
  data,
};
