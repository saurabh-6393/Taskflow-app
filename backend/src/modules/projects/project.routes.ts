import { Router } from 'express';
import { ProjectController } from './project.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireProjectRole } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate';
import { createProjectSchema, updateProjectSchema, addMemberSchema } from './project.schema';

const router = Router();

router.use(requireAuth);

router.get('/', ProjectController.getAll);
router.post('/', validate(createProjectSchema), ProjectController.create);
router.get('/:id', requireProjectRole('MANAGER', 'MEMBER'), ProjectController.getById);
router.patch('/:id', requireProjectRole('MANAGER'), validate(updateProjectSchema), ProjectController.update);
router.delete('/:id', requireProjectRole('MANAGER'), ProjectController.delete);

// Member management
router.post('/:id/members', requireProjectRole('MANAGER'), validate(addMemberSchema), ProjectController.addMember);
router.delete('/:id/members/:userId', requireProjectRole('MANAGER'), ProjectController.removeMember);

export default router;
