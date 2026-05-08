import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middlewares/validate';
import { requireAuth } from '../../middlewares/auth.middleware';
import { registerSchema, loginSchema, refreshSchema } from './auth.schema';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/refresh', validate(refreshSchema), AuthController.refresh);
router.get('/me', requireAuth, AuthController.getMe);
router.patch('/me/profile', requireAuth, AuthController.updateProfile);

export default router;
