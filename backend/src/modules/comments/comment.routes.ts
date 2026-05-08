import { Router } from 'express';
import { CommentController } from './comment.controller';
import { requireAuth } from '../../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/:taskId/comments', CommentController.getByTask);
router.post('/:taskId/comments', CommentController.create);

export default router;
