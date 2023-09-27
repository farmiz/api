import { createLogger, transports, format } from "winston";

const { combine, json, timestamp, printf, colorize, simple, errors } = format;
const { NODE_ENV } = process.env;

class Logger {
  private logger: any;

  constructor() {
    this.logger = createLogger({
      level: NODE_ENV === "production" ? "info" : "debug",
      format: combine(
        timestamp({format: "YYYY-MM-DD HH:mm:ss"}),
        errors({stack: true}),
        json(),
        printf(({ timestamp, level, message, stack, name, meta }) => {
          return `${timestamp} [${level.toUpperCase()}] : ${name} - ${stack || message} ${
            meta ? JSON.stringify(meta) : ""
          }`;
        })
      ),
      transports: [
        new transports.Console({
          level: "info",
          format: combine(colorize(), simple()),
        }),
        new transports.File({
          filename: "error.log",
          level: "error",
        }),
        new transports.File({
          filename: "combined.log",
        }),
      ],
    });
  }

  log(type: "info"| "error"| "debug", name: string, message: string, meta?: Record<string, any>) {
    this.logger.log({
      level: type,
      message: message,
      name: name,
      meta: meta,
    });
  }
}

export const farmizLogger = new Logger();
