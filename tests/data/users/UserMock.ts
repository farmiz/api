import { PermissionOperation } from "./../../../interfaces/index";
import { Model } from "mongoose";
import User, { UserModel } from "../../../mongoose/models/Users";
import { MockBase } from "../../core/MockBase";
import { mockUserTemplate } from "./userTemplate";
import { range } from "lodash";
import { generateTokens } from "../../../helpers/auth/jwt";
import { ITokens } from "../../../mongoose/models/Tokens";
import { v4 as uuid } from "uuid";
import { assert } from "../../../helpers/asserts";
import Permission from "../../../mongoose/models/Permission";
import { passwordManager } from "../../../helpers/auth/password";
import { constructPermission } from "../../../helpers/permissions/permissions";
interface IUserMock extends UserModel {
  tokens?: ITokens;
  dummyKey?: string;
  userPermission?:
    | {
        [key: string]: PermissionOperation[];
      }
    | "*";
}
export class UserMock extends MockBase<IUserMock> {
  protected data: IUserMock[];
  protected model: Model<IUserMock>;
  constructor(
    template: () => IUserMock | Partial<IUserMock>,
    model: Model<IUserMock>,
  ) {
    super(template, model);
    this.model = model;
    this.template = template;
    this.data = [];
  }
  protected createTemplate(
    fieldsToOverride?: Partial<IUserMock>,
  ): IUserMock | Partial<IUserMock> {
    return { ...this.template(), ...fieldsToOverride };
  }

  async create(
    fieldsToOverride?: Partial<IUserMock>,
  ): Promise<IUserMock | null> {
    const overrideFields = this.createTemplate(fieldsToOverride);

    assert(overrideFields?.userPermission, "Add user permissions");

    const hashedPassword = await passwordManager.hashPassword(
      overrideFields.password as string,
    );
    overrideFields.password = hashedPassword;
    const user = new this.model(overrideFields);
    await user.save();

    const constructedPermission = constructPermission(
      fieldsToOverride?.userPermission!,
    );

    const permission = await Permission.create({
      access: constructedPermission,
      userId: user.id,
    });
    const { email, id, role } = user;
    const tokens = await generateTokens({ email, id, role });
    const newUser = {
      ...user.toObject(),
      dummyKey: overrideFields.dummyKey ?? uuid(),
      tokens,
      permission,
    };
    this.data.push(newUser);
    return newUser;
  }

  async createMany(
    totalDocumentToCreate = 3,
    fieldsToOverride?: Partial<IUserMock>,
  ): Promise<IUserMock[] | null> {
    const totalNumbersToArray = range(0, totalDocumentToCreate);
    for (let i = 0; i < totalNumbersToArray.length; i++) {
      const overrideFields = this.createTemplate(fieldsToOverride);

      const hashedPassword = await passwordManager.hashPassword(
        overrideFields.password as string,
      );
      overrideFields.password = hashedPassword;
      const user = new this.model(overrideFields);
      await user.save();
      const { email, id, role } = user;
      const tokens = await generateTokens({ email, id, role });
      const newUser = {
        ...user.toObject(),
        dummyKey: overrideFields.dummyKey ?? uuid(),
        tokens,
      };
      this.data.push(newUser);
    }
    return this.data;
  }
  async deleteOne(id: string): Promise<null> {
    const newData = this.data.filter((data: IUserMock) => data.id !== id);
    this.data = newData;
    return null;
  }

  getToken(id: string) {
    const dataToExtraToken = this.data.find(
      (user: IUserMock) => user.dummyKey === id || user.email === id,
    );
    return dataToExtraToken?.tokens?.accessToken;
  }
  getId(id: string): string | undefined {
    const user = this.data.find((_user: IUserMock) => _user.dummyKey === id);
    return user?.id;
  }
  getUser(id: string): IUserMock | undefined {
    const user = this.data.find((_user: IUserMock) => _user.id === id);
    return user;
  }
  async destroy(): Promise<any> {
    return await this.model.deleteMany({});
  }
}

export const mockUser = new UserMock(mockUserTemplate, User);
