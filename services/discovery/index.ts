import { Model } from "mongoose";
import { BaseService } from "..";
import { DiscoveryModel, Discovery } from "../../mongoose/models/Discovery";

class DiscoveryService extends BaseService<DiscoveryModel> {
  protected readonly model: Model<DiscoveryModel>;

  constructor(model: Model<DiscoveryModel>) {
    super(model);
    this.model = model;
  }
}
export const discoveryService = new DiscoveryService(Discovery);
