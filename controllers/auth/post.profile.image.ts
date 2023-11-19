import { IData } from "../../interfaces";
import { NextFunction, Response } from "express";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";

import { AuthRequest } from "../../middleware";
import { fileMiddleware } from "../../services/imageMiddleware";
import { fileBucket } from "../../services/fileBucket/FileBucket";
import { profileImageService } from "../../services/auth/profileImage";
const data: IData = {
  requireAuth: true,
  customMiddleware: fileMiddleware.fileMiddleware("memory", null, 2),
  rules: {
    body: {
      userId: {
        required: false,
      },
    },
  },
};
async function pinUpdateHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    let userId = "";
    if (req.user?.role === "customer") {
      userId = String(req.user.id);
    } else if (
      ["admin", "support"].includes(String(req.user?.role)) &&
      req.body.userId
    ) {
      userId = req.body.userId;
    }

    let uploadResponse = null;
    if (req.file) {
      uploadResponse = await fileBucket.uploadFile({
        req,
        directory: "profileImage",
        streamOptions: { metadata: { contentType: req.file.mimetype } },
      });
    }
    if (uploadResponse) {
      await profileImageService.create({ ...uploadResponse, userId });
    }
    sendSuccessResponse(res, next, {
      success: true,
      response: uploadResponse,
    });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}

export default {
  method: "post",
  url: "/auth/profile-image/upload",
  handler: pinUpdateHandler,
  data,
};
