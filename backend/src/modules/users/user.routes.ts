import { Router } from 'express';
import { UserController } from './user.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireSystemAdmin } from '../../middlewares/rbac.middleware';

const router = Router();

router.use(requireAuth, requireSystemAdmin);

router.get('/', UserController.listUsers);
router.patch('/:id/role', UserController.updateRole);
router.patch('/:id/deactivate', UserController.deactivate);

export default router;
