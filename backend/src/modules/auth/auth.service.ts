import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma';
import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';

export class AuthService {
  static async register(name: string, email: string, password: string) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: {
        id: true,
        name: true,
        email: true,
        systemRole: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email, user.systemRole);

    return { user, ...tokens };
  }

  static async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Account has been deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email, user.systemRole);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        systemRole: user.systemRole,
      },
      ...tokens,
    };
  }

  static async refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as any;

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, systemRole: true, isActive: true },
      });

      if (!user || !user.isActive) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      const tokens = this.generateTokens(user.id, user.email, user.systemRole);
      return tokens;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(401, 'Invalid or expired refresh token');
    }
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        systemRole: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  }

  static async updateProfile(userId: string, data: { name?: string; currentPassword?: string; newPassword?: string }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ApiError(404, 'User not found');

    const updateData: any = {};
    if (data.name) updateData.name = data.name;

    if (data.currentPassword && data.newPassword) {
      const isValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
      if (!isValid) throw new ApiError(400, 'Current password is incorrect');
      updateData.passwordHash = await bcrypt.hash(data.newPassword, 12);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, systemRole: true },
    });

    return updated;
  }

  private static generateTokens(id: string, email: string, systemRole: string) {
    const accessToken = jwt.sign({ id, email, systemRole }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });

    const refreshToken = jwt.sign({ id }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    });

    return { accessToken, refreshToken };
  }
}
