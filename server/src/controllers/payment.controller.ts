import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { IPaymentService } from '../services/payment/IPaymentService';
import { MockPaymentService } from '../services/payment/MockPaymentService';
import { RazorpayPaymentService } from '../services/payment/RazorpayPaymentService';

// Real Razorpay if credentials are set, otherwise fall back to the mock
// service so local dev keeps working without a live account.
let paymentService: IPaymentService;
export const paymentProvider = (): 'razorpay' | 'mock' => {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) return 'razorpay';
  return 'mock';
};
try {
  paymentService = paymentProvider() === 'razorpay'
    ? new RazorpayPaymentService()
    : new MockPaymentService();
  console.log(`Payment provider: ${paymentProvider()}`);
} catch (err) {
  console.warn('Falling back to MockPaymentService:', (err as Error).message);
  paymentService = new MockPaymentService();
}

export const getPaymentConfig = (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      provider: paymentProvider(),
      // Only the *public* key is ever exposed to the browser
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || null,
    },
  });
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.body;
    const userId = req.user!.id;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.price <= 0) {
      return res.status(400).json({ success: false, message: 'Course is free' });
    }

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already enrolled' });
    }

    const order = await paymentService.createOrder(course.price, 'INR', courseId, userId);

    await prisma.payment.create({
      data: {
        userId,
        courseId,
        amount: course.price,
        currency: 'INR',
        razorpayOrderId: order.orderId,
      }
    });

    res.json({
      success: true,
      data: {
        ...order,
        provider: paymentProvider(),
        courseTitle: course.title,
      },
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, courseId } = req.body;
    const userId = req.user!.id;

    // Enforce that the order belongs to the caller and the course being unlocked
    // — a valid signature for someone else's order must not unlock this user.
    const payment = await prisma.payment.findFirst({
      where: { razorpayOrderId, userId, courseId },
    });
    if (!payment) {
      return res.status(400).json({ success: false, message: 'Order not found for this user/course' });
    }

    const isValid = await paymentService.verifyPayment({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });

    if (!isValid) {
      await prisma.payment.updateMany({
        where: { razorpayOrderId },
        data: { status: 'FAILED' },
      });
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Mark this payment successful, then create the enrollment. Enrollment is
    // the *only* thing that unlocks course content — no signature, no access.
    await prisma.payment.updateMany({
      where: { razorpayOrderId },
      data: { status: 'SUCCESS', razorpayPaymentId }
    });

    const enrollment = await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {},
      create: { userId, courseId }
    });

    res.json({ success: true, data: enrollment });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
