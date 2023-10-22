import { NextFunction, Response } from 'express';
  import { IData } from '../../interfaces';
  import { AuthRequest } from '../../middleware';
  import { sendFailedResponse, sendSuccessResponse } from '../../helpers/requestResponse';
import { transactionService } from '../../services/transaction';
import { RequestError } from '../../helpers/errors';
import { httpCodes } from '../../constants';
import { TransactionModel } from '../../mongoose/models/Transaction';
  
  const data: IData = {
    requireAuth: true,
    permission: ["transaction", "read"],
    rules: {
      params: {
        id: {
          required: true
        }
      },
    },
  };
  
  async function getTransactionHandler(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filter = {
        deleted: false,
        userId: req.user?.id,
        _id: req.params.id
      }
      const transaction = await transactionService.findOne(filter)
      if (!transaction) {
        return next(
          new RequestError(httpCodes.BAD_REQUEST.code, "Transaction not found"),
        );
      }
      const response = transaction;
      sendSuccessResponse<TransactionModel>(res, next, { response, success: true });
    } catch (error: any) {
      sendFailedResponse(res, next, error);
    }
  }
  export default {
    data,
    url: '/:id/transactions',
    handler: getTransactionHandler,
    method: 'get',
  };
  