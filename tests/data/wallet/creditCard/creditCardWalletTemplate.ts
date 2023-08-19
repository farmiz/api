import { v4 as uuid } from "uuid";
import { WalletModel } from "../../../../mongoose/models/Wallet";

export const creditCardWalletTemplate = (): WalletModel => {
  return {
    type: "credit card",
    cardDetails: {
      cvv: "",
      expiry_month: "",
      expiry_year: "",
      number: "",
    },
    userId: uuid(),
    primary: true,
    status: "active",
    deleted: false,
    createdBy: uuid(),
    updatedBy: uuid(),
  };
};
