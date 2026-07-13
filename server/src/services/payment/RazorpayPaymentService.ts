import crypto from 'crypto';
import Razorpay from 'razorpay';
import { IPaymentService, PaymentOrder, PaymentVerification } from './IPaymentService';

/**
 * Real Razorpay integration. Reads credentials from env:
 *   RAZORPAY_KEY_ID     — public, also shipped to the browser
 *   RAZORPAY_KEY_SECRET — server-only, used to auth API calls and verify signatures
 *
 * If either credential is missing the service will fail to construct; the
 * controller falls back to the mock service in that case.
 */
export class RazorpayPaymentService implements IPaymentService {
  private client: Razorpay;
  private keyId: string;
  private keySecret: string;

  constructor() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials missing (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)');
    }
    this.keyId = keyId;
    this.keySecret = keySecret;
    this.client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }

  async createOrder(
    amount: number,
    currency: string,
    courseId: string,
    userId: string
  ): Promise<PaymentOrder> {
    const order = await this.client.orders.create({
      // Razorpay wants the smallest currency unit (paise for INR)
      amount: Math.round(amount * 100),
      currency,
      receipt: `rcpt_${courseId.slice(0, 12)}_${Date.now()}`,
      notes: { courseId, userId },
    });

    return {
      orderId: order.id,
      amount: Number(order.amount) / 100,
      currency: order.currency,
      key: this.keyId,
    };
  }

  async verifyPayment(v: PaymentVerification): Promise<boolean> {
    if (!v.razorpaySignature) return false;

    // Razorpay's canonical signature: HMAC_SHA256(order_id + "|" + payment_id, key_secret)
    const expected = crypto
      .createHmac('sha256', this.keySecret)
      .update(`${v.razorpayOrderId}|${v.razorpayPaymentId}`)
      .digest('hex');

    // Constant-time comparison against the signature the browser reported
    const a = Buffer.from(expected, 'hex');
    const b = Buffer.from(v.razorpaySignature, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  }
}
