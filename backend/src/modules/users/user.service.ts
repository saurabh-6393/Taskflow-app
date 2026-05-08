import prisma from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';

export class UserService {
  static async listUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        systemRole: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateRole(userId: string, role: 'ADMIN' | 'USER') {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ApiError(404, 'User not found');

    return prisma.user.update({
      where: { id: userId },
      data: { systemRole: role },
      select: { id: true, name: true, email: true, systemRole: true },
    });
  }

  static async deactivate(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ApiError(404, 'User not found');

    return prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
      select: { id: true, name: true, email: true, isActive: true },
    });
  }
}
