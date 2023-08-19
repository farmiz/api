import mongoose, { Document, Schema, Types } from "mongoose";
import { defaultPlugin } from "../utils";
import { IDefaultPlugin } from "../../interfaces";
import { MongooseDefaults } from "../../constants";

export type VerifyAccountTokenType = "signup" | "login";

export const verifyAccountTokenTypeArr: VerifyAccountTokenType[] = ["login", "signup"];
export interface ITokens {
  accessToken: string;
  refreshToken: string[];
  verifyAccountToken?: {
    token: string;
    expiresAt: Date;
    type?: VerifyAccountTokenType;
  } | null;
}
export interface TokenDocument extends IDefaultPlugin {
  tokens: ITokens;
  userId: string;
}

const tokenSchema = new Schema<TokenDocument>(
  {
    tokens: {
      refreshToken: {
        type: Array,
        require: true,
      },
      accessTokenExpiresAt: {
        type: Date,
        require: true,
      },
      refreshTokenExpiresAt: {
        type: Date,
        require: true,
      },
      verifyAccountToken: Object,
    },
    userId: { type: String, ref: "User", required: true },
  },
  MongooseDefaults,
);
tokenSchema.plugin(defaultPlugin)

tokenSchema.pre<TokenDocument>("save", async function (next) {
  const existingToken = await Tokens.findOne({ userId: this.userId });

  if (existingToken) {
    await existingToken.deleteOne();
  }

  next();
});

const Tokens = mongoose.model<TokenDocument>("Token", tokenSchema);

export default Tokens;
