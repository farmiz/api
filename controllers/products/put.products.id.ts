import { NextFunction, Response } from "express";
import { IData } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { productService } from "../../services/product";
import { productFileService } from "../../services/files/Product";
import { fileBucket } from "../../services/fileBucket/FileBucket";

const data: IData = {
  requireAuth: true,
  permission: ["products", "update"],
  rules: {
    params: {
      id: { required: true },
    },
    body: {
      name: { required: true },
    },
  },
};

async function updateProductHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { name = "" } = req.body;
    const { id } = req.params;
    const data = {
      updatedBy: req.user?.id,
      updatedAt: new Date(),
    };
    await productService.updateOne({ _id: id }, { name, ...data });

    if (req.file) {
      const file = await productFileService.findOne({
        productId: id,
      });
      if (process.env.NODE_ENV !== "test" && file) {
        const result = await fileBucket.updateFile(
          {
            directory: "products",
            req,
            streamOptions: {
              contentType: req.file?.mimetype,
            },
          },
          String(file?.fileName),
        );
        await productFileService.updateOne({ productId: id }, result);
      }
    }

    const product = await productService.findOne({ _id: id }, null, {
      discoveryFile: ["url"],
    });
    sendSuccessResponse(res, next, { response: product, success: true });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}
export default {
  data,
  url: "/products/:id",
  handler: updateProductHandler,
  method: "put",
};
