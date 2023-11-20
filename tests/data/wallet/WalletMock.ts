
import { Model } from "mongoose";
import { MockBase } from "../../core/MockBase";
import { range } from "lodash";
import { v4 as uuid } from "uuid";
type IWalletMock  =  any
export class WalletMock extends MockBase<IWalletMock> {
  protected data: IWalletMock[];
  protected model: Model<IWalletMock>;
  constructor(
    template: () => Partial<IWalletMock>,
    model: Model<IWalletMock>,
  ) {
    super(template, model);
    this.model = model;
    this.template = template;
    this.data = [];
  }
  protected createTemplate(
    fieldsToOverride?: Partial<IWalletMock>,
  ): Partial<IWalletMock> {
    const template = this.template();
    return {...template, ...fieldsToOverride };
  }

  async create(
    fieldsToOverride?: Partial<IWalletMock>,
  ): Promise<IWalletMock | null> {
    const overrideFields = this.createTemplate(fieldsToOverride);
    const wallet = new this.model({...overrideFields});
    await wallet.save();
    const newWallet = {
      ...wallet.toObject(),
      dummyKey: overrideFields.dummyKey ?? uuid(),
    };
    this.data.push(newWallet);
    return newWallet;
  }

  async createMany(
    totalDocumentToCreate = 3,
    fieldsToOverride?: Partial<IWalletMock>,
  ): Promise<Partial<IWalletMock>[] | null> {
    const totalNumbersToArray = range(0, totalDocumentToCreate);
    for (let i = 0; i < totalNumbersToArray.length; i++) {
      const overrideFields = this.createTemplate(fieldsToOverride);

      const wallet = new this.model(overrideFields);
      await wallet.save();
      const newWallet = {
        ...wallet.toObject(),
      ...overrideFields
      };
      this.data.push(newWallet);
    }
    return this.data;
  }
  async deleteOne(id: string): Promise<null> {
    const newData = this.data.filter((data: IWalletMock) => data.id !== id);
    this.data = newData;
    return null;
  }

  getId(id: string): string | undefined {
    const wallet = this.data.find((_wallet: IWalletMock) => _wallet.dummyKey === id);
    return wallet?.id;
  }
  getWallet(id: string): IWalletMock | undefined {
    const wallet = this.data.find((_wallet: IWalletMock) => _wallet.id === id);
    return wallet;
  }
  async destroy(): Promise<any> {
    return await this.model.deleteMany({});
  }
}