import { NextFunction, Response } from "express";
import { IData } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import User from "../../mongoose/models/Users";
import { RequestError } from "../../helpers/errors";

const data: IData = {
  requireAuth: true,
  permission: ["users", "read"],
  rules: {
    body: {},
  },
};

async function getCustomersOverviewHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    if (req.user?.role) {
      if (["customer", "support"].includes(req.user?.role)) {
        return next(new RequestError(401, "UnAuthorized"));
      }
    }
    
    const query = {
      role: "customer",
    };
  
    const pipeline = [
      {
        $match: query,
      },
      {
        $group: {
          _id: null,
          totalActiveUsers: {
            $sum: {
              $cond: { if: { $eq: ["$status", "active"] }, then: 1, else: 0 },
            },
          },
          totalInactiveUsers: {
            $sum: {
              $cond: { if: { $ne: ["$status", "active"] }, then: 1, else: 0 },
            },
          },
          customers: { $push: "$$ROOT" },
        },
      },
      {
        $addFields: {
          customers: { $slice: ["$customers", -30] },
        },
      },
    ];

    const response = await User.aggregate(pipeline);
    sendSuccessResponse(res, next, {
      response: response[0] || {},
      success: true,
    });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}
export default {
  data,
  url: "/customers/overview",
  handler: getCustomersOverviewHandler,
  method: "get",
};
