
import { v4 as uuid } from "uuid";
import { WalletModel } from "../../../../mongoose/models/Wallet";
import { IPhone } from "../../../../interfaces";
const phone: IPhone = {
  number: "543814868",
  country: "GH",
  prefix: "233",
};

export const mobileMoneyWalletTemplate = (): WalletModel => {
  return {
    type: "mobile money",
    mobileMoneyDetails: {
      network: "MTN",
      phone,
    },
    userId: uuid(),
    primary: true,
    status: "active",
    deleted: false,
    createdBy: uuid(),
    updatedBy: uuid(),
  };
};
