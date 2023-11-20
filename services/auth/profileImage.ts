import { Model } from "mongoose";
import { BaseService } from "..";
import ProfileImageModel, {
  ProfileImageProps,
} from "../../mongoose/models/ProfileImage";

class ProfileImageService extends BaseService<ProfileImageProps> {
  protected readonly model: Model<ProfileImageProps>;

  constructor(model: Model<ProfileImageProps>) {
    super(model);
    this.model = model;
  }
}
export const profileImageService = new ProfileImageService(ProfileImageModel);
