import { Model } from "mongoose";
import { BaseService } from "..";
import { ProductFiles, ProductFilesProps } from "../../mongoose/models/Files";

class ProductFileService extends BaseService<ProductFilesProps> {
  protected readonly model: Model<ProductFilesProps>;

  constructor(model: Model<ProductFilesProps>) {
    super(model);
    this.model = model;
  }
}
export const productFileService = new ProductFileService(ProductFiles);
