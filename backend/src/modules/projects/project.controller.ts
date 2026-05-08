import { Request, Response, NextFunction } from 'express';
import { ProjectService } from './project.service';

export class ProjectController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;
      const userId = (req as any).user.id;
      const project = await ProjectService.create(name, description, userId);
      res.status(201).json({ message: 'Project created', data: project });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const projects = await ProjectService.getAll(user);
      res.json({ message: 'Projects retrieved', data: projects });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.getById(req.params.id as string);
      res.json({ message: 'Project retrieved', data: project });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const project = await ProjectService.update(req.params.id as string, req.body, userId);
      res.json({ message: 'Project updated', data: project });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const result = await ProjectService.delete(req.params.id as string, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async addMember(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = (req as any).user.id;
      const { email, role } = req.body;
      const member = await ProjectService.addMember(req.params.id as string, email, role, actorId);
      res.status(201).json({ message: 'Member added', data: member });
    } catch (error) {
      next(error);
    }
  }

  static async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = (req as any).user.id;
      const result = await ProjectService.removeMember(req.params.id as string, req.params.userId as string, actorId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
