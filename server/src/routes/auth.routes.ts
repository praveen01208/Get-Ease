import { Router } from 'express';
import { login, register, refresh, logout } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

router.get('/me', requireAuth, (req, res) => {
  res.json({ success: true, user: (req as any).user });
});

export default router;
