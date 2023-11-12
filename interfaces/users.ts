import { IAddress, IDefaultPlugin, IPhone } from ".";

export type UserRole = "admin" | "support" | "customer";

export const userRoles: UserRole[] = ["admin", "support", "customer"];
export type Gender = "male" | "female" | "non-binary" | "other";
export const genders: Gender[] = ["female", "male", "non-binary", "other"];
export type UserStatus =
  | "active"
  | "suspended"
  | "pendingApproval"
  | "inactive";
export const userStatuses: UserStatus[] = [
  "active",
  "suspended",
  "pendingApproval",
  "inactive",
];
export interface IUser extends IDefaultPlugin {
  id?: string;
  email: string;
  phone?: IPhone;
  username?: string;
  password: string;
  role?: UserRole;
  firstName?: string;
  lastName?: string;
  gender?: Gender;
  physicalAddress?: IAddress;
  mailingAddress?: IAddress;
  status?: UserStatus;
  deleted?: boolean;
  isLoggedIn?: boolean;
  dateOfBirth?: Date;
  lastLoggedInDate?: Date;
  permission?: any;
}

// permission?: {
//   access: string;
//   userId?: string;
// }; this is the virtual

// permission? : {}
