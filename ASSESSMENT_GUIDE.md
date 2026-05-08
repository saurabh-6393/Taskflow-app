# Team Task Management System - Full-Stack Assessment Guide

This document outlines a complete architecture, schema, API design, and implementation strategy for a production-ready Team Task Management System, satisfying top-tier rubrics for a Full-Stack Assessment.

## 1. High-Level System Design

### Main Entities
*   **User**: System users who can be admins or regular members.
*   **Project**: A workspace containing tasks, managed by an owner and shared with members.
*   **ProjectMember**: The N-M relationship connecting Users and Projects with specific roles.
*   **Task**: The core entity within a project, representing work to be done.
*   **Comment**: Discussion points attached to a specific task.
*   **ActivityLog**: Audit logs tracking who did what and when.

### Main User Roles
*   **System Admin**: Can view all users, modify system roles, and deactivate accounts.
*   **Project Manager (Project-level)**: Can edit the project, add/remove members, and manage all tasks within that project.
*   **Member (Project-level)**: Can view project tasks, create new tasks, and update tasks (especially those assigned to them).

### Main Flows
1.  **Auth**: User registers -> Logs in -> Receives JWT Access & Refresh tokens.
2.  **Projects**: User creates a Project -> Automatically becomes 'Manager' -> Invites other users as 'Members'.
3.  **Tasks**: Manager/Member creates Task -> Assigns to a Member -> Updates status (TODO -> IN_PROGRESS -> DONE).
4.  **Dashboard**: User fetches personalized metrics (tasks by status, overdue tasks, etc.).

### Entity-Relationship Diagram (ERD)

```text
User 1 —— N Project (as Owner)
Project 1 —— N Task
Task 1 —— N Comment
User 1 —— N Comment (as Author)

User N —— M Project (via ProjectMember)
(ProjectMember links User and Project with a ProjectRole: MANAGER or MEMBER)

User 1 —— N Task (as Assignee)
User 1 —— N ActivityLog
```

## 2. Database Schema (PostgreSQL + Prisma)

Below is the `schema.prisma`. We use indexes on foreign keys and frequently filtered columns (like `status`, `dueDate`, `email`) to ensure fast dashboard aggregations and queries.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum SystemRole {
  ADMIN
  USER
}

enum ProjectRole {
  MANAGER
  MEMBER
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
}

model User {
  id             String          @id @default(uuid())
  name           String
  email          String          @unique
  passwordHash   String
  systemRole     SystemRole      @default(USER)
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  ownedProjects  Project[]       @relation("ProjectOwner")
  projectMembers ProjectMember[]
  assignedTasks  Task[]          @relation("TaskAssignee")
  comments       Comment[]
  activityLogs   ActivityLog[]
}

model Project {
  id          String          @id @default(uuid())
  name        String
  description String?
  status      String          @default("ACTIVE") // ACTIVE or ARCHIVED
  ownerId     String
  owner       User            @relation("ProjectOwner", fields: [ownerId], references: [id])
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  tasks       Task[]
  members     ProjectMember[]

  @@index([ownerId])
  @@index([status])
}

model ProjectMember {
  id        String      @id @default(uuid())
  userId    String
  projectId String
  role      ProjectRole @default(MEMBER)
  createdAt DateTime    @default(now())

  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  project   Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([userId, projectId])
  @@index([userId])
  @@index([projectId])
}

model Task {
  id          String       @id @default(uuid())
  projectId   String
  title       String
  description String?
  status      TaskStatus   @default(TODO)
  priority    TaskPriority @default(MEDIUM)
  dueDate     DateTime?
  assigneeId  String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  project     Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assignee    User?        @relation("TaskAssignee", fields: [assigneeId], references: [id], onDelete: SetNull)
  comments    Comment[]

  @@index([projectId])
  @@index([assigneeId])
  @@index([status])
  @@index([dueDate])
}

model Comment {
  id        String   @id @default(uuid())
  taskId    String
  authorId  String
  content   String
  createdAt DateTime @default(now())

  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([taskId])
  @@index([authorId])
}

