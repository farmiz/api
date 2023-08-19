import { MobileMoneyWallet } from "../../../../mongoose/models/Wallet";
import { WalletMock } from "../WalletMock";
import { creditCardWalletTemplate } from "./creditCardWalletTemplate";

export class CreditCardWalletMock extends WalletMock{}

export const creditCardWalletMock = new CreditCardWalletMock(creditCardWalletTemplate, MobileMoneyWallet)
