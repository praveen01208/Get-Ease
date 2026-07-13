import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';

const router = Router();

// Auth for this router is applied at app.use() in index.ts
router.get('/config', paymentController.getPaymentConfig);
router.post('/create-order', paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);

export default router;
