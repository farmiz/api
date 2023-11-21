import { Model } from "mongoose";
import { BaseService } from "..";
import { DiscoveryFiles, DiscoveryFilesProps } from "../../mongoose/models/Files";

class DiscoveryFileService extends BaseService<DiscoveryFilesProps> {
  protected readonly model: Model<DiscoveryFilesProps>;

  constructor(model: Model<DiscoveryFilesProps>) {
    super(model);
    this.model = model;
  }
}
export const discoveryFileService = new DiscoveryFileService(DiscoveryFiles);
