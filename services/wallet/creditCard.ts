import { Model } from "mongoose";
import { BaseService } from "..";
import Wallet, { CreditCardWallet, CreditCardWalletModel, WalletModel } from "../../mongoose/models/Wallet";

class CreditCardWalletService extends BaseService<CreditCardWalletModel> {
  protected readonly model: Model<CreditCardWalletModel>;

  constructor(model: Model<CreditCardWalletModel>) {
    super(model);
    this.model = model;
  }

  async walletExists(
    {},
    id: string,
    optionalFilter?: Record<keyof CreditCardWalletModel, any>,
  ) {
    let filter = { _id: id, deleted: false };
    if (optionalFilter && Object.keys(optionalFilter).length) {
      filter = { ...filter, ...optionalFilter };
    }
    return await this._exists(filter);
  }
}
export const creditCardWalletService = new CreditCardWalletService(CreditCardWallet);
