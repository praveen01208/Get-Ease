import { IPaymentService, PaymentOrder, PaymentVerification } from './IPaymentService';
export declare class MockPaymentService implements IPaymentService {
    createOrder(amount: number, currency: string, courseId: string, userId: string): Promise<PaymentOrder>;
    verifyPayment(verification: PaymentVerification): Promise<boolean>;
}
//# sourceMappingURL=MockPaymentService.d.ts.map