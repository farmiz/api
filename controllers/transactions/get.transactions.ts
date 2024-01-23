import { NextFunction, Response } from "express";
import { IData } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { queryBuilder } from "../../utils";
import { ITransaction } from "../../interfaces/transaction";
import { transactionService } from "../../services/transaction";
import { ceil } from "lodash";

const data: IData = {
  requireAuth: true,
  permission: ["transaction", "read"],
};

async function getTransactionsHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    let { query } = req;
    const filter: Record<string, any> = {
      deleted: false,
    };

    if (req.user?.role === "customer") {
      filter.userId = req.user?.id;
    }
    const buildQuery = queryBuilder<ITransaction>(query, [
      "amount",
      "currency",
      "channel",
      "reference",
      "status",
      "paid_at",
      "fees",
      "created_at",
    ]);
    buildQuery.filter = { ...filter, ...buildQuery.filter };
    const transactions = await transactionService.findMany(
      buildQuery.filter,
      { includes: buildQuery.columns },
      { userDetails: ["firstName", "lastName", "email"] },
      buildQuery.options,
    );
    const totalDocuments = await transactionService.countDocuments(filter);
    const perPage = filter.perPage || 30;
    const response = {
      data: transactions,
      paginator: {
        page: buildQuery.options.page,
        perPage,
        totalPages: ceil(totalDocuments / perPage),
        totalDocuments,
      },
    };
    sendSuccessResponse(res, next, {
      success: true,
      response,
    });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}
export default {
  data,
  url: "/transactions",
  handler: getTransactionsHandler,
  method: "get",
};
