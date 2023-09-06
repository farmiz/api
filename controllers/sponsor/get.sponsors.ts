import { NextFunction, Response } from 'express';
  import { IData } from '../../interfaces';
  import { AuthRequest } from '../../middleware';
  import { sendFailedResponse, sendSuccessResponse } from '../../helpers/requestResponse';
  
  const data: IData = {
    requireAuth: true,
    permission: ["sponsor", "read"],
    rules: {
      body: {},
    },
  };
  
  async function getSponsorsHandler(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const response = {
        message: 'it worked...',
      };
      sendSuccessResponse(res, next, { response, success: true });
    } catch (error: any) {
      sendFailedResponse(res, next, error);
    }
  }
  export default {
    data,
    url: '/sponsors',
    handler: getSponsorsHandler,
    method: 'GET',
  };
  