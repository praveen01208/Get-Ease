import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { MockPaymentService } from '../services/payment/MockPaymentService';

const paymentService = new MockPaymentService();

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

    res.json({ success: true, data: order });
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, courseId } = req.body;
    const userId = req.user!.id;

    const isValid = await paymentService.verifyPayment({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Update payment record
    await prisma.payment.updateMany({
      where: { razorpayOrderId },
      data: { status: 'SUCCESS', razorpayPaymentId }
    });

    // Create enrollment
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
