import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { requireAuth } from '../../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/summary', DashboardController.getSummary);

export default router;
