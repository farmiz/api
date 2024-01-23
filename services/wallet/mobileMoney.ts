import { Model } from "mongoose";
import { BaseService } from "..";
import  {
  MobileMoneyWaletModel,
  MobileMoneyWallet,
} from "../../mongoose/models/Wallet";

class MobileMoneyWalletService extends BaseService<MobileMoneyWaletModel> {
  protected readonly model: Model<MobileMoneyWaletModel>;

  constructor(model: Model<MobileMoneyWaletModel>) {
    super(model);
    this.model = model;
  }

  async walletExists(
    {},
    id: string,
    optionalFilter?: Record<keyof MobileMoneyWaletModel, any>,
  ) {
    let filter = { _id: id, deleted: false };
    if (optionalFilter && Object.keys(optionalFilter).length) {
      filter = { ...filter, ...optionalFilter };
    }
    return await this._exists(filter);
  }
}
export const mobileMoneyWalletService = new MobileMoneyWalletService(
  MobileMoneyWallet,
);
