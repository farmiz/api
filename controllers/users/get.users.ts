import { NextFunction, Response } from "express";
import { IData } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { RequestError } from "../../helpers/errors";
import { userService } from "../../services/users";
import { queryBuilder } from "../../utils";
import { IUser } from "../../interfaces/users";
import { httpCodes } from "../../constants";
import { ceil } from "lodash";

const data: IData = {
  requireAuth: true,
  permission: ["users", "read"]
};

async function getUsersHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let { query } = req;

    const filter: Record<string, any> = {
      deleted: false,
    };
    const buildQuery = queryBuilder<IUser>(query, [
      "firstName",
      "lastName",
      "status",
      "gender",
      "role",
      "phone"
    ]);
    buildQuery.filter = { ...buildQuery.filter, ...filter };
    const users = await userService.findMany(
      buildQuery.filter,
      { includes: buildQuery.columns },
      {profileImageData: ["url"]},
      buildQuery.options,
    );
    if (!users) {
      return next(
        new RequestError(httpCodes.BAD_REQUEST.code, "No users found"),
      );
    }

    const totalDocuments = await userService.countDocuments(buildQuery.filter);
    const perPage = buildQuery.options.limit || 30;
    const response = {
      data: users,
      paginator: {
        page: buildQuery.options.page,
        perPage,
        totalPages: ceil(totalDocuments / perPage),
        totalDocuments,
      },
    };
    sendSuccessResponse(res, next, { response, success: true });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}
export default {
  data,
  url: "/users",
  handler: getUsersHandler,
  method: "get",
};
