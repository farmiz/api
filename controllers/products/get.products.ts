import { NextFunction, Response } from "express";
import { IData } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { queryBuilder } from "../../utils";
import { productService } from "../../services/product";

const data: IData = {
  requireAuth: true,
  permission: ["products", "read"],
};

async function getProductsHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    let { query } = req;

    const filter = { deleted: false };
    const buildQuery = queryBuilder(query, ["name", "createdAt"]);
    buildQuery.filter = { ...filter, ...buildQuery.filter };
    const products = await productService.findMany(
      buildQuery.filter,
      { includes: buildQuery.columns },
      { productImage: ["url"] },
      buildQuery.options,
    );
    const totalDocuments = await productService.countDocuments(buildQuery.filter);
    const perPage = buildQuery.options.limit || 30;
    const response = {
      data: products,
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
  url: "/products",
  handler: getProductsHandler,
  method: "get",
};
