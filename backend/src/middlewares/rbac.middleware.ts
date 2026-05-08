import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import prisma from '../config/prisma';

// System-level admin check
export const requireSystemAdmin = (req: Request, _res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || user.systemRole !== 'ADMIN') {
    return next(new ApiError(403, 'System admin access required'));
  }
  next();
};

// Project-level role check
export const requireProjectRole = (...allowedRoles: string[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const projectId = (req.params.id || req.params.projectId) as string;

      if (!projectId) {
        return next(new ApiError(400, 'Project ID is required'));
      }

      // System admins can access all projects
      if (user.systemRole === 'ADMIN') {
        return next();
      }

      const membership = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: user.id,
            projectId: projectId,
          },
        },
      });

      if (!membership) {
        return next(new ApiError(403, 'You are not a member of this project'));
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
        return next(new ApiError(403, `Requires one of: ${allowedRoles.join(', ')}`));
      }

      (req as any).projectRole = membership.role;
      next();
    } catch (error) {
      next(error);
    }
  };
};
