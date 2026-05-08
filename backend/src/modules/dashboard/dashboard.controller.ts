import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';

export class DashboardController {
  static async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const summary = await DashboardService.getSummary(user);
      res.json({ message: 'Dashboard summary retrieved', data: summary });
    } catch (error) {
      next(error);
    }
  }
}
