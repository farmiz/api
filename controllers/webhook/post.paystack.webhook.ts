import { Response } from "express";
import { IData } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import { validatePayStackHookHandler } from "../../middleware/payStack";
import { payStackWebhook } from "../../core/webhook";

const data: IData = {
  customMiddleware: validatePayStackHookHandler,
};
async function payStackWebhookHandler(
  req: AuthRequest,
  res: Response
) {
  const event = req.body.event;
  await payStackWebhook.handleEvent(event, req.body.data);
  res.status(200).send({ message: "received" });
}

export default {
  method: "post",
  url: "/paystack/webhook",
  handler: payStackWebhookHandler,
  data,
};
