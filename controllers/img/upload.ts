import { IData } from "../../interfaces";
import { Request, Response } from "express";
import { fileMiddleware } from "../../services/imageMiddleware";

const data: IData = {
  requireAuth: false,
  customMiddleware: [fileMiddleware.fileMiddleware("memory", null, 10) as any],
};
async function uploadFileHandler(req: Request, res: Response) {
  try {
    console.log({file: req.file})
    return res.send({
      success: true,
      message: `Welcome to ${process.env.APP_NAME} from ${req.file}`,
    });
  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
}

export default {
  method: "get",
  url: "/user/upload",
  handler: uploadFileHandler,
  data,
};
