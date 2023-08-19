import { PermissionOperation } from "./../../../interfaces/index";
import { Model } from "mongoose";
import User, { UserModel } from "../../../mongoose/models/Users";
import { MockBase } from "../../core/MockBase";
import { range } from "lodash";
import { generateTokens } from "../../../helpers/auth/jwt";
import { ITokens } from "../../../mongoose/models/Tokens";
import { v4 as uuid } from "uuid";
import { assert } from "../../../helpers/asserts";
import Permission from "../../../mongoose/models/Permission";
import { passwordManager } from "../../../helpers/auth/password";
import { constructPermission } from "../../../helpers/permissions/permissions";
import { mockPinTemplate } from "./pinTemplate";
import PinCodeModel, { Pin } from "../../../mongoose/models/Pin";
interface IPinMock extends Pin {
  tokens?: ITokens;
  dummyKey?: string;
}
export class PinMock extends MockBase<IPinMock> {
  protected data: IPinMock[];
  protected model: Model<IPinMock>;
  constructor(
    template: () => IPinMock | Partial<IPinMock>,
    model: Model<IPinMock>,
  ) {
    super(template, model);
    this.model = model;
    this.template = template;
    this.data = [];
  }
  protected createTemplate(
    fieldsToOverride?: Partial<IPinMock>,
  ): IPinMock | Partial<IPinMock> {
    return { ...this.template(), ...fieldsToOverride };
  }

  async create(
    fieldsToOverride?: Partial<IPinMock>,
  ): Promise<IPinMock | null> {
    const overrideFields = this.createTemplate(fieldsToOverride);
    const pin = new this.model(overrideFields);
    await pin.save();

    this.data.push(pin);
    return pin;
  }

  async createMany(
    totalDocumentToCreate = 3,
    fieldsToOverride?: Partial<IPinMock>,
  ): Promise<IPinMock[] | null> {
    const totalNumbersToArray = range(0, totalDocumentToCreate);
    for (let i = 0; i < totalNumbersToArray.length; i++) {
      const overrideFields = this.createTemplate(fieldsToOverride);
      const pin = new this.model(overrideFields);
      await pin.save();
      this.data.push(pin);
    }
    return this.data;
  }
  async deleteOne(id: string): Promise<null> {
    const newData = this.data.filter((data: IPinMock) => data.id !== id);
    this.data = newData;
    return null;
  }

  getToken(id: string) {
    const dataToExtraToken = this.data.find(
      (pin: IPinMock) => pin.dummyKey === id || pin.id === id,
    );
    return dataToExtraToken?.tokens?.accessToken;
  }
  getId(id: string): string | undefined {
    const pin = this.data.find((_pin: IPinMock) => _pin.dummyKey === id);
    return pin?.id;
  }
  getUser(id: string): IPinMock | undefined {
    const pin = this.data.find((_pin: IPinMock) => _pin.id === id);
    return pin;
  }
  async destroy(): Promise<any> {
    return await this.model.deleteMany({});
  }
}

export const mockPin = new PinMock(mockPinTemplate, PinCodeModel);
