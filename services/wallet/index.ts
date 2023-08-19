import { Model } from "mongoose";
import { BaseService } from "..";
import Wallet, { WalletModel } from "../../mongoose/models/Wallet";

class WalletService extends BaseService<WalletModel> {
  protected readonly model: Model<WalletModel>;

  constructor(model: Model<WalletModel>) {
    super(model);
    this.model = model;
  }

  async walletExists(
    {},
    id: string,
    optionalFilter?: Record<keyof WalletModel, any>,
  ) {
    let filter = { _id: id, deleted: false };
    if (optionalFilter && Object.keys(optionalFilter).length) {
      filter = { ...filter, ...optionalFilter };
    }
    return await this._exists(filter);
  }
}
export const walletService = new WalletService(Wallet);
