import { NextFunction, Response } from "express";
import { IData } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { ceil } from "lodash";
import { queryBuilder } from "../../utils";
import { SponsorshipProps } from "../../interfaces/sponsorship";
import { sponsorshipService } from "../../services/sponsorship";
import { RequestError } from "../../helpers/errors";
import { httpCodes } from "../../constants";

const data: IData = {
  requireAuth: true,
  permission: ["sponsor", "read"],
  rules: {
    query: {},
  },
};

async function getSponsorsHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    let { query } = req;

    const filter: Record<string, any> = {
      deleted: false,
    };
    if (req.user?.role === "customer") {
      filter.userId = req.user.id;
    }
    const buildQuery = queryBuilder<SponsorshipProps>(query, [
      "status",
      "endDate",
      "startDate",
      "isActive",
    ]);
    buildQuery.filter = { ...buildQuery.filter, ...filter };

    const sponsorships = await sponsorshipService.findMany(
      buildQuery.filter,
      null,
      null,
      buildQuery.options,
    );
    if (!sponsorships) {
      return next(
        new RequestError(httpCodes.BAD_REQUEST.code, "No sponsorship found"),
      );
    }
    const totalDocuments = await sponsorshipService.countDocuments(filter);
    const perPage = filter.perPage || 50;
    const response = {
      data: sponsorships,
      paginator: {
        page: totalDocuments,
        perPage,
        totalPages: ceil(totalDocuments / perPage),
      },
    };
    sendSuccessResponse(res, next, { response, success: true });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}
export default {
  data,
  url: "/sponsors",
  handler: getSponsorsHandler,
  method: "GET",
};
