import { NextFunction, RequestHandler } from "express";
import { ValidationRule } from "../helpers/validator";
import { JobOptions } from "bull";

export type PermissionOperation = "create" | "read" | "update" | "delete";
export type PermissionString = "users" | "wallet" | "discovery" | "sponsor" | "settings";
export type IPermission = Record<
  PermissionString,
  Record<PermissionOperation, number>
>;

export type RouteTypes = "post" | "get" | "delete" | "put" | "patch";

export interface IResponseData<T> {
  success: boolean;
  response?: T;
  headers?: IRequestHeader;
  code?: number;
}
export interface IRequestHeader {
  key: string;
  value: string;
}

export interface IData<T = any> {
  requireAuth?: boolean;
  customMiddleware?:
    | RequestHandler
    | Promise<RequestHandler>
    | RequestHandler[]
    | Promise<RequestHandler>[];
  permission?: [PermissionString, PermissionOperation];
  rules?: {
    [key in "params" | "body" | "query"]?: {
      [key in keyof T]?: ValidationRule;
    };
  };
  requestRateLimiter?: ILimiter;
  csrf?: boolean;
}

export interface HttpServer {
  start(port: number): void;
}
export interface ILimiter {
  max: number;
  windowMs: number;
  message?: string;
  name: string;
  blockDuration?: number;
}

export type RateLimiterName =
  | "api"
  | "defaultLimit"
  | "register"
  | "login"
  | "refreshToken"
  | "addWallet";
export type IRateLimiter = {
  [key in RateLimiterName]: ILimiter;
};
export interface IRoute {
  url: string;
  data: IData;
  handler: RequestHandler;
  method: RouteTypes;
}

export interface IPhone {
  prefix: string;
  number: string;
  country?: string;
}

export interface IAddress {
  houseNumber?: string;
  zipCode?: string;
  country: string;
  city: string;
  street: string;
  state: string;
}

export type HttpCodes = 200 | 201 | 400 | 401 | 403 | 404 | 500 | 503;
export type HttpCodeNames =
  | "OK"
  | "CREATED"
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "INTERNAL_SERVER_ERROR"
  | "SERVICE_UNAVAILABLE";

export type Statuses = "failed" | "success" | "pending";

export type JobId =
  | "reset-password"
  | "user-account-verification"
  | "account-password-recovery"
  | "wallet-topup"
  | "wallet-topup"
  | "wallet-deduction"
  | "program-sponsored"
  | "sponsorship-cancelled"
   | "cleanup-job";

export interface JobData<T> {
  data: T;
  isConnected?: boolean;
}
export interface IJobOptions extends JobOptions {
  jobId: JobId;
}
export interface IJobBase {
  email: string;
  jobId: JobId;
  accountVerificationToken?: string;
  amount?: string | number;
  totalAmount?: string;
}

export interface Attachment {
  content?: string | Buffer;
  filename?: string | false | undefined;
  path?: string;
}
export type Tag = {
  name: string;
  value: string;
};
export interface MailOptions {
  attachments?: Attachment[];
  bcc?: string | string[];
  cc?: string | string[];
  from: string;
  headers?: Record<string, string>;
  react?: React.ReactElement | React.ReactNode | null;
  html?: string;
  text: string;
  reply_to?: string | string[];
  subject: string;
  tags?: Tag[];
  to: string | string[];
}

export interface EmailJobOptions extends MailOptions {}
export interface IDefaultPlugin {
  _id?: string;
  createdAt?: Date;
  updatedBy?: string;
  updatedAt?: Date;
  deleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  createdBy?: string;
}
