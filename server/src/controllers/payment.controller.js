"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.createOrder = void 0;
const express_1 = require("express");
const prisma_1 = require("../utils/prisma");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const MockPaymentService_1 = require("../services/payment/MockPaymentService");
const paymentService = new MockPaymentService_1.MockPaymentService();
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
        res.json({ success: true, data: order });
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
        const isValid = await paymentService.verifyPayment({
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        });
        if (!isValid) {
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
        // Update payment record
        await prisma_1.prisma.payment.updateMany({
            where: { razorpayOrderId },
            data: { status: 'SUCCESS', razorpayPaymentId }
        });
        // Create enrollment
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