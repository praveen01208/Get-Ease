import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/create-order', requireAuth, paymentController.createOrder);
router.post('/verify', requireAuth, paymentController.verifyPayment);

export default router;
