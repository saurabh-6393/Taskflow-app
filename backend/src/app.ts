import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middlewares/errorHandler';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import projectRoutes from './modules/projects/project.routes';
import taskRoutes from './modules/tasks/task.routes';
import commentRoutes from './modules/comments/comment.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';

const app = express();

// Global middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tasks', commentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route hint (helps when opening backend URL directly)
app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Taskflow backend is running',
    health: '/api/health',
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
