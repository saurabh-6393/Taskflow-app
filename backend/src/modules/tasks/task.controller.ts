import { Request, Response, NextFunction } from 'express';
import { TaskService } from './task.service';

export class TaskController {
  static async getByProject(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.projectId as string;
      const { status, priority, assigneeId } = req.query;
      const tasks = await TaskService.getByProject(projectId, {
        status: status as string,
        priority: priority as string,
        assigneeId: assigneeId as string,
      });
      res.json({ message: 'Tasks retrieved', data: tasks });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.projectId as string;
      const userId = (req as any).user.id;
      const task = await TaskService.create(projectId, req.body, userId);
      res.status(201).json({ message: 'Task created', data: task });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.getById(req.params.id as string);
      res.json({ message: 'Task retrieved', data: task });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const task = await TaskService.update(req.params.id as string, req.body, userId);
      res.json({ message: 'Task updated', data: task });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { status } = req.body;
      const task = await TaskService.updateStatus(req.params.id as string, status, userId);
      res.json({ message: 'Task status updated', data: task });
    } catch (error) {
      next(error);
    }
  }

  static async updateAssignee(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { assigneeId } = req.body;
      const task = await TaskService.updateAssignee(req.params.id as string, assigneeId, userId);
      res.json({ message: 'Task assignee updated', data: task });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const result = await TaskService.delete(req.params.id as string, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const q = (req.query.q as string) || '';
      if (!q.trim()) {
        return res.json({ message: 'Search results', data: [] });
      }
      const tasks = await TaskService.search(q.trim(), userId);
      res.json({ message: 'Search results', data: tasks });
    } catch (error) {
      next(error);
    }
  }

  static async getActivityLog(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await TaskService.getActivityLog(req.params.id as string);
      res.json({ message: 'Activity log retrieved', data: logs });
    } catch (error) {
      next(error);
    }
  }
}
