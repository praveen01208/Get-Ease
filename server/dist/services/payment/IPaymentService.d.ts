export interface PaymentOrder {
    orderId: string;
    amount: number;
    currency: string;
    key?: string;
}
export interface PaymentVerification {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature?: string;
}
export interface IPaymentService {
    createOrder(amount: number, currency: string, courseId: string, userId: string): Promise<PaymentOrder>;
    verifyPayment(verification: PaymentVerification): Promise<boolean>;
}
//# sourceMappingURL=IPaymentService.d.ts.map