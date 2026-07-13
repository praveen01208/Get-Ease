import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
export declare const paymentProvider: () => 'razorpay' | 'mock';
export declare const getPaymentConfig: (_req: Request, res: Response) => void;
export declare const createOrder: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const verifyPayment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=payment.controller.d.ts.map