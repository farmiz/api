import { AuthRequest } from "./../../middleware";
import * as jwt from "jsonwebtoken";
import { NextFunction } from "express";
import { RequestError } from "../errors";
import Tokens, {
  ITokens,
  VerifyAccountTokenType,
} from "../../mongoose/models/Tokens";
import { httpCodes } from "../../constants";
import { userService } from "../../services/users";
import { IUser } from "../../interfaces/users";
import crypto from "crypto";
import { addHours } from "date-fns";
import { UserModel } from "../../mongoose/models/Users";
const { JWT_TOKEN_SECRET = "", JWT_REFRESH_TOKEN_SECRET = "" } = process.env;
// Token interfaces
const accessTokenExpiresAt = new Date(Date.now() + 10 * 1000);
const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
interface IUserPayload extends IUser {}
export class TokenService {
  private static readonly AccessSecret = JWT_TOKEN_SECRET;
  private static readonly RefreshSecret = JWT_REFRESH_TOKEN_SECRET;

  public static createAccessToken(user: Partial<IUserPayload>): string {
    return jwt.sign({ ...user }, TokenService.AccessSecret, {
      expiresIn: Math.floor(new Date(accessTokenExpiresAt).getTime() / 1000),
    });
  }
  public static createRefreshToken(user: Partial<IUserPayload>): string {
    return jwt.sign({ ...user }, TokenService.RefreshSecret, {
      expiresIn: Math.floor(new Date(refreshTokenExpiresAt).getTime() / 1000),
    });
  }

  public static verifyAccessToken(token: string): IUserPayload | null {
    try {
      const currentTime = Math.floor(Date.now() / 1000);
      const decoded = jwt.verify(token, TokenService.AccessSecret) as any;
      if (decoded && decoded.exp > currentTime) {
        return decoded;
      }
      return null;
    } catch (error: any) {
      return null;
    }
  }
  public static verifyRefreshToken(token: string): IUserPayload {
      const decoded = jwt.verify(
        token,
        TokenService.RefreshSecret,
      ) as IUserPayload;
      return decoded;
  }
  public static async authenticate(req: AuthRequest, next: NextFunction) {
    const { code: httpCode, message: httpMessage } = httpCodes.UNAUTHORIZED;
    try {
      const bearer = req.headers.authorization;
      if (!bearer) return next(new RequestError(httpCode, httpMessage));
      const [, accessToken] = bearer.split("Bearer ");
      if (!accessToken || accessToken == undefined)
        return next(new RequestError(httpCode, httpMessage));

      const payload = TokenService.verifyAccessToken(accessToken);
      const id = payload?._id || payload?.id;
      if (!payload) return next(new RequestError(httpCode, httpMessage));
      const user = await userService.findOne({ _id: id }, null, {
        permission: [],
      });

      req.user = user as UserModel;
      next();
    } catch (error: any) {
      throw new RequestError(httpCode, error.message);
    }
  }
}

export class TokenModel implements ITokens {
  public accessToken: string;
  public refreshToken: string[];

  constructor(tokens: ITokens) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
  }
}

// call this when user is logged in
export async function generateTokens(
  user: Partial<IUserPayload>,
  type?: VerifyAccountTokenType,
): Promise<ITokens> {
  const accessToken = TokenService.createAccessToken({ _id: user.id });
  const refreshToken = TokenService.createRefreshToken({ _id: user.id });

  const tokens: Omit<ITokens, "accessToken"> = {
    refreshToken: [refreshToken],
    verifyAccountToken: null,
  };
  if (type) {
    tokens.verifyAccountToken = {
      type,
      token: `mha_${crypto.randomBytes(60).toString("hex")}`,
      expiresAt: addHours(new Date(), 5),
    };
  }
  //   store tokens in tokens model
  await Tokens.create({
    tokens,
    userId: user.id,
  });
  return {
    accessToken,
    refreshToken: [refreshToken],
    verifyAccountToken: tokens.verifyAccountToken,
  };
}
