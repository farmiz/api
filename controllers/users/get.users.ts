import { NextFunction, Response } from "express";
import { IData } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { userService } from "../../services/users";
import { queryBuilder } from "../../utils";
import { IUser } from "../../interfaces/users";
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
      role: {$in: ["admin", "support"]}
    };
    const buildQuery = queryBuilder<IUser>(query, [
      "firstName",
      "lastName",
      "status",
      "gender",
      "role",
      "phone",
      "email",
      "phone"
    ]);
    buildQuery.filter = { ...filter, ...buildQuery.filter };
    const users = await userService.findMany(
      buildQuery.filter,
      { includes: buildQuery.columns },
      {profileImageData: ["url"]},
      buildQuery.options,
      );
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
