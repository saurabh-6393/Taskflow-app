import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';

export class UserController {
  static async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.listUsers();
      res.json({ message: 'Users retrieved', data: users });
    } catch (error) {
      next(error);
    }
  }

  static async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { role } = req.body;
      const user = await UserService.updateRole(id, role);
      res.json({ message: 'User role updated', data: user });
    } catch (error) {
      next(error);
    }
  }

  static async deactivate(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const user = await UserService.deactivate(id);
      res.json({ message: 'User deactivated', data: user });
    } catch (error) {
      next(error);
    }
  }
}
