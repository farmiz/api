import dotenv from "dotenv";
const path = process.env.NODE_ENV !== "production"
? `.env.${process.env.NODE_ENV}`
: ".env";
dotenv.config({
  path
});
import { HttpServer } from "./../interfaces";
import { IData, RouteTypes } from "../interfaces";
import express, {
  Application,
  RequestHandler,
  Router,
  Request,
  Response,
  NextFunction,
} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import bodyParser from "body-parser";
import { getRoutes } from "../controllers";
import authMiddleware, { AuthRequest } from "../middleware";
import { ErrorHandler } from "../helpers/errors";
import { isFunction } from "lodash";
import { ValidationRule, Validator } from "../helpers/validator";
import { hasCorrectHttpVerb } from "../utils";
// @ts-ignore
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
// @ts-ignore
import trebble from "@treblle/express";
import { RATE_LIMITS, UNALLOWED_ENV } from "../constants";
import { WORKERS } from "../services/workers";
const { MAIN_ORIGIN = "", NODE_ENV = "", APP_VERSION= "v1" } = process.env;

type RequestValidation = {
  [x: string]: ValidationRule;
};
export class App implements HttpServer {
  public app: Application;
  private router: Router;

  constructor(appData: { name: string; version: number | string }) {
    console.log({ appData });
    this.app = express();
    this.router = Router();
  }
  addRoute(
    method: RouteTypes,
    url: string,
    handler: RequestHandler,
    data: IData,
  ) {
    const reqBody =
      data && data.rules && data.rules.body ? data.rules.body : {};
    const reqParams =
      data && data.rules && data.rules.params ? data.rules.params : {};
    const reqQuery =
      data && data.rules && data.rules.query ? data.rules.query : {};

    this.router[method](
      `/${APP_VERSION}${url}`,
      [
        // LIMIT THE METHODS ALLOWED ON EACH ROUTE
        (req: Request, res: Response, next: NextFunction) => {
          const requestMethod = req.method.toLowerCase();
          if (method !== requestMethod) {
            return res.status(405).json({ error: "Method Not Allowed" });
          } else {
            next();
          }
        },
        //AUTHENTICATE CLIENT IP ADDRESS
        async (req: Request, res: Response, next: NextFunction) => {
        await authMiddleware.getServerIp(req, res, next);
        },

        // RATE LIMITING
        async function checkRequestLimit(
          req: Request,
          res: Response,
          next: NextFunction,
        ): Promise<void> {
          if (
            data.requestRateLimiter &&
            Object.keys(data.requestRateLimiter).length > 2
          ) {
            if (NODE_ENV === "test") {
              next();
            } else
              await authMiddleware.rateLimit(
                req,
                res,
                next,
                data.requestRateLimiter,
              );
          } else next();
        },
        // VERIFY USER AUTH
        async function verifyAuthMiddleware(
          req: AuthRequest,
          res: Response,
          next: NextFunction,
        ): Promise<void> {
          if (data.requireAuth) {
            await authMiddleware.checkAuth(req, res, next);
          } else next();
        },
        // VERIFY USER PERMISSION
        async function verifyPermission(
          req: AuthRequest,
          res: Response,
          next: NextFunction,
        ): Promise<any> {
          if (data.permission && data.permission.length) {
            await authMiddleware.isPermitted(req, res, next, data.permission);
          } else next();
        },
        // RUN CUSTOM MIDDLEWARES
        async function middlewareCustomAuth(
          req: Request,
          res: Response,
          next: NextFunction,
        ) {
          const auths =
            data.customMiddleware && Array.isArray(data.customMiddleware)
              ? data.customMiddleware
              : [data.customMiddleware];
          if (auths.length) {
            for (const auth of auths) {
              if (auth && isFunction(auth)) {
                await Promise.resolve(auth(req, res, next));
              } else {
                return next();
              }
            }
          } else {
            next();
          }
        },
        // VALIDATE INCOMING REQUEST DATA
        Validator.validateRequestBody(reqBody as RequestValidation),
        Validator.validateRequestParams(reqParams as RequestValidation),
        Validator.validateRequestQueries(reqQuery as RequestValidation),
      ],
      handler,
    );
  }

  async addRoutes(): Promise<void> {
    const routes = await getRoutes();
    for (const route of routes) {
      const { method, url, data, handler } = route;
      if (hasCorrectHttpVerb(method) && handler instanceof Function) {
        if (
          (data && !data.requestRateLimiter) ||
          Object.keys(data.requestRateLimiter as object).length < 2
        ) {
          data.requestRateLimiter = RATE_LIMITS.defaultLimit;
        }
        this.addRoute(method, url, handler, data);
      }
    }
  }

  async start(port: number) {
    await this.addRoutes();
    this.config();
    for(const WORKER of WORKERS){
      await WORKER();
    }
    this.app.listen(port, () => {
      console.log(`App is running on port ${port}`);
    });
  }
  private config() {
    this.app.use(
      cors({
        origin: MAIN_ORIGIN, // Allow requests from this origin
        methods: "GET, POST, DELETE, PUT", // Allow these HTTP methods
        allowedHeaders: ["Content-Type", "Authorization"], // Allow these headers
        credentials: true, // Allow cookies to be sent with requests
        maxAge: 86400, // Cache preflight requests for one day
        optionsSuccessStatus: 204, // Respond with a 204 No Content status for preflight requests
        exposedHeaders: ["set-cookie"],
      }),
    );
    this.app.use(cookieParser());
    if (!UNALLOWED_ENV.includes(NODE_ENV)) {
      this.app.use(
        trebble({
          apiKey: process.env.TREBLLE_API_KEY,
          projectId: process.env.TREBLLE_PROJECT_ID,
          additionalFieldsToMask: [],
        }),
      );
    }

    this.app.disable("x-powered-by");
    this.app.use(compression());
    this.app.use(bodyParser.urlencoded({ extended: false, limit: "50kb" }));
    this.app.use(bodyParser.json());
    // use hpp to prevent Parameter Pollution attacks
    this.app.use(hpp());
    // set default security settings
    this.app.use(helmet());
    // use express-mongo-sanitize
    this.app.use(
      mongoSanitize({
        replaceWith: "_",
        allowDots: true,
        dryRun: true,
        onSanitize: ({ key, req }) => {
          console.warn({ key });
        },
      }),
    );
    // use xss
    this.app.use((req, res, next) => {
      res.setHeader("X-Frame-Options", "DENY");
      const allowedRoutes: string[] = [];
      const currentRoute = req.url;
      if (!allowedRoutes.includes(currentRoute)) {
        xss(req, res, next);
      }
      next();
    });

    this.app.use((req: Request, res: Response, next: NextFunction) => {
      if (process.env.NODE_ENV !== "test") {
        console.debug({
          host: req.hostname,
          method: req.method,
          url: req.url,
          ip: req.ip,
        });
      }
      next();
    });
    this.app.use(this.router);
    this.app.all("*", (req, res, next) => {
      res.status(404).send("Route not found");
      next();
    });
    this.app.use(ErrorHandler.handle);
  }
}
