import { IData } from "../../interfaces";

import { AuthRequest } from "../../middleware";
import { NextFunction, Response } from "express";
import {
  sendFailedResponse,
  sendSuccessResponse,
} from "../../helpers/requestResponse";
import { userService } from "../../services/users";

const data: IData = {
  requireAuth: true,
  permission: ["users", "delete"],
  rules: {
    params: {
      id: {
        required: true,
      },
    },
  },
};

const deleteUserHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req;
    const data = {
      deletedBy: user?.id,
      deleted: true,
      deletedAt: new Date(),
    };

    const filter: Record<string, any> = {
      _id: req.params.id,
    };

    const deletedUser = await userService.updateOne(filter, data);
    sendSuccessResponse(res, next, {
      success: true,
      response: deletedUser,
    });
  } catch (error: any) {
    sendFailedResponse(res, next, error);
  }
};

export default {
  method: "delete",
  url: "/:id/users",
  data,
  handler: deleteUserHandler,
};
