import { PopulateOptions } from "mongoose";
import { AuthRequest } from "../middleware";
import { UserRole, userRoles, userStatuses } from "../interfaces/users";
import { differenceInYears, isFuture, isToday, parseISO } from "date-fns";
import {
  IAddress,
  IPhone,
  PermissionOperation,
  PermissionString,
} from "../interfaces";
import { userService } from "../services/users";
import { SPECIAL_ROLES } from "../constants";
import { TCreditCardWallet, TMobileMoneyWallet } from "../interfaces/wallet";
import { networkTypes } from "../mongoose/models/Wallet";
import {
  PERMISSIONS_LIST,
  PERMISSION_OPERATIONS,
} from "./permissions/permissions";
import { UserStatus } from "../interfaces/users";

export const isActualObject = (obj: Record<string, any>): boolean =>
  !!(!Array.isArray(obj) && obj && Object.keys(obj).length);

export const returnDuplicates = (data: any[]): any[] => {
  return data.filter((item, index) => data.indexOf(item) !== index);
};
export const range = (start: number, end: number, step: number = 1) => {
  const len = Math.floor((end - start) / step) + 1;
  return Array(len)
    .fill(start, end)
    .map((_, i) => start + i * step);
};

export const formatModelProjection = <T>(
  includes?: (keyof T)[],
  excludes?: (keyof T)[],
): Record<keyof T, number> => {
  const includesFormatted: Record<keyof T, number> = {} as Record<
    keyof T,
    number
  >;
  const excludeFormatted: Record<keyof T, number> = {} as Record<
    keyof T,
    number
  >;

  if (includes && includes.length) {
    for (const field of includes) {
      includesFormatted[field] = 1;
    }
  }
  if (excludes && excludes.length) {
    for (const field of excludes) {
      excludeFormatted[field] = 0;
    }
  }
  return { ...includesFormatted, ...excludeFormatted };
};
export const formatModelPopulate = (
  fieldsToPopulate?: Record<string, string[]> | string[],
): PopulateOptions[] => {
  const fields: PopulateOptions[] = [];

  if (fieldsToPopulate) {
    if (Array.isArray(fieldsToPopulate)) {
      fieldsToPopulate.forEach(path => {
        fields.push({ path });
      });
    } else {
      for (const field in fieldsToPopulate) {
        if (Object.prototype.hasOwnProperty.call(fieldsToPopulate, field)) {
          const populateField = fieldsToPopulate[field].length
            ? { select: fieldsToPopulate[field].join(" ") }
            : {};

          fields.push({
            path: field,
            ...(Object.keys(populateField).length && { ...populateField }),
          });
        }
      }
    }
  }

  return fields;
};

export const trimAndClean = (value: string) => value.trim();

export type PermissionObject = {
  [key in PermissionString]: PermissionOperation[];
};
function isValidPermissionObject(
  permissions: PermissionObject,
  permissionOperations: PermissionOperation[],
) {
  for (const key in permissions) {
    if (permissions.hasOwnProperty(key)) {
      const values: PermissionOperation[] =
        permissions[key as PermissionString];
      if (!values.every(value => permissionOperations.includes(value))) {
        return false;
      }
    }
  }
  return true;
}
export const validatePermission = ({}, permissions: PermissionObject) => {
  const permissionKeys = Object.keys(permissions) as PermissionString[];
  console.log({ permissions })
  const permissionHasValidKeys = permissionKeys.every((key: PermissionString) =>
    PERMISSIONS_LIST.includes(key),
  );
  return (
    isValidPermissionObject(permissions, PERMISSION_OPERATIONS) &&
    permissionHasValidKeys
  );
};
export const hasValidRole = ({}, role: UserRole) => {
  // if (!["support", "admin"].includes(req.user?.role as string)) {
  //   return !["admin", "support"].includes(role);
  // }
  // const filteredRoles = userRoles.filter(
  //   role => !["admin", "support"].includes(role),
  // );
  return userRoles.includes(role);
};
export const hasValidStatus = (status: UserStatus) =>
  userStatuses.includes(status);
export const validName = ({}, val: string) => val.length >= 3;
export const dataHasValidLength = (data: string, dataLength: number) =>
  data.length >= dataLength;

export const dataCanBeFoundInArray = (data: string | number, array: any[]) =>
  array.includes(data);

export const isOver18 = (birthDate: string) =>
  differenceInYears(new Date(), parseISO(birthDate)) >= 18;

export const isTodayOrFuture = (date: string) =>
  isToday(parseISO(date)) || isFuture(parseISO(date));

export const hasValidAddress = ({}, address: IAddress): boolean => {
  // if (address && !Object.keys(address).length) return true;
  return !!(address.country && address.city && address.state && address.street);
};

export const hasValidPermissionData = (
  {},
  permission: {
    [key: string]: PermissionOperation[];
  },
) => {
  if (!permission || !Object.keys(permission).length) return true;
  if (permission && !Object.keys(permission).length) return true;

  return true;
};

export const canViewUserDetails = async (req: AuthRequest, userId: string) => {
  const userRole = req?.user?.role as UserRole;
  if (!SPECIAL_ROLES.includes(userRole)) {
    const user = await userService.findOne({
      _id: userId,
      deleted: false,
    });
    return !!user;
  }
  return true;
};

export const phoneExists = async (phone: IPhone): Promise<boolean> => {
  return !!(await userService.findOne({ phone }));
};
export const hasValidPhone = (phone: IPhone): boolean => {
  return !!(
    isActualObject(phone) &&
    phone.number &&
    phone.number.length === 9 &&
    phone.prefix &&
    phone.prefix.length === 3 &&
    ["233"].includes(phone.prefix)
  );
};

export function hasValidLength(data: string, length: number) {
  return data.length === length;
}
export const hasValidCreditCardDetails = (
  details: TCreditCardWallet["cardDetails"],
): boolean => {
  return !!(
    isActualObject(details) &&
    details.cvv &&
    hasValidLength(details.cvv, 3) &&
    details.expiry_month &&
    hasValidLength(details.expiry_month, 2) &&
    details.expiry_year &&
    hasValidLength(details.expiry_year, 2) &&
    details.number
  );
};

export const hasValidMobileMoneyDetails = (
  details: TMobileMoneyWallet["mobileMoneyDetails"],
): boolean => {
  return !!(
    isActualObject(details) &&
    details.network &&
    networkTypes.includes(details.network) &&
    isActualObject(details.phone) &&
    details.phone.number &&
    details.phone.number.length === 9 &&
    details.phone.prefix &&
    details.phone.prefix === "233"
  );
};
