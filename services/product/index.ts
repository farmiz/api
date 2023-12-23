import { Model } from "mongoose";
import { BaseService } from "..";
import Product, { ProductProps } from "../../mongoose/models/Product";

class ProductService extends BaseService<ProductProps> {
  protected readonly model: Model<ProductProps>;

  constructor(model: Model<ProductProps>) {
    super(model);
    this.model = model;
  }
}
export const productService = new ProductService(Product);
