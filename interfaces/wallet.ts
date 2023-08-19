import { IPhone } from ".";


export type WalletType = "mobile money" | "credit card" | "bank";
export type NetworkType = "MTN" | "VOD" | "ATL";

export type WalletStatus = "active" | "disabled" | "suspended";
export default interface BaseWallet {
  id?: string;
  userId?: string;
  type: WalletType;
  availableBalance?: number;
  primary?: boolean;
  status?: WalletStatus;
}

export type TMobileMoneyWallet = BaseWallet & {
  type: "mobile money";
  mobileMoneyDetails: {
    fullName?: string;
    bankId?: number;
    network: NetworkType | null;
    phone: IPhone;
  };
};

export type TCreditCardWallet = BaseWallet & {
  type: "credit card";
  cardDetails: {
    data?: {
      bin?: string;
      brand?: string;
      sub_brand?: string;
      country_code?:string;
      country_name?: string;
      card_type?: string;
      bank?: string;
      currency?: string;
      linked_bank_id?: string;
    };
    number: string;
    cvv: string;
    expiry_year: string;
    expiry_month: string;
  };
};

export type BankWallet = BaseWallet & {
  type: "bank";
  bankDetails: {
    account_number: string;
    code: string;
  };
  // Add bank-specific properties here if needed
};

export type IWallet = TMobileMoneyWallet | TCreditCardWallet;

type BaseWalletPayload = {
  type: WalletType;
};

export type WalletPayload =
  | (BaseWalletPayload & {
      type: "mobile money";
      mobileMoneyDetails: {
        network: NetworkType;
        phone: IPhone;
      };
    })
  | {
      type: "credit card";
      cardDetails: {
        number: string;
        cvv: string;
        expiry_year: string;
        expiry_month: string;
      };
    }
  | {
      type: "bank";
      bankDetails: {
        accountNumber: string;
        code: string;
      };
    };
