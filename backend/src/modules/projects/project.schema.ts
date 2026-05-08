import { z } from 'zod';

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().optional(),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(3).optional(),
    description: z.string().optional(),
    status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
  }),
});

export const addMemberSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    role: z.enum(['MANAGER', 'MEMBER']).optional().default('MEMBER'),
  }),
});
