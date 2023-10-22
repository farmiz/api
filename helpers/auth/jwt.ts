import { AuthRequest } from "./../../middleware";
import * as jwt from "jsonwebtoken";
import { NextFunction } from "express";
import { RequestError } from "../errors";
import Tokens, {
  ITokens,
  TokenDocument,
  VerifyAccountTokenType,
} from "../../mongoose/models/Tokens";
import { httpCodes } from "../../constants";
import { userService } from "../../services/users";
import { IUser } from "../../interfaces/users";
import crypto from "crypto";
import { addHours, isAfter } from "date-fns";
import { UserModel } from "../../mongoose/models/Users";
const { JWT_TOKEN_SECRET = "", JWT_REFRESH_TOKEN_SECRET = "" } = process.env;
// Token interfaces
const accessTokenExpiresAt = new Date(Date.now() + 10 * 1000);
const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
interface IUserPayload extends IUser {}
class TokenService {
  private readonly AccessSecret = JWT_TOKEN_SECRET;
  private readonly RefreshSecret = JWT_REFRESH_TOKEN_SECRET;

  public createAccessToken(user: Partial<IUserPayload>): string {
    return jwt.sign({ ...user }, this.AccessSecret, {
      expiresIn: Math.floor(new Date(accessTokenExpiresAt).getTime() / 1000),
    });
  }
  public createRefreshToken(user: Partial<IUserPayload>): string {
    return jwt.sign({ ...user }, this.RefreshSecret, {
      expiresIn: Math.floor(new Date(refreshTokenExpiresAt).getTime() / 1000),
    });
  }

  public verifyAccessToken(token: string): IUserPayload | null {
    try {
      const currentTime = Math.floor(Date.now() / 1000);
      const decoded = jwt.verify(token, this.AccessSecret) as any;
      if (decoded && decoded.exp > currentTime) {
        return decoded;
      }
      return null;
    } catch (error: any) {
      return null;
    }
  }
  async createEmailRecoveryToken(userId: string | null): Promise<TokenDocument | null> {
    let tokens: Record<string, any> = {}
    try {
      tokens.emailRecoveryToken =  {
        type: "recvoery",
        token: `mha_${crypto.randomBytes(60).toString("hex")}`,
        expiresAt: addHours(new Date(), 5),
      };
      return await Tokens.create({...tokens, userId});
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
  async verifyEmailRecoveryToken(token: string): Promise<boolean>{
    const tokenVerified = await Tokens.findOne({"tokens.emailRecoveryToken": token});

    if(!tokenVerified) return false;

    // check if token is exired
    const currentDate = new Date();
    const emailRecoveryToken = tokenVerified?.tokens?.verifyAccountToken;
    return isAfter(currentDate, new Date(emailRecoveryToken?.expiresAt as Date));
  }
  public verifyRefreshToken(token: string): IUserPayload {
    const decoded = jwt.verify(token, this.RefreshSecret) as IUserPayload;
    return decoded;
  }
  public async authenticate(req: AuthRequest, next: NextFunction) {
    const { code: httpCode, message: httpMessage } = httpCodes.UNAUTHORIZED;
    try {
      const bearer = req.headers.authorization;
      if (!bearer) return next(new RequestError(httpCode, httpMessage));
      const [, accessToken] = bearer.split("Bearer ");
      if (!accessToken || accessToken == undefined)
        return next(new RequestError(httpCode, httpMessage));

      const payload = this.verifyAccessToken(accessToken);
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

export class TokenModel implements Partial<ITokens> {
  public accessToken: string;
  public refreshToken: string;

  constructor(tokens: ITokens) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
  }
}

export const tokenService = new TokenService();

// call this when user is logged in
export async function generateTokens(
  user: Partial<IUserPayload>,
  type?: VerifyAccountTokenType,
): Promise<ITokens> {
  const accessToken = tokenService.createAccessToken({ _id: user.id });
  const refreshToken = tokenService.createRefreshToken({ _id: user.id });

  const tokens: Omit<ITokens, "accessToken"> = {
    refreshToken: refreshToken,
    verifyAccountToken: null,
    emailRecoveryToken: null
  };
  if (type) {
    tokens.verifyAccountToken = {
      type,
      token: `mha_${crypto.randomBytes(60).toString("hex")}`,
      expiresAt: addHours(new Date(), 5),
    };
  }
  await Tokens.create({
    tokens,
    userId: user.id,
  });
  return {
    accessToken,
    refreshToken: refreshToken,
    verifyAccountToken: tokens.verifyAccountToken,
    emailRecoveryToken: null
  };
}
