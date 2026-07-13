import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
export declare const getDashboard: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getWishlist: (req: AuthRequest, res: Response) => Promise<void>;
export declare const addToWishlist: (req: AuthRequest, res: Response) => Promise<void>;
export declare const removeFromWishlist: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getPurchases: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getProfile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateProfile: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const changePassword: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=student.controller.d.ts.map