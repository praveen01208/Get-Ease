import { IPaymentService, PaymentOrder, PaymentVerification } from './IPaymentService';
/**
 * Real Razorpay integration. Reads credentials from env:
 *   RAZORPAY_KEY_ID     — public, also shipped to the browser
 *   RAZORPAY_KEY_SECRET — server-only, used to auth API calls and verify signatures
 *
 * If either credential is missing the service will fail to construct; the
 * controller falls back to the mock service in that case.
 */
export declare class RazorpayPaymentService implements IPaymentService {
    private client;
    private keyId;
    private keySecret;
    constructor();
    createOrder(amount: number, currency: string, courseId: string, userId: string): Promise<PaymentOrder>;
    verifyPayment(v: PaymentVerification): Promise<boolean>;
}
//# sourceMappingURL=RazorpayPaymentService.d.ts.map