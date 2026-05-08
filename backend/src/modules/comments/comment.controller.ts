import { Request, Response, NextFunction } from 'express';
import { CommentService } from './comment.service';

export class CommentController {
  static async getByTask(req: Request, res: Response, next: NextFunction) {
    try {
      const comments = await CommentService.getByTask(req.params.taskId as string);
      res.json({ message: 'Comments retrieved', data: comments });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const authorId = (req as any).user.id;
      const { content } = req.body;
      const comment = await CommentService.create(req.params.taskId as string, content, authorId);
      res.status(201).json({ message: 'Comment added', data: comment });
    } catch (error) {
      next(error);
    }
  }
}
