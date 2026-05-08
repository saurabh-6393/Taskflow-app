import prisma from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';

export class CommentService {
  static async getByTask(taskId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new ApiError(404, 'Task not found');

    return prisma.comment.findMany({
      where: { taskId },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async create(taskId: string, content: string, authorId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new ApiError(404, 'Task not found');

    const comment = await prisma.comment.create({
      data: { taskId, content, authorId },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: authorId,
        entityType: 'TASK',
        entityId: taskId,
        action: 'COMMENT_ADDED',
        metadata: { commentId: comment.id },
      },
    });

    return comment;
  }
}
