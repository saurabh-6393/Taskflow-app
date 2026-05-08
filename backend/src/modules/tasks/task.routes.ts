import { Router } from 'express';
import { TaskController } from './task.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireProjectRole } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate';
import { createTaskSchema, updateTaskSchema, updateTaskStatusSchema, updateTaskAssigneeSchema } from './task.schema';

const router = Router();

router.use(requireAuth);

// Search (must be before /:id to avoid conflict)
router.get('/search', TaskController.search);

// Project-scoped task routes
router.get('/project/:projectId', requireProjectRole('MANAGER', 'MEMBER'), TaskController.getByProject);
router.post('/project/:projectId', requireProjectRole('MANAGER', 'MEMBER'), validate(createTaskSchema), TaskController.create);

// Task-specific routes
router.get('/:id', TaskController.getById);
router.patch('/:id', validate(updateTaskSchema), TaskController.update);
router.patch('/:id/status', validate(updateTaskStatusSchema), TaskController.updateStatus);
router.patch('/:id/assignee', validate(updateTaskAssigneeSchema), TaskController.updateAssignee);
router.delete('/:id', TaskController.delete);
router.get('/:id/activity', TaskController.getActivityLog);

export default router;
