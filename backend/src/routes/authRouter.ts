import { Router } from 'express';
import { register, login, logout, getProfile } from '@/controllers/authController';
import { authenticate } from '@/middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

router.get('/me', authenticate, getProfile);

export default router;