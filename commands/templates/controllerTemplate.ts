export function generateCode({
    endpoint,
    permissions,
    httpMethod,
    controllerHandler,
  }: {
    endpoint: string;
    permissions: string[];
    httpMethod: string;
    controllerHandler: string;
  }): string {
    return `import { NextFunction, Response } from 'express';
  import { IData } from '../../interfaces';
  import { AuthRequest } from '../../middleware';
  import { sendFailedResponse, sendSuccessResponse } from '../../helpers/requestResponse';
  
  const data: IData = {
    requireAuth: true,
    permission: [${permissions.map((perm) => `"${perm.trim()}"`).join(', ')}],
    rules: {
      body: {},
    },
  };
  
  async function ${controllerHandler}(req: AuthRequest, res: Response, next: NextFunction) {
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
    url: '${endpoint}',
    handler: ${controllerHandler},
    method: '${httpMethod}',
  };
  `;
  }