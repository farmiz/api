import { Model } from "mongoose";
import { BaseService } from "..";
import PinCodeModel, { Pin } from "../../mongoose/models/Pin";

class PinService extends BaseService<Pin> {
  protected readonly model: Model<Pin>;

  constructor(model: Model<Pin>) {
    super(model);
    this.model = model
  }
}
export const pinService = new PinService(PinCodeModel);
