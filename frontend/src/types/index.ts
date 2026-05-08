export interface User {
  id: string;
  name: string;
  email: string;
  systemRole: 'ADMIN' | 'USER';
  isActive?: boolean;
  createdAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'ARCHIVED';
  ownerId: string;
  owner?: User;
  createdAt: string;
  updatedAt: string;
  _count?: {
    tasks: number;
    members: number;
  };
  members?: ProjectMember[];
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: 'MANAGER' | 'MEMBER';
  user?: User;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string | null;
  assigneeId?: string | null;
  assignee?: User | null;
  project?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
  _count?: { comments: number };
  comments?: Comment[];
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  author?: User;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  action: string;
  metadata?: any;
  createdAt: string;
  user?: { name: string };
}

export interface DashboardSummary {
  totalTasks: number;
  tasksByStatus: {
    TODO: number;
    IN_PROGRESS: number;
    DONE: number;
  };
  overdueTasks: number;
  tasksDueToday: number;
  projectsCount: number;
  tasksPerUser?: Array<{
    name: string;
    value: number;
  }>;
  recentActivity: ActivityLog[];
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
