import { Schema, Model, model } from "mongoose";
import { MongooseDefaults } from "../../constants";
import { defaultPlugin } from "../utils";
import { IWallet, TMobileMoneyWallet, NetworkType, WalletStatus, WalletType, TCreditCardWallet } from "../../interfaces/wallet";
import { IDefaultPlugin } from "../../interfaces";


export const walletStatuses: WalletStatus[] = ["active", "disabled", "suspended"]
export const networkTypes: NetworkType[] = ["ATL", "MTN", "VOD"];
export const walletTypes: WalletType[] = [
    "bank",
    "credit card",
    "mobile money",
  ];
  
export type WalletModel = IWallet & IDefaultPlugin;
export type MobileMoneyWaletModel = TMobileMoneyWallet & IDefaultPlugin;
export type CreditCardWalletModel = TCreditCardWallet & IDefaultPlugin;
export const BaseWalletSchema = new Schema<WalletModel>(
  {
    userId: { type: String, required: true },
    type: { type: String, required: true, enum: walletTypes },
    availableBalance: { type: Number, required: false, default: 0 },
    primary: { type: Boolean, required: false, default: false },
    status: {
      type: String,
      required: false,
      default: "active",
      enum: walletStatuses,
    },
  },
  MongooseDefaults
);

// Define the discriminators for each wallet type
export const MobileMoneyWalletSchema = new Schema<MobileMoneyWaletModel>(
  {
    mobileMoneyDetails: {
      fullName: String,
      network: { type: String, enum: networkTypes },
      phone: {
        prefix: { type: String, required: true },
        number: { type: String, required: true },
        country: { type: String, required: false, default: "GH" },
      },
    },
  },
  { discriminatorKey: "walletType" }
);


export const CreditCardWalletSchema = new Schema<CreditCardWalletModel>(
  {
    cardDetails: {
      data: Object,
      number: { type: String, required: true },
      cvv: { type: String, required: true },
      expiry_year: { type: String, required: true },
      expiry_month: { type: String, required: true },
    },
  },
  { discriminatorKey: "walletType" }
);

BaseWalletSchema.plugin(defaultPlugin)
// Create the main wallet model using discriminators
const Wallet: Model<WalletModel> = model<WalletModel>(
  "Wallet",
  BaseWalletSchema
);

export const MobileMoneyWallet = Wallet.discriminator("mobileMoney", MobileMoneyWalletSchema);
export const CreditCardWallet = Wallet.discriminator("creditCard", CreditCardWalletSchema);

export default Wallet;