model ActivityLog {
  id         String   @id @default(uuid())
  userId     String
  entityType String   // e.g., "TASK", "PROJECT"
  entityId   String
  action     String   // e.g., "CREATED", "STATUS_UPDATED"
  metadata   Json?
  createdAt  DateTime @default(now())

  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([entityType, entityId])
}
```

### Relations & Indexes Explained
*   **Relations:** A `Project` is owned by one `User`, but has many `ProjectMembers`. A `Task` belongs to one `Project` (cascade on delete) and is optionally assigned to a `User` (set null if user deleted).
*   **Indexes:** Added on `projectId`, `assigneeId`, `status`, and `dueDate`. Dashboard queries like "show me all overdue tasks for user X" will heavily rely on `assigneeId` + `dueDate` + `status` indexes to stay performant.

## 3. REST API Design

### API Endpoints

| Method | Path | Auth? | Role Restriction | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | No | None | Register a new user |
| `POST` | `/auth/login` | No | None | Authenticate and get tokens |
| `POST` | `/auth/refresh` | No | None | Refresh access token |
| `GET` | `/auth/me` | Yes | None | Get current user profile |
| `GET` | `/projects` | Yes | None | List user's projects |
| `POST` | `/projects` | Yes | None | Create a new project |
| `GET` | `/projects/:id` | Yes | Project Member | Get project details |
| `PATCH`| `/projects/:id` | Yes | Project Manager| Update project details |
| `DELETE`| `/projects/:id` | Yes | Project Manager| Delete/Archive project |
| `POST` | `/projects/:id/members` | Yes | Project Manager| Add a user to project |
| `DELETE`| `/projects/:id/members/:userId`| Yes | Project Manager| Remove member |
| `GET` | `/projects/:projectId/tasks`| Yes | Project Member | List project tasks |
| `POST` | `/projects/:projectId/tasks`| Yes | Project Member | Create a task |
| `GET` | `/tasks/:id` | Yes | Project Member | Get task details |
| `PATCH`| `/tasks/:id` | Yes | Project Member | Update task details |
| `DELETE`| `/tasks/:id` | Yes | Project Manager| Delete a task |
| `PATCH`| `/tasks/:id/status` | Yes | Project Member | Change task status |
| `PATCH`| `/tasks/:id/assignee` | Yes | Project Member | Reassign task |
| `POST` | `/tasks/:taskId/comments` | Yes | Project Member | Add comment |
| `GET` | `/tasks/:taskId/comments` | Yes | Project Member | List comments |
| `GET` | `/dashboard/summary` | Yes | None | Get user task stats |
| `GET` | `/users` | Yes | System Admin | List all system users |
| `PATCH`| `/users/:id/role` | Yes | System Admin | Update user system role|
| `PATCH`| `/users/:id/deactivate` | Yes | System Admin | Deactivate a user |

### Detailed Examples

#### 1. POST `/auth/login`
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```
**Success Response (200 OK):**
```json
{
  "message": "Login successful",
  "data": {
    "user": { "id": "uuid", "name": "Alice", "email": "user@example.com", "role": "USER" },
    "accessToken": "eyJhbG...",
    "refreshToken": "d7a8f9..."
  }
}
```
**Error Response (401 Unauthorized):**
```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Invalid email or password"
}
```

#### 2. POST `/projects`
**Request Body:**
```json
{
  "name": "Q3 Marketing Campaign",
  "description": "All tasks related to our Q3 push."
}
```
**Success Response (201 Created):**
```json
{
  "message": "Project created",
  "data": {
    "id": "uuid",
    "name": "Q3 Marketing Campaign",
    "description": "All tasks related to our Q3 push.",
    "status": "ACTIVE"
  }
}
```

#### 3. GET `/dashboard/summary`
**Success Response (200 OK):**
```json
{
  "message": "Dashboard summary retrieved",
  "data": {
    "totalTasks": 42,
    "tasksByStatus": {
      "TODO": 15,
      "IN_PROGRESS": 12,
      "DONE": 15
    },
    "overdueTasks": 3,
    "tasksDueToday": 5
  }
}
```

## 4. Backend Implementation (Node.js + Express)

### Folder Structure
```text
src/
├── app.ts                 # Express configuration, middlewares
├── server.ts              # Entry point, DB connect, listen on port
├── config/                # env variables, constants
├── middlewares/           # auth, error handler, validation
├── modules/               # Feature-based module organization
│   ├── auth/
│   ├── users/
│   ├── projects/
│   ├── tasks/
│   └── dashboard/
├── utils/                 # logger, APIError class
└── types/                 # TS interfaces
```

### Initialization Commands
```bash
# Initialize project
npm init -y
npm install express cors dotenv helmet morgan bcrypt jsonwebtoken zod @prisma/client
npm install -D typescript @types/node @types/express @types/cors @types/bcrypt @types/jsonwebtoken ts-node-dev prisma

# Setup TS and Prisma
npx tsc --init
npx prisma init

# After creating schema.prisma
npx prisma migrate dev --name init
```

### Code Snippets

#### `app.ts` (App Setup & Error Handling)
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middlewares/errorHandler';
import projectRoutes from './modules/projects/project.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/projects', projectRoutes);

// 404
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
```

#### Centralized Error Handler & Custom Error
```typescript
// utils/ApiError.ts
export class ApiError extends Error {
  constructor(public statusCode: number, message: string, public isOperational = true) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

// middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message
    });
  }
  
  console.error(err);
  return res.status(500).json({
    status: 'error',
    statusCode: 500,
    message: 'Internal Server Error'
  });
};
```

#### Authentication Middleware
```typescript
// middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next(new ApiError(401, 'Authentication required'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded; // Attach user payload to request
    next();
  } catch (err) {
    next(new ApiError(401, 'Invalid or expired token'));
  }
};
```

#### Validation with Zod
```typescript
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().optional()
  })
});

export const validate = (schema: z.AnyZodObject) => 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({ body: req.body, query: req.query, params: req.params });
      next();
    } catch (err: any) {
      return res.status(400).json({ message: "Validation Error", details: err.errors });
    }
  };
