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
    return res.send({ success: true });
  } catch (error: any) {
    res.status(500).send({ error });
  }
}

export default {
  method: "get",
  url: "/health/check",
  handler: postHandler,
  data,
};
