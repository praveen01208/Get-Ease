import { Router } from 'express';
import * as controller from '../controllers/student.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/dashboard', controller.getDashboard);

router.get('/wishlist', controller.getWishlist);
router.post('/wishlist/:courseId', controller.addToWishlist);
router.delete('/wishlist/:courseId', controller.removeFromWishlist);

router.get('/purchases', controller.getPurchases);

router.get('/profile', controller.getProfile);
router.patch('/profile', controller.updateProfile);
router.post('/profile/password', controller.changePassword);

export default router;
