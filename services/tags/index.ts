import { Model } from "mongoose";
import { BaseService } from "..";
import Tags, { TagsModel } from "../../mongoose/models/Tags";


class TagsService extends BaseService<TagsModel> {
  protected readonly model: Model<TagsModel>;

  constructor(model: Model<TagsModel>) {
    super(model);
    this.model = model;
  }
}
export const tagsService = new TagsService(Tags);
