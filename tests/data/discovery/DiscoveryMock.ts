
import { Model } from "mongoose";
import { MockBase } from "../../core/MockBase";
import { range } from "lodash";
import { v4 as uuid } from "uuid";
import { mockDiscoveryTemplate } from "./discoveryTemplate";
import { Discovery, DiscoveryModel } from "../../../mongoose/models/Discovery";
interface IDiscoveryMock extends DiscoveryModel{
    dummyKey?: string;
}
export class DiscoveryMock extends MockBase<IDiscoveryMock> {
  protected data: IDiscoveryMock[];
  protected model: Model<IDiscoveryMock>;
  constructor(
    template: () => Partial<IDiscoveryMock>,
    model: Model<IDiscoveryMock>,
  ) {
    super(template, model);
    this.model = model;
    this.template = template;
    this.data = [];
  }
  protected createTemplate(
    fieldsToOverride?: Partial<IDiscoveryMock>,
  ): Partial<IDiscoveryMock> {
    const template = this.template();
    return {...template, ...fieldsToOverride };
  }

  async create(
    fieldsToOverride?: Partial<IDiscoveryMock>,
  ): Promise<IDiscoveryMock | null> {
    const overrideFields = this.createTemplate(fieldsToOverride);
    const discovery = new this.model({...overrideFields});
    await discovery.save();
    const newDiscovery = {
      ...discovery.toObject(),
      dummyKey: overrideFields.dummyKey ?? uuid(),
    };
    this.data.push(newDiscovery);
    return newDiscovery;
  }

  async createMany(
    totalDocumentToCreate = 3,
    fieldsToOverride?: Partial<IDiscoveryMock>,
  ): Promise<Partial<IDiscoveryMock>[] | null> {
    const totalNumbersToArray = range(0, totalDocumentToCreate);
    for (let i = 0; i < totalNumbersToArray.length; i++) {
      const overrideFields = this.createTemplate(fieldsToOverride);

      const discovery = new this.model(overrideFields);
      await discovery.save();
      const newDiscovery = {
        ...discovery.toObject(),
      ...overrideFields
      };
      this.data.push(newDiscovery);
    }
    return this.data;
  }
  async deleteOne(id: string): Promise<null> {
    const newData = this.data.filter((data: IDiscoveryMock) => data.id !== id);
    this.data = newData;
    return null;
  }

  getId(dummykey: string): string | undefined {
    const discovery = this.data.find((_discovery: IDiscoveryMock) => _discovery.dummyKey === dummykey);
    return discovery?.id || discovery?._id;
  }
  getDiscovery(id: string): IDiscoveryMock | undefined {
    const discovery = this.data.find((_discovery: IDiscoveryMock) => _discovery.id === id);
    return discovery;
  }
  async destroy(): Promise<any> {
    return await this.model.deleteMany({});
  }
}
export const discoveryMock = new DiscoveryMock(mockDiscoveryTemplate, Discovery)