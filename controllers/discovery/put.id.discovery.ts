import { IData } from "../../interfaces";
import { AuthRequest } from "../../middleware";
import { NextFunction, Response } from "express";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { buildPayloadUpdates } from "../../utils";
import { discoveryService } from "../../services/discovery";
import { hasValidLength } from "../../helpers";

const data: IData = {
  requireAuth: true,
  permission: ["discovery", "update"],
  rules: {
    params: {
      id: {
        required: true,
        authorize: discoveryService._exists,
      },
    },
    body: {
        name: {
          required: false,
          fieldName: "Name",
          validate: [
            ({}, name: string) => hasValidLength(name, 3),
            "Name should be at least 3 chars long",
          ],
        },
        duration: {
          required: false,
          fieldName: "Duration",
        },
        description: {
          required: false,
          fieldName: "Description",
          validate: [
            ({}, name: string) => hasValidLength(name, 3),
            "Description should be at least 3 chars long",
          ],
        },
        tags: {
          required: false,
          fieldName: "Tags",
        },
        amount: {
          required: false,
          fieldName: "Amount",
        },
        profitPercentage: {
          required: false,
          fieldName: "Profit percentage",
        },
        riskLevel: {
          required: false,
          fieldName: "Risk level",
        },
        startDate: {
          required: false,
          fieldName: "Start date",
        },
        endDate: {
          required: false,
          fieldName: "End date",
        },
        closingDate: {
          required: false,
          fieldName: "Closing date",
        },
      },
  },
};

const updateSingleWalletHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { params } = req;

    const filter: Record<string, any> = {
      _id: params.id,
      deleted: true,
    };

    const fieldsToUpdate = buildPayloadUpdates(req.body);
    const discovery = await discoveryService.updateOne(filter, fieldsToUpdate);

    sendSuccessResponse(res, next, {
      success: true,
      response: discovery,
    });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
};

export default {
  method: "put",
  url: "/:id/discovery",
  data,
  handler: updateSingleWalletHandler,
};
