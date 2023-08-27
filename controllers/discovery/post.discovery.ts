import { NextFunction, Response } from "express";
import { IData } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import { hasValidLength } from "../../helpers";
import { discoveryService } from "../../services/discovery";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { DiscoveryModel } from "../../mongoose/models/Discovery";

const data: IData = {
  requireAuth: true,
  permission: ["discovery", "create"],
  rules: {
    body: {
      name: {
        required: true,
        fieldName: "Name",
        validate: [
          ({}, name: string) => hasValidLength(name, 3),
          "Name should be at least 3 chars long",
        ],
      },
      duration: {
        required: true,
        fieldName: "Duration",
      },
      description: {
        required: true,
        fieldName: "Description",
        validate: [
          ({}, name: string) => hasValidLength(name, 3),
          "Description should be at least 3 chars long",
        ],
      },
      tags: {
        required: true,
        fieldName: "Tags",
      },
      amount: {
        required: true,
        fieldName: "Amount",
      },
      profitPercentage: {
        required: true,
        fieldName: "Profit percentage",
      },
      riskLevel: {
        required: true,
        fieldName: "Risk level",
      },
      startDate: {
        required: true,
        fieldName: "Start date",
      },
      endDate: {
        required: true,
        fieldName: "End date",
      },
      closingDate: {
        required: true,
        fieldName: "Closing date",
      },
    },
  },
};

async function createDiscoveryHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const discoveryCreated = await discoveryService.create({...req.body, createdBy: req.user?.id});
    sendSuccessResponse<DiscoveryModel>(res, next, {
      success: true,
      response: discoveryCreated,
    });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
}

export default {
  method: "post",
  url: "/discovery",
  data,
  handler: createDiscoveryHandler,
};
