import { NextFunction, Response } from "express";
import { IResponseData } from "../interfaces";
import { AxiosError } from "axios";
import { httpCodes } from "../constants";

export function sendSuccessResponse<T>(
  res: Response,
  // @ts-ignore
  next: NextFunction,
  data: IResponseData<T>,
  statusCode: number = httpCodes.OK.code,
  doAfter?: Function,
): void {
  const { headers, response, success } = data;

  res.status(statusCode).json({ success, response, headers });
  if (doAfter && doAfter instanceof Function) {
    doAfter();
  }
}

export function sendFailedResponse(
  res: Response,
  // @ts-ignore
  next: NextFunction,
  error: Error | AxiosError,
  code?: number,
  doAfter?: Function,
): void {
  let statusCode = code || httpCodes.INTERNAL_SERVER_ERROR.code;

  res
    .status(statusCode)
    .json({ success: false, response: { message: error.message } });
  if (doAfter && doAfter instanceof Function) {
    doAfter();
  }
}
