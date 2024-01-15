import { NextFunction, Response } from "express";
import { IData } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { tagsService } from "../../services/tags";
import { queryBuilder } from "../../utils";

const data: IData = {
  requireAuth: true,
  permission: ["tags", "read"],
};

async function getTagsHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    let { query } = req;

    const filter = { deleted: false };
    const buildQuery = queryBuilder(query, ["name", "createdAt"]);
    buildQuery.filter = { ...filter, ...buildQuery.filter };
    const tags = await tagsService.findMany(
      buildQuery.filter,
      { includes: buildQuery.columns },
      null,
      buildQuery.options,
    );
    const totalDocuments = await tagsService.countDocuments(buildQuery.filter);
    const perPage = buildQuery.options.limit || 30;
    const response = {
      data: tags,
      paginator: { 
        page: buildQuery.options.page,
        perPage,
        totalPages: Math.ceil(totalDocuments / perPage),
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
  url: "/tags",
  handler: getTagsHandler,
  method: "get",
};
