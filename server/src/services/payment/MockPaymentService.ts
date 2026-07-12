import { IPaymentService, PaymentOrder, PaymentVerification } from './IPaymentService';
import crypto from 'crypto';

export class MockPaymentService implements IPaymentService {
  async createOrder(amount: number, currency: string, courseId: string, userId: string): Promise<PaymentOrder> {
    // Simulate a small delay like a real payment gateway
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      orderId: `mock_order_${crypto.randomUUID().slice(0, 8)}`,
      amount,
      currency,
      key: 'mock_key_test',
    };
  }

  async verifyPayment(verification: PaymentVerification): Promise<boolean> {
    // Mock always succeeds after a brief delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return true;
  }
}
