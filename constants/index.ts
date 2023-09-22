import { Document } from "mongoose";
import {
  HttpCodeNames,
  HttpCodes,
  IRateLimiter,
  PermissionOperation,
} from "./../interfaces";
import { UserRole } from "../interfaces/users";
import path from "path";

export const BASE_DIR = path.resolve(path.join(__dirname, "../.."));
export const BASE_CONTROLLER_DIR = "controllers";
export const BASE_SERVICE_DIR = "services";
export const httpCodes: {
  [key in HttpCodeNames]: {
    code: HttpCodes;
    message: string;
  };
} = {
  OK: {
    code: 200,
    message: "OK",
  },
  CREATED: {
    code: 201,
    message: "Created",
  },
  BAD_REQUEST: {
    code: 400,
    message: "Bad Request",
  },
  UNAUTHORIZED: {
    code: 401,
    message: "Unauthorized",
  },
  FORBIDDEN: {
    code: 403,
    message: "Forbidden",
  },
  NOT_FOUND: {
    code: 404,
    message: "Not Found",
  },
  INTERNAL_SERVER_ERROR: {
    code: 500,
    message: "Internal Server Error",
  },
  SERVICE_UNAVAILABLE: {
    code: 503,
    message: "Service Unavailable",
  },
};

export const RATE_LIMITS: IRateLimiter = {
  defaultLimit: {
    max: 100,
    windowMs: 3600000,
    message: "Too many API calls, please try again soon.",
    name: "defaultLimiting",
  },
  api: {
    max: 100,
    windowMs: 3600000,
    message: "Too many API calls, please try again soon.",
    name: "api",
  },
  register: {
    max: 10,
    windowMs: 30000,
    message: "Too many request attempts, please try again in a few minutes.",
    name: "register",
  },
  login: {
    name: "login",
    max: 15,
    windowMs: 300000,
    message: "Too many request attempts, please try again in a few minutes.",
  },
  refreshToken: {
    name: "refreshToken",
    max: 15,
    windowMs: 3000,
    message: "Too many request attempts, please try again in a few minutes.",
  },
  addWallet: {
    name: "addWallet",
    max: 10,
    windowMs: 200,
    message: "Too many request attempts, please try again in a few minutes.",
  },
};

export const ALLOWED_COUNTRIES: string[] = ["GH"];
export const MongooseDefaults = {
  timestamps: true,
  strict: true,
  minimize: false,
  validateBeforeSave: true,
  strictPopulate: true,
  toJSON: {
    getters: true, // Add this line to include virtuals,
    virtuals: true,
    transform: (doc: Document, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    getters: true, // Add this line to include virtuals,
    virtuals: true,
    transform: (doc: Document, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
  read: "secondary",
  collation: {
    locale: "en_US",
    strength: 1,
  },
};

export const SPECIAL_ROLES: UserRole[] = ["admin", "support"];
export const ERROR_MESSAGES = {
  userNotFound: "User not found",
  usersNotFound: "User not found",
  permissionDenied: "You don't have permission to access this resource.",
  wrongCombination: "Wrong email/password combination",
  accessDenied: "Access to this resource is denied",
  userExists: "User already exists",
  invalidEmail: "Email is invalid.",
  invalidPassword: "Password is invalid",
  invalidPasswordLength: "The password must be at least 8 characters long.",
  noLowerCaseInPassword:
    "The password must contain at least one lowercase letter.",
  noUpperCaseInPassword:
    "The password must contain at least one uppercase letter.",
  noSpecialCharacterInPassword:
    "The password must contain at least one special character.",
  samePasswordCombination: "Passwords can't be the same",
  roleRequired: "role is required",
  userCreationFailed: "Unable to catch (error: any)",
  fieldRequired: (field: string) => `${field} is required`,
  invalidField: (field: string) => `${field} is invalid.`,
  userFieldExists: (field: string, value: string) =>
    `User with ${field} ${value} already exists`,
} as const;

export const UNALLOWED_ENV = ["test", "development"];

export const DEFAULT_USER_PERMISSION: {
  [key: string]: PermissionOperation[];
} = {
  users: ["read", "update"],
  wallet: ["create", "read", "delete", "update"],
  discovery: ["read"],
  sponsor: ["create", "read", "update"],
  settings: ["create", "update", "read"]
};
