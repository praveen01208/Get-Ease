"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.createOrder = exports.getPaymentConfig = exports.paymentProvider = void 0;
const prisma_1 = require("../utils/prisma");
const MockPaymentService_1 = require("../services/payment/MockPaymentService");
const RazorpayPaymentService_1 = require("../services/payment/RazorpayPaymentService");
// Real Razorpay if credentials are set, otherwise fall back to the mock
// service so local dev keeps working without a live account.
let paymentService;
const paymentProvider = () => {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
        return 'razorpay';
    return 'mock';
};
exports.paymentProvider = paymentProvider;
try {
    paymentService = (0, exports.paymentProvider)() === 'razorpay'
        ? new RazorpayPaymentService_1.RazorpayPaymentService()
        : new MockPaymentService_1.MockPaymentService();
    console.log(`Payment provider: ${(0, exports.paymentProvider)()}`);
}
catch (err) {
    console.warn('Falling back to MockPaymentService:', err.message);
    paymentService = new MockPaymentService_1.MockPaymentService();
}
const getPaymentConfig = (_req, res) => {
    res.json({
        success: true,
        data: {
            provider: (0, exports.paymentProvider)(),
            // Only the *public* key is ever exposed to the browser
            razorpayKeyId: process.env.RAZORPAY_KEY_ID || null,
        },
    });
};
exports.getPaymentConfig = getPaymentConfig;
const createOrder = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.id;
        const course = await prisma_1.prisma.course.findUnique({ where: { id: courseId } });
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        if (course.price <= 0) {
            return res.status(400).json({ success: false, message: 'Course is free' });
        }
        // Check if already enrolled
        const existing = await prisma_1.prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } }
        });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Already enrolled' });
        }
        const order = await paymentService.createOrder(course.price, 'INR', courseId, userId);
        await prisma_1.prisma.payment.create({
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
                provider: (0, exports.paymentProvider)(),
                courseTitle: course.title,
            },
        });
    }
    catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createOrder = createOrder;
const verifyPayment = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, courseId } = req.body;
        const userId = req.user.id;
        // Enforce that the order belongs to the caller and the course being unlocked
        // — a valid signature for someone else's order must not unlock this user.
        const payment = await prisma_1.prisma.payment.findFirst({
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
            await prisma_1.prisma.payment.updateMany({
                where: { razorpayOrderId },
                data: { status: 'FAILED' },
            });
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
        // Mark this payment successful, then create the enrollment. Enrollment is
        // the *only* thing that unlocks course content — no signature, no access.
        await prisma_1.prisma.payment.updateMany({
            where: { razorpayOrderId },
            data: { status: 'SUCCESS', razorpayPaymentId }
        });
        const enrollment = await prisma_1.prisma.enrollment.upsert({
            where: { userId_courseId: { userId, courseId } },
            update: {},
            create: { userId, courseId }
        });
        res.json({ success: true, data: enrollment });
    }
    catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.verifyPayment = verifyPayment;
//# sourceMappingURL=payment.controller.js.map