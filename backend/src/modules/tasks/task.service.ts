import prisma from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';

export class TaskService {
  private static async verifyTaskPermission(task: any, userId: string, requireManager = false) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.systemRole === 'ADMIN') return;

    const member = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId: task.projectId } },
    });

    if (!member) throw new ApiError(403, 'You are not a member of this project');
    if (member.role === 'MANAGER') return;

    if (requireManager) {
      throw new ApiError(403, 'Only project managers can perform this action');
    }

    if (task.assigneeId !== userId) {
      throw new ApiError(403, 'Members can only update tasks assigned to them');
    }
  }
  static async getByProject(projectId: string, filters?: { status?: string; priority?: string; assigneeId?: string }) {
    const where: any = { projectId };
    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.assigneeId) where.assigneeId = filters.assigneeId;

    return prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        _count: { select: { comments: true } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  static async create(projectId: string, data: { title: string; description?: string; priority?: string; dueDate?: string | null; assigneeId?: string | null }, userId: string) {
    // Verify assignee is a member if provided
    if (data.assigneeId) {
      const member = await prisma.projectMember.findUnique({
        where: { userId_projectId: { userId: data.assigneeId, projectId } },
      });
      if (!member) throw new ApiError(400, 'Assignee must be a project member');
    }

    const task = await prisma.task.create({
      data: {
        projectId,
        title: data.title,
        description: data.description,
        priority: (data.priority as any) || 'MEDIUM',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        assigneeId: data.assigneeId || null,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        entityType: 'TASK',
        entityId: task.id,
        action: 'CREATED',
        metadata: { title: data.title, projectId },
      },
    });

    return task;
  }

  static async getById(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { comments: true } },
      },
    });

    if (!task) throw new ApiError(404, 'Task not found');
    return task;
  }

  static async update(taskId: string, data: { title?: string; description?: string; priority?: string; dueDate?: string | null }, userId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new ApiError(404, 'Task not found');
    await this.verifyTaskPermission(task, userId);

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        entityType: 'TASK',
        entityId: taskId,
        action: 'UPDATED',
        metadata: data,
      },
    });

    return updated;
  }

  static async updateStatus(taskId: string, status: string, userId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new ApiError(404, 'Task not found');
    await this.verifyTaskPermission(task, userId);

    const oldStatus = task.status;
    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { status: status as any },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        entityType: 'TASK',
        entityId: taskId,
        action: 'STATUS_UPDATED',
        metadata: { from: oldStatus, to: status },
      },
    });

    return updated;
  }

  static async updateAssignee(taskId: string, assigneeId: string | null, userId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new ApiError(404, 'Task not found');
    await this.verifyTaskPermission(task, userId);

    // Verify new assignee is a project member
    if (assigneeId) {
      const member = await prisma.projectMember.findUnique({
        where: { userId_projectId: { userId: assigneeId, projectId: task.projectId } },
      });
      if (!member) throw new ApiError(400, 'Assignee must be a project member');
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { assigneeId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        entityType: 'TASK',
        entityId: taskId,
        action: 'ASSIGNEE_UPDATED',
        metadata: { assigneeId },
      },
    });

    return updated;
  }

  static async delete(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new ApiError(404, 'Task not found');
    await this.verifyTaskPermission(task, userId, true); // Require manager/admin for deletion

    await prisma.activityLog.create({
      data: {
        userId,
        entityType: 'TASK',
        entityId: taskId,
        action: 'DELETED',
        metadata: { title: task.title },
      },
    });

    await prisma.task.delete({ where: { id: taskId } });
    return { message: 'Task deleted successfully' };
  }

  static async search(query: string, userId: string) {
    // Find all projects the user is a member of
    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true },
    });
    const projectIds = memberships.map((m) => m.projectId);

    if (projectIds.length === 0) return [];

    return prisma.task.findMany({
      where: {
        projectId: { in: projectIds },
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });
  }

  static async getActivityLog(taskId: string) {
    return prisma.activityLog.findMany({
      where: { entityType: 'TASK', entityId: taskId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  }
}
