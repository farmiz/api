import { Response } from "express";
import { IData } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import { validatePaystackHookHandler } from "../../middleware/paystack";
import { paystackWebhook } from "../../core/webhook";

const data: IData = {
  customMiddleware: validatePaystackHookHandler,
};
async function paystackWebhookHandler(
  req: AuthRequest,
  res: Response
) {
  const event = req.body.event;
  await paystackWebhook.handleEvent(event, req.body.data);
  res.status(200).send({ message: "received" });
}

export default {
  method: "post",
  url: "/paystack/webhook",
  handler: paystackWebhookHandler,
  data,
};
