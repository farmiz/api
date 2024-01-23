import mongoose, { Schema } from "mongoose";
import { IDefaultPlugin } from "../../interfaces";
import { defaultPlugin } from "../utils";

export interface ProductProps extends IDefaultPlugin {
    name: string;
    _id?: string;
    id?: string;
}

const productSchema = new Schema<ProductProps>({
  name: {
    type: String,
    required: true,
  }
});

productSchema.plugin(defaultPlugin);

productSchema.virtual("productImage", {
  ref: "File",
  localField: "_id",
  foreignField: "productId",
  justOne: true,
  match: { deleted: false },
});

const Product = mongoose.model<ProductProps>("Product", productSchema);

export default Product;
