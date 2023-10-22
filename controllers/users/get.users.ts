import { NextFunction, Response } from 'express';
  import { IData } from '../../interfaces';
  import { AuthRequest } from '../../middleware';
  import { sendFailedResponse, sendSuccessResponse } from '../../helpers/requestResponse';
import { RequestError } from '../../helpers/errors';
import { userService } from '../../services/users';
import { queryBuilder } from '../../utils';
import { IUser } from '../../interfaces/users';
import { httpCodes } from '../../constants';
import { ceil } from 'lodash';
  
  const data: IData = {
    requireAuth: false,
    // permission: ["users", "read"]
  };
  
  async function getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      let { query } = req;

      const filter: Record<string, any> = {
        deleted: false,
        userId: req.user?.id
      };
      const buildQuery = queryBuilder<IUser>(query, [
       "firstName", "lastName", "status", "email", "gender", "role"
    ]);
    buildQuery.filter = { ...buildQuery.filter, ...filter };
    console.info({buildQuery, query})
    const users = await userService.findMany(
      buildQuery.filter,
      null,
      null,
      buildQuery.options,
    );
    if (!users) {
      return next(
        new RequestError(httpCodes.BAD_REQUEST.code, "No users found"),
      );
    }
    const totalDocuments = await userService.countDocuments(filter);
    const perPage = filter.perPage || 50;
    const response = {
      data: users,
      paginator: {
        page: ceil(perPage / totalDocuments),
        perPage,
        totalPages: ceil(totalDocuments / perPage),
        totalDocuments
      },
    };
      sendSuccessResponse(res, next, { response, success: true });
    } catch (error: any) {
      sendFailedResponse(res, next, error);
    }
  }
  export default {
    data,
    url: '/users',
    handler: getUsers,
    method: 'get',
  };
  