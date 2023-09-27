import { farmizLogger } from "../../core/logger";
import { IData } from "../../interfaces";
import { Request, Response } from "express";


const data: IData = {
  requireAuth: false,
  rules: {
    body: {},
    params: {},
    query: {},
  },
};
async function postHandler(req: Request, res: Response) {
  try {

farmizLogger.log('info', 'MyFunction', 'Some informational message', { meta: 'some cool meta data' });
    return res.send({ success: true, message: `Welcome to ${process.env.APP_NAME}` });
  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
}

export default {
  method: "get",
  url: "/health/check",
  handler: postHandler,
  data,
};
