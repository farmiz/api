import { RequestError } from "../helpers/errors";
import { IWallet, WalletPayload } from "../interfaces/wallet";
import { TokenWithExpiration } from "../mongoose/models/Tokens";
import { RouteTypes } from "./../interfaces";
import * as crypto from "crypto";
export function hasCorrectHttpVerb(httpVerb: RouteTypes): boolean | void {
  if (!["post", "get", "put", "delete"].includes(httpVerb)) {
    new RequestError(500, "Invalid http method");
  }
  return true;
}

export const selectRandomItem = <T>(data: T[]): T => {
  const convertedArray = Array.from(data);
  return data[Math.floor(Math.random() * convertedArray.length)];
};

interface QueryBuilderResult {
  filter: any;
  options: any;
}
// /api/items?search=apple&searchSelection=name,description&sort=-price,rating&limit=20&currentPage=3&columns=name,price,description
export function queryBuilder<T = any>(
  reqQuery: any,
  searchableFields: (keyof T)[],
): QueryBuilderResult {
  const { search, searchSelection, limit, sort, currentPage, columns } =
    reqQuery;
  // Filter
  let filter: any = {};
  if (search && searchSelection && searchableFields.includes(searchSelection)) {
    // Build the $or array for searching in the specified field
    filter[searchSelection] = { $regex: search, $options: "i" };
  } else if (search) {
    // Build the $or array for searching in multiple fields
    const orConditions = searchableFields.map((field: keyof T) => ({
      [field]: { $regex: search, $options: "i" },
    }));

    filter.$or = orConditions;
  }

  // Options
  let options: any = {};

  // Limit
  if (limit) {
    options.limit = parseInt(limit);
  }

  // Sort
  if (sort) {
    const sortFields = sort.split(",");
    const sortOptions: any = {};
    sortFields.forEach((field: string) => {
      if (field.startsWith("-")) {
        sortOptions[field.substring(1)] = -1; // Descending order
      } else {
        sortOptions[field] = 1; // Ascending order
      }
    });
    options.sort = sortOptions;
  }

  // Pagination
  const perPage = parseInt(limit) || 10;
  const page = parseInt(currentPage) || 1;
  const skip = (page - 1) * perPage;
  options.skip = skip;

  return { filter, options };
}

export type NetworkTypes = "MTN" | "VODAFONE" | "Airtel Tigo";

const networkRegex: { [key in NetworkTypes]: RegExp } = {
  MTN: /^([0])?([2]|[5])([4]|[5]|[3]|[9])\d{7}$/,
  VODAFONE: /^([0])?([2]|[5])([0])\d{7}$/,
  "Airtel Tigo": /^([0])?([2]|[5])([6]|[7])\d{7}$/,
};

export function getNetworkBaseOnNumber(
  phoneNumber: string,
): NetworkTypes | null {
  let result: NetworkTypes | null = null;

  for (const telecom in networkRegex) {
    const telecomType = telecom as NetworkTypes;
    const regex = networkRegex[telecomType];
    if (regex.test(phoneNumber)) {
      result = telecom as NetworkTypes;
      break;
    }
  }
  return result;
}

export const buildPayloadUpdates = (data: Record<string, any>) => {
  const filteredData = Object.entries(data).reduce(
    (result: Record<string, any>, [key, value]) => {
      if (value) {
        result[key] = value;
      }
      return result;
    },
    {},
  );

  return filteredData;
};

export const getRandomId = (min = 0, max = 500000) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  const num = Math.floor(Math.random() * (max - min + 1)) + min;
  return num.toString().padStart(6, "0");
};

export function extractWalletData(
  walletData: WalletPayload,
  userId: string,
  data: Record<string, any>,
): IWallet | null {
  let dataToStore: IWallet | null = null;
  if (walletData && Object.keys(walletData).length > 0) {
    if (walletData.type === "mobile money") {
      const network = modeMomoTypeForPaystack(
        `${walletData.mobileMoneyDetails.phone.number}`,
      );
      dataToStore = {
        mobileMoneyDetails: {
          network,
          fullName: data.account_name,
          bankId: data.bank_id,
          phone: {
            number: walletData.mobileMoneyDetails.phone.number,
            prefix: walletData.mobileMoneyDetails.phone.prefix,
          },
        },
        type: "mobile money",
        userId,
      };
    }
    if (walletData.type === "credit card") {
      dataToStore = {
        cardDetails: {
          data,
          cvv: walletData.cardDetails.cvv,
          expiry_month: walletData.cardDetails.expiry_month,
          expiry_year: walletData.cardDetails.expiry_year,
          number: walletData.cardDetails.number,
        },
        userId,
        type: "credit card",
      };
    }
  }
  return dataToStore;
}

export function modeMomoTypeForPaystack(phone: string) {
  const network = getNetworkBaseOnNumber(`0${phone}`);
  return network === "VODAFONE"
    ? "VOD"
    : network === "Airtel Tigo"
    ? "ATL"
    : network;
}

const { EMAIL_SENDER, APP_NAME } = process.env;

type DefaultSenderEmails = "sales" | "support" | "payment" | "welcome";
const defaultSenderEmails: { [K in DefaultSenderEmails]: string } = {
  sales: "sales-noreply@farmiz.co",
  support: "support-noreply@farmiz.co",
  payment: "payment-noreply@farmiz.co",
  welcome: "welcome-noreply@farmiz.co",
};
export const defaultFrom = (type: DefaultSenderEmails, from?: string) => {
  const sender = from ? from : defaultSenderEmails[type];
  `${APP_NAME} <${sender}>`;
};
export const roundNumber = (data: number | string, round: number = 2) =>
  (Number(data) / 100).toFixed(round);

export function generateRandomNumber(length: number): string {
  if (length <= 0) {
    throw new Error("Length must be greater than 0");
  }

  const buffer = crypto.randomBytes(Math.ceil(length / 2));
  const randomHex = buffer.toString("hex");
  return randomHex.slice(0, length);
}
const { MAIN_ORIGIN } = process.env;
// Generate a unique URL with the token appended as a query parameter
export const generateVerificationUrl = (
  tokenData: TokenWithExpiration | null,
) => {
  return `${MAIN_ORIGIN}/verify?token=${tokenData?.token}&type=${tokenData?.type}`;
};