```

#### Project Controller (POST & GET)
```typescript
// modules/projects/project.controller.ts
import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/prisma';

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    // Transaction to ensure both Project and ProjectMember are created reliably
    const project = await prisma.$transaction(async (tx) => {
      const newProject = await tx.project.create({
        data: { name, description, ownerId: userId }
      });
      await tx.projectMember.create({
        data: { userId, projectId: newProject.id, role: 'MANAGER' }
      });
      return newProject;
    });

    res.status(201).json({ message: "Project created", data: project });
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    // Get projects where the user is a member
    const projects = await prisma.project.findMany({
      where: {
        members: { some: { userId } }
      },
      include: { _count: { select: { tasks: true } } }
    });
    res.json({ data: projects });
  } catch (error) {
    next(error);
  }
};
```

## 5. Frontend Implementation (React + TypeScript + Tailwind)

### Folder Structure
```text
src/
├── main.tsx
├── router/
│   └── AppRouter.tsx      # Defines React Router config
├── context/
│   └── AuthContext.tsx    # Manages global auth state & JWTs
├── services/
│   └── apiClient.ts       # Axios instance with interceptors
├── hooks/
│   ├── useAuth.ts
│   └── useApi.ts          # Custom wrapper for data fetching (SWR/React Query)
├── components/            # Reusable UI parts
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── StatusBadge.tsx
│   │   └── LoadingSpinner.tsx
├── pages/
│   ├── Auth/
│   │   └── Login.tsx
│   ├── Dashboard/
│   │   └── DashboardOverview.tsx
│   └── Projects/
│       ├── ProjectList.tsx
│       └── ProjectBoard.tsx  # Kanban view
└── types/                 # Frontend interfaces
```

### Routing & Protected Routes
```tsx
// router/AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return children;
};

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<DashboardOverview />} />
        <Route path="projects" element={<ProjectList />} />
        <Route path="projects/:id" element={<ProjectBoard />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
```

### Axios Interceptors (Token Handling)
```typescript
// services/apiClient.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Auto-refresh logic on 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh = localStorage.getItem('refreshToken');
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, { token: refresh });
        localStorage.setItem('accessToken', res.data.accessToken);
        return apiClient(originalRequest);
      } catch (err) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### UI & Styling Conventions (Tailwind)
*   **Colors**: 
    *   `TODO`: `bg-slate-100 text-slate-800`
    *   `IN_PROGRESS`: `bg-blue-100 text-blue-800`
    *   `DONE`: `bg-emerald-100 text-emerald-800`
    *   `HIGH PRIORITY`: `text-rose-600 bg-rose-50`
*   **Responsive Layout**: The `Sidebar` is hidden on mobile screens (`hidden md:block w-64`), replaced by a hamburger menu in the `Navbar`.
*   **Validation UX**: Use `react-hook-form` + `zodResolver`. Show inline red text (`text-red-500 text-sm mt-1`) below the input for errors.
*   **Loading States**: Display skeleton loaders on data fetch, and button spinners during form submissions (`opacity-70 cursor-not-allowed`).

```tsx
// components/ui/StatusBadge.tsx
export const StatusBadge = ({ status }: { status: 'TODO' | 'IN_PROGRESS' | 'DONE' }) => {
  const styles = {
    TODO: 'bg-slate-100 text-slate-700 border-slate-200',
    IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-200',
    DONE: 'bg-emerald-100 text-emerald-700 border-emerald-200'
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};
```

## 6. README Outline

```markdown
# Team Task Management System

A full-stack, production-ready web application for teams to manage projects, track tasks via Kanban boards, and view productivity metrics.

## Tech Stack
*   **Frontend**: React 18, TypeScript, React Router, Tailwind CSS, React Hook Form, Axios.
*   **Backend**: Node.js, Express, TypeScript, Zod.
*   **Database**: PostgreSQL managed with Prisma ORM.
*   **Authentication**: JWT (Access & Refresh tokens), bcrypt.

## Prerequisites
*   Node.js (v18+)
*   PostgreSQL running locally or via Docker.

## Environment Variables
Create a `.env` in the `backend/` directory:
```env
PORT=5000
DATABASE_URL="postgresql://user:pass@localhost:5432/taskdb"
JWT_SECRET="super-secret-key"
JWT_EXPIRES_IN="15m"
```
Create a `.env` in the `frontend/` directory:
```env
VITE_API_URL="http://localhost:5000/api"
```

## Running the Backend
1. `cd backend`
2. `npm install`
3. `npx prisma migrate dev` (Sets up the database)
4. `npm run dev` (Starts on http://localhost:5000)

## Running the Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev` (Starts Vite server on http://localhost:5173)

## Features & Architecture
*   **Authentication Flow**: Secure JWT-based auth utilizing short-lived access tokens and robust refresh token rotation.
*   **Role-Based Access Control**: System-level (Admin vs User) and Project-level (Manager vs Member) enforcing secure API limits.
*   **Dashboard Analytics**: Fast, index-backed PostgreSQL queries computing real-time workflow statistics and overdue tasks.
```
