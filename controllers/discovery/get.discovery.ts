
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
import { ceil } from "lodash";
import { IDiscovery } from "../../interfaces/discovery";
import { discoveryService } from "../../services/discovery";

const data: IData = {
  requireAuth: true,
  permission: ["discovery", "read"],
};

const getDiscoveryHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    let { query } = req;

    const filter: Record<string, any> = {
      deleted: false,
    };

    const buildQuery = queryBuilder<IDiscovery>(query, [
        "amount",
        "closingDate",
        "description",
        "duration",
        "endDate",
        "name",
        "profitPercentage",
        "tags",
        "riskLevel"
    ]);
    buildQuery.filter = { ...buildQuery.filter, ...filter };

    const discoveried = await discoveryService.findMany(
      buildQuery.filter,
      null,
      null,
      buildQuery.options,
    );
    if (!discoveried) {
      return next(
        new RequestError(httpCodes.BAD_REQUEST.code, "No wallet found"),
      );
    }
    const totalDocuments = await discoveryService.countDocuments(filter);
    const perPage = filter.perPage || 50;
    const response = {
      data: discoveried,
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
  url: "/discovery",
  data,
  handler: getDiscoveryHandler,
};
