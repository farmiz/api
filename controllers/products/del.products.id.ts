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
  permission: ["products", "delete"],
  rules: {
    params: {
      id: { required: true },
    },
  },
};

async function deleteProductHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const fieldsToUpdate = {
      deleted: true,
      deletedBy: req.user?.id,
      deletedAt: new Date(),
    };
    const { id } = req.params;
    const response = await productService.updateOne({ _id: id }, fieldsToUpdate);
    sendSuccessResponse(res, next, { response, success: true });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}
export default {
  data,
  url: "/products/:id",
  handler: deleteProductHandler,
  method: "delete",
};
