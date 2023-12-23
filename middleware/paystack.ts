import { NextFunction, Request } from "express";
import { createHmac } from "crypto";
import { RequestError } from "../helpers/errors";
import { httpCodes } from "../constants";
const { PAYSTACK_SK = "" } = process.env;
export function validatePayStackHookHandler(
  req: Request,
  {},
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
