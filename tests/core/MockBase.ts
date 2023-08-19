import { Model } from "mongoose";

export abstract class MockBase<T> {
  protected mockData: T[] = [];
  protected model: Model<T>;
  protected template: () => Partial<T>;
  constructor(template: () => Partial<T>, model: Model<T>) {
    this.template = template;
    this.model = model;
  }
  protected abstract createTemplate(
    overrideFields?: Partial<T>,
  ): T | Partial<T>;
  public abstract create(overrideFields?: Partial<T>): Promise<Partial<T> | null>;
  public abstract createMany(
    totalDocumentToCreate?: number,
    overrideFields?: Partial<T>,
  ): Promise<Partial<T>[] | null>;
  public abstract deleteOne(id: string): Promise<null>;
  public abstract destroy():Promise<Partial<T[]> | null>;
}
