import { Model } from "mongoose";
import User, { UserModel } from "../../mongoose/models/Users";
import { BaseService } from "..";

class UserService extends BaseService<UserModel> {
  protected readonly model: Model<UserModel>;

  constructor(model: Model<UserModel>) {
    super(model);
    this.model = model
  }
}
export const userService = new UserService(User);
