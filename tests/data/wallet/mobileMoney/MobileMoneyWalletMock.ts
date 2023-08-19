import { MobileMoneyWallet } from "../../../../mongoose/models/Wallet";
import { WalletMock } from "../WalletMock";
import { mobileMoneyWalletTemplate } from "./mobileMoneyWalletTemplate";

export class MobileMoneyWalletMock extends WalletMock{}

export const mobileMoneyWalletMock = new MobileMoneyWalletMock(mobileMoneyWalletTemplate, MobileMoneyWallet)
