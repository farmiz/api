import { Model } from "mongoose";
import { BaseService } from "..";
import { ProfileImage, ProfileImageProps } from "../../mongoose/models/Files";

class ProfileImageService extends BaseService<ProfileImageProps> {
  protected readonly model: Model<ProfileImageProps>;

  constructor(model: Model<ProfileImageProps>) {
    super(model);
    this.model = model;
  }
}
export const discoveryFileService = new ProfileImageService(ProfileImage);
