import prisma from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';

export class ProjectService {
  static async create(name: string, description: string | undefined, userId: string) {
    const project = await prisma.$transaction(async (tx: any) => {
      const newProject = await tx.project.create({
        data: { name, description, ownerId: userId },
      });
      await tx.projectMember.create({
        data: { userId, projectId: newProject.id, role: 'MANAGER' },
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          userId,
          entityType: 'PROJECT',
          entityId: newProject.id,
          action: 'CREATED',
          metadata: { name },
        },
      });

      return newProject;
    });

    return project;
  }

  static async getAll(user: { id: string; systemRole: string }) {
    const whereClause = user.systemRole === 'ADMIN' ? {} : { members: { some: { userId: user.id } } };

    return prisma.project.findMany({
      where: whereClause,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true, members: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  static async getById(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        _count: { select: { tasks: true } },
      },
    });

    if (!project) throw new ApiError(404, 'Project not found');
    return project;
  }

  static async update(projectId: string, data: { name?: string; description?: string; status?: string }, userId: string) {
    const project = await prisma.project.update({
      where: { id: projectId },
      data,
    });

    await prisma.activityLog.create({
      data: {
        userId,
        entityType: 'PROJECT',
        entityId: projectId,
        action: 'UPDATED',
        metadata: data,
      },
    });

    return project;
  }

  static async delete(projectId: string, userId: string) {
    await prisma.activityLog.create({
      data: {
        userId,
        entityType: 'PROJECT',
        entityId: projectId,
        action: 'DELETED',
      },
    });

    await prisma.project.delete({ where: { id: projectId } });
    return { message: 'Project deleted successfully' };
  }

  static async addMember(projectId: string, email: string, role: 'MANAGER' | 'MEMBER', actorId: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new ApiError(404, 'User not found with this email');

    const existing = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: user.id, projectId } },
    });
    if (existing) throw new ApiError(409, 'User is already a member of this project');

    const member = await prisma.projectMember.create({
      data: { userId: user.id, projectId, role },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: actorId,
        entityType: 'PROJECT',
        entityId: projectId,
        action: 'MEMBER_ADDED',
        metadata: { memberId: user.id, role },
      },
    });

    return member;
  }

  static async removeMember(projectId: string, userId: string, actorId: string) {
    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });

    if (!membership) throw new ApiError(404, 'Member not found in this project');

    await prisma.projectMember.delete({
      where: { userId_projectId: { userId, projectId } },
    });

    await prisma.activityLog.create({
      data: {
        userId: actorId,
        entityType: 'PROJECT',
        entityId: projectId,
        action: 'MEMBER_REMOVED',
        metadata: { memberId: userId },
      },
    });

    return { message: 'Member removed successfully' };
  }
}
