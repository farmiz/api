import { userService } from "../users";
import { passwordManager } from "./../../helpers/auth/password";
import { UserModel } from "./../../mongoose/models/Users";

type validUserRegistrationFields =
  | "email"
  | "password"
  | "role"
  | "firstName"
  | "lastName"
  | "dateOfBirth"
  | "phone"
  | "username";
export const createUser = async (
  data: Pick<UserModel, validUserRegistrationFields>,
): Promise<UserModel> => {
  const { email, password, role, firstName, lastName, dateOfBirth, phone, username } =
    data;
  const hashedPassword = await passwordManager.hashPassword(password);
  const user = await userService.create({
    email,
    password: hashedPassword,
    role,
    firstName,
    lastName,
    phone,
    dateOfBirth,
    username
  });
  return user;
};
