import { NextFunction, Response } from "express";
import { IData } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { productService } from "../../services/product";

const data: IData = {
  requireAuth: true,
  permission: ["products", "read"],
  rules: {
    params: {
      id: { required: true },
    },
  },
};

async function getSingleProductHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id = "" } = req.params;
    const response = await productService.findOne({ _id: id, deleted: false });
    sendSuccessResponse(res, next, { response, success: true });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}
export default {
  data,
  url: "/products/:id",
  handler: getSingleProductHandler,
  method: "get",
};
