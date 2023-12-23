import { NextFunction, Response } from "express";
import { IData } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { productService } from "../../services/product";
import { fileMiddleware } from "../../services/imageMiddleware";
import { fileBucket } from "../../services/fileBucket/FileBucket";
import { productFileService } from "../../services/files/Product";

const data: IData = {
  requireAuth: true,
  permission: ["products", "create"],
  customMiddleware: fileMiddleware.fileMiddleware("memory", null, 5),
  rules: {
    body: {
      name: { required: true },
    },
  },
};

async function createProductHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { name = "" } = req.body;
    const response = await productService.create({
      name,
      createdBy: req.user?.id,
    });
    if (response.id) {
      if (process.env.NODE_ENV !== "test") {
        const result = await fileBucket.uploadFile({
          directory: "products",
          req,
          streamOptions: {
            contentType: req.file?.mimetype,
          },
        });

        await productFileService.create({
          ...result,
          productId: response.id,
        });
      }
    }
    sendSuccessResponse(res, next, { response, success: true });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}
export default {
  data,
  url: "/products",
  handler: createProductHandler,
  method: "post",
};
