import { IData } from "../../interfaces";
import { Response } from "express";
import { fileMiddleware } from "../../services/imageMiddleware";
import { AuthRequest } from "../../middleware";
import { fileBucket } from "../../services/fileBucket/FileBucket";

const data: IData = {
  requireAuth: false,
  customMiddleware: fileMiddleware.fileMiddleware("memory", null, 10),
};
async function uploadFileHandler(req: AuthRequest, res: Response) {
  try {
    if (req.file) {
      const fileURL = await fileBucket.uploadFile({
        req,
        directory: "profileImage",
        streamOptions: { metadata: { contentType: req.file.mimetype } },
      });
      console.log({ file: fileURL });
    }
    return res.send({
      success: true,
      message: `Welcome to ${process.env.APP_NAME} from ${JSON.stringify(
        req.body,
      )}`,
    });
  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
}

export default {
  method: "post",
  url: "/user/upload",
  handler: uploadFileHandler,
  data,
};
