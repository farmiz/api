import { NextFunction, Response } from 'express';
  import { IData } from '../../interfaces';
  import { AuthRequest } from '../../middleware';
  import { sendFailedResponse, sendSuccessResponse } from '../../helpers/requestResponse';
import { queryBuilder } from '../../utils';
import { ITransaction } from '../../interfaces/transaction';
import { transactionService } from '../../services/transaction';
import { RequestError } from '../../helpers/errors';
import { httpCodes } from '../../constants';
import { ceil } from 'lodash';
  
  const data: IData = {
    requireAuth: true,
    permission: ["transaction", "read"]
  };
  
  async function getTransactionsHandler(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      let { query } = req;

      const filter: Record<string, any> = {
        deleted: false,
        userId: req.user?.id
      };
      const buildQuery = queryBuilder<ITransaction>(query, [
        "amount",
       "transaction_date",
       "walletId",
       "status",
       "channel"
    ]);
    buildQuery.filter = { ...buildQuery.filter, ...filter };
    const transactions = await transactionService.findMany(
      buildQuery.filter,
      null,
      null,
      buildQuery.options,
    );
    if (!transactions) {
      return next(
        new RequestError(httpCodes.BAD_REQUEST.code, "No transactions found"),
      );
    }
    const totalDocuments = await transactionService.countDocuments(filter);
    const perPage = filter.perPage || 50;
    const response = {
      data: transactions,
      paginator: {
        page: ceil(perPage / totalDocuments),
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
  }
  export default {
    data,
    url: '/transactions',
    handler: getTransactionsHandler,
    method: 'GET',
  };
  