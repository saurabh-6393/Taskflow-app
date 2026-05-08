import prisma from '../../config/prisma';

interface TaskData {
  status: string;
  dueDate: Date | null;
}

export class DashboardService {
  static async getSummary(user: { id: string; systemRole: string }) {
    const tasksWhere = user.systemRole === 'ADMIN' ? {} : { assigneeId: user.id };
    const tasks: TaskData[] = await prisma.task.findMany({
      where: tasksWhere,
      select: { status: true, dueDate: true },
    });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const totalTasks = tasks.length;
    const tasksByStatus = {
      TODO: tasks.filter((t: TaskData) => t.status === 'TODO').length,
      IN_PROGRESS: tasks.filter((t: TaskData) => t.status === 'IN_PROGRESS').length,
      DONE: tasks.filter((t: TaskData) => t.status === 'DONE').length,
    };

    const overdueTasks = tasks.filter(
      (t: TaskData) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE'
    ).length;

    const tasksDueToday = tasks.filter(
      (t: TaskData) => t.dueDate && new Date(t.dueDate) >= todayStart && new Date(t.dueDate) < todayEnd
    ).length;

    const projectsCountWhere = user.systemRole === 'ADMIN' ? {} : { members: { some: { userId: user.id } } };
    const projectsCount = await prisma.project.count({
      where: projectsCountWhere,
    });

    const activityWhere = user.systemRole === 'ADMIN' ? {} : { userId: user.id };
    const recentActivity = await prisma.activityLog.findMany({
      where: activityWhere,
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: { select: { name: true } },
      },
    });

    const tasksPerUserQuery = user.systemRole === 'ADMIN' ? {} : { projectId: { in: (await prisma.projectMember.findMany({ where: { userId: user.id }, select: { projectId: true } })).map(p => p.projectId) } };

    const tasksInProjects = await prisma.task.findMany({
      where: { ...tasksPerUserQuery, assigneeId: { not: null } },
      include: { assignee: { select: { name: true } } }
    });

    const tasksPerUserMap = new Map<string, number>();
    tasksInProjects.forEach(t => {
      const name = t.assignee?.name || 'Unassigned';
      tasksPerUserMap.set(name, (tasksPerUserMap.get(name) || 0) + 1);
    });
    
    const tasksPerUser = Array.from(tasksPerUserMap.entries()).map(([name, count]) => ({
      name,
      value: count
    }));
    return {
      totalTasks,
      tasksByStatus,
      overdueTasks,
      tasksDueToday,
      projectsCount,
      recentActivity,
      tasksPerUser,
    };
  }
}
