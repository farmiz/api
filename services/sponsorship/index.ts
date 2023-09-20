
import { Model } from "mongoose";
import { BaseService } from "..";
import Sponsorship,{ SponsorshipModel  } from "../../mongoose/models/Sponsorship";

class SponsorshipService extends BaseService<SponsorshipModel> {
  protected readonly model: Model<SponsorshipModel>;

  constructor(model: Model<SponsorshipModel>) {
    super(model);
    this.model = model;
  }
}
export const sponsorshipService = new SponsorshipService(Sponsorship);