import { Model } from "mongoose";
import { BaseService } from "..";
import GrowthStages, {
  GrowthStageProps,
} from "../../mongoose/models/GrowthStages";

class GrowthStageService extends BaseService<GrowthStageProps> {
  protected readonly model: Model<GrowthStageProps>;

  constructor(model: Model<GrowthStageProps>) {
    super(model);
    this.model = model;
  }
}

export const growthStagesService = new GrowthStageService(GrowthStages);
