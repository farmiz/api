import { ILimiter, PermissionOperation, PermissionString } from "../interfaces";
import { hasPermission } from "../helpers/permissions/permissions";
import { Request, Response, NextFunction, RequestHandler } from "express";
import {
  ALLOWED_COUNTRIES,
  ERROR_MESSAGES,
  RATE_LIMITS,
  httpCodes,
} from "../constants";
import Database from "../core/database";
import { RateLimiterMongo } from "rate-limiter-flexible";
// @ts-ignore
import geoLocation from "geoip-lite";
import { RequestError } from "../helpers/errors";
import { UserModel } from "../mongoose/models/Users";
import { tokenService } from "../helpers/auth/jwt";

type CustomAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => Promise<any> | void | any;
export interface AuthRequest<T = any> extends Request {
  user?: Partial<UserModel>;
  geolocation?: Record<string, string>;
  body: T;
}
class AuthMiddleware {
  public async checkAuth(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    try {
      await tokenService.authenticate(req, next);
    } catch (err: any) {
      return res
        .status(401)
        .json({ succes: false, response: { error: err.message } });
    }
  }

  public async isPermitted(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
    permission: [PermissionString, PermissionOperation],
  ): Promise<any> {
    const { user } = req;
    try {
      if (user?.role === "admin") return next();
      const userPermission: string = user?.permission?.access || "";
      if (hasPermission(userPermission, permission)) {
        return next();
      }
      return res
        .status(httpCodes.FORBIDDEN.code)
        .json({
          error: true,
          response: { message: ERROR_MESSAGES.permissionDenied },
        });
    } catch (error: any) {
      return res
        .status(httpCodes.FORBIDDEN.code)
        .json({
          error: true,
          response: { message: ERROR_MESSAGES.accessDenied },
        });
    }
  }
  public async rateLimit(
    req: Request,
    res: Response,
    next: NextFunction,
    config: ILimiter = RATE_LIMITS.api,
  ) {
    const { headers } = req;
    // CF-Connecting-IP is to get the client ip from cloudflare
    const ip = headers["CF-Connecting-IP"] || req.ip;
    const opts = {
      storeClient: Database.connection(),
      points: config.max, // Number of points
      duration: config.windowMs / 1000, // Per second(s),
      blockDuration: config.blockDuration || 60 * 60 * 5, // block the ip for 5hours,
      keyPrefix: "rateLimiter",
      keyGenerator: (req: Request) => req.method,
    };
    try {
      const rateLimiterMongo = new RateLimiterMongo(opts);
      const rateLimiterRes = await rateLimiterMongo.consume(
        `${config.name}:${ip}:${req.method.toLowerCase()}:${req.url}`,
      );
      const headers = {
        "Retry-After": rateLimiterRes.msBeforeNext / 1000,
        "X-RateLimit-Limit": opts.points,
        "X-RateLimit-Remaining": rateLimiterRes.remainingPoints,
        "X-RateLimit-Reset": new Date(Date.now() + rateLimiterRes.msBeforeNext),
      };
      res.set(headers);
      return next();
    } catch (error: any) {
      res.set({ "X-RateLimit-Remaining": 0 });
      return res.status(429).send({
        error: true,
        message: error.message || "Too many requests. Try again later",
        code: 429,
      });
    }
  }

  async getServerIp(req: AuthRequest, {}, next: NextFunction) {
    if (process.env.NODE_ENV === "test") {
      return next();
    }

    let ipv6Address: string | string[] =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";

    if (Array.isArray(ipv6Address)) {
      ipv6Address = ipv6Address[0];
    }

    let ipv4Address = ipv6Address.match(/::ffff:(\d+\.\d+\.\d+\.\d+)/)?.[1];
    if (ipv4Address && ipv4Address === "127.0.0.1") {
      ipv4Address = "154.160.16.100";
    }

    const geolocation = geoLocation.lookup(ipv4Address);

    if (geolocation && !ALLOWED_COUNTRIES.includes(geolocation.country)) {
      next(
        new RequestError(
          httpCodes.FORBIDDEN.code,
          "Your country is restricted from using this website",
        ),
      );
      next();
    } else {
      req.geolocation = geolocation;
      next();
    }
  }

  async handleCustomAuth(customAuth: CustomAuth) {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
      return customAuth(req, res, next);
    };
  }
}
export default new AuthMiddleware();

export function isAsyncFunction(
  func: Function | Promise<Function> | RequestHandler | Promise<RequestHandler>,
) {
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  return func instanceof AsyncFunction;
}