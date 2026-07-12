import { Request, Response } from 'express';
export declare const uploadVideo: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getVideoStatus: (req: Request, res: Response) => Promise<void>;
export declare const uploadFile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUploadJobs: (_req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=admin.upload.controller.d.ts.map