import { NextFunction, Request, Response } from "express";
import { createHmac } from "crypto";
import { RequestError } from "../helpers/errors";
import { httpCodes } from "../constants";
const { PAYSTACK_SK = "" } = process.env;
export function validatePaystackHookHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const hash = createHmac("sha512", PAYSTACK_SK)
    .update(JSON.stringify(req.body))
    .digest("hex");
  if (hash === req.headers["x-paystack-signature"]) {
    return next();
  }
  return next(new RequestError(httpCodes.FORBIDDEN.code, "Forbidden"));
}
