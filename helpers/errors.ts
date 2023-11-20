import {  Response, NextFunction } from "express";
import { httpCodes } from "../constants";

class RequestError extends Error {
  public readonly statusCode: number;
  public readonly message: string;

  constructor(statusCode: number, message?: string) {
    super(message);
    Object.setPrototypeOf(this, RequestError.prototype);
    this.statusCode = statusCode || httpCodes.INTERNAL_SERVER_ERROR.code;
    this.message = message || "";
  }
}

class ErrorHandler {
  public static handle(
    error: RequestError,
    {},
    res: Response,
    next: NextFunction
  ) {
    const { statusCode, message } = error;
    res.status(statusCode).json({
      success: false,
      response: {
        message
      }
    });
    next();
  }
}

export { RequestError, ErrorHandler };
