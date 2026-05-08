# 🚀 TaskFlow — Team Task Management System

A **full-stack, production-ready** web application for teams to manage projects, track tasks via Kanban boards, and view productivity analytics with interactive charts.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **JWT Authentication** | Secure login/register with access + refresh token rotation |
| 👥 **Role-Based Access Control** | System-level (Admin/User) and Project-level (Manager/Member) |
| 📋 **Kanban Board** | Drag-and-drop task management across TODO → IN_PROGRESS → DONE |
| 📊 **Dashboard Analytics** | Interactive donut & bar charts (Recharts), task stats, activity feed |
| 🔍 **Global Search** | Real-time task search across all projects with debounced results |
| 🔔 **Notifications** | In-app notification bell with activity feed and unread badges |
| 🌗 **Dark Mode** | Full dark theme toggle with persistent preference |
| 💬 **Task Comments** | Real-time comment threads on tasks |
| 👤 **User Profile** | Edit name, change password |
| 🛡️ **Admin Panel** | User management — role changes, account deactivation |
| ✏️ **Task Editing** | Inline edit task title, description, priority, due date, assignee |
| 📂 **Project Management** | Create, edit, archive, and delete projects |
| ⚡ **Overdue Highlighting** | Visual indicators for overdue tasks with pulse animation |
| 🎯 **Task Filtering** | Filter by priority, assignee, and search within projects |
| ✅ **Confirm Dialogs** | Safe delete/deactivate with confirmation modals |
| 🔄 **Auto Token Refresh** | Seamless token refresh via Axios interceptors |

---

## 🛠️ Tech Stack

### Frontend
- **React 19** + TypeScript
- **Tailwind CSS 4** (CSS-first configuration)
- **React Router 7** — client-side routing with protected/admin routes
- **React Hook Form** + **Zod** — validated forms
- **@dnd-kit** — accessible drag-and-drop for Kanban board
- **Recharts** — interactive dashboard charts
- **react-hot-toast** — toast notifications
- **Axios** — HTTP client with interceptors

### Backend
- **Node.js** + **Express** + TypeScript
- **Prisma ORM** — type-safe database client
- **PostgreSQL** — relational database
- **JWT** (jsonwebtoken) — authentication
- **bcrypt** — password hashing
- **Zod** — request validation
- **Helmet + CORS + Morgan** — security & logging

---

## 📁 Project Structure

```
task-management-app/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   └── src/
│       ├── app.ts                 # Express app configuration
│       ├── server.ts              # Entry point
│       ├── config/                # Env vars, Prisma client
│       ├── middlewares/           # Auth, RBAC, validation, errors
│       ├── modules/
│       │   ├── auth/              # Register, login, refresh, profile
│       │   ├── users/             # Admin user management
│       │   ├── projects/          # CRUD + member management
│       │   ├── tasks/             # CRUD + status/assignee + search
│       │   ├── comments/          # Task comments
│       │   └── dashboard/         # Analytics & summary
│       ├── utils/                 # ApiError class
│       └── types/                 # TypeScript interfaces
│
├── frontend/
│   └── src/
│       ├── App.tsx                # Root with providers
│       ├── router/AppRouter.tsx   # Route definitions
│       ├── context/               # Auth + Theme context
│       ├── services/apiClient.ts  # Axios with interceptors
│       ├── hooks/                 # useAuth hook
│       ├── components/
│       │   ├── layout/            # Sidebar, Navbar, Notifications
│       │   └── ui/                # Button, Card, Modal, Badges, etc.
│       ├── pages/
│       │   ├── Auth/              # Login, Register
│       │   ├── Dashboard/         # Analytics overview
│       │   ├── Projects/          # List + Kanban Board
│       │   ├── Profile/           # User profile
│       │   └── Admin/             # User management
│       └── types/                 # TypeScript interfaces
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **PostgreSQL** running locally or via Docker

### 1. Clone & Setup Backend

```bash
cd backend
npm install
```

Create `.env` in `backend/`:
```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/taskmanager"
JWT_SECRET="your-super-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
NODE_ENV="development"
```

Run migrations and seed:
```bash
npx prisma migrate dev --name init
npx ts-node-dev src/seed.ts
npm run dev
```

### 2. Setup Frontend

```bash
cd frontend
npm install
```

Create `.env` in `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

### 3. Open the App

  Navigate to **http://localhost:5173**

---

## ☁️ Deployment (Railway)

This application is fully configured for easy deployment on [Railway](https://railway.app/).

### 1. Database & Backend
1. Create a new project on Railway and provision a **PostgreSQL** database.
2. Click "New Service" > "GitHub Repo" and select your repository.
3. Go to the service settings and set the **Root Directory** to `/backend`.
4. Add the following Environment Variables in Railway:
   - `DATABASE_URL` (Use the internal or external URL from your Railway Postgres service)
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `PORT=5000`
5. Generate a domain for your backend service (e.g., `your-backend.up.railway.app`).

### 2. Frontend
1. Create another "New Service" > "GitHub Repo" from the same repository.
2. Go to settings and set the **Root Directory** to `/frontend`.
3. Add the following Environment Variable:
   - `VITE_API_URL=https://your-backend.up.railway.app/api` (Replace with your backend's generated domain)
4. Generate a domain for your frontend service.

Your application is now live and fully connected!

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@taskflow.com | Password123! |
| User | alice@taskflow.com | Password123! |
| User | bob@taskflow.com | Password123! |
| User | carol@taskflow.com | Password123! |
| User | dave@taskflow.com | Password123! |
| User | eve@taskflow.com | Password123! |

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/refresh` | No | Refresh token |
| GET | `/api/auth/me` | Yes | Current user profile |
| PATCH | `/api/auth/me/profile` | Yes | Update name/password |
| GET | `/api/projects` | Yes | List user projects |
| POST | `/api/projects` | Yes | Create project |
| GET | `/api/projects/:id` | Yes | Project details |
| PATCH | `/api/projects/:id` | Yes | Update project |
| DELETE | `/api/projects/:id` | Yes | Delete project |
| POST | `/api/projects/:id/members` | Yes | Add member |
| DELETE | `/api/projects/:id/members/:userId` | Yes | Remove member |
| GET | `/api/tasks/search?q=` | Yes | Search tasks |
| GET | `/api/tasks/project/:projectId` | Yes | List project tasks |
| POST | `/api/tasks/project/:projectId` | Yes | Create task |
| GET | `/api/tasks/:id` | Yes | Task details |
| PATCH | `/api/tasks/:id` | Yes | Update task |
| PATCH | `/api/tasks/:id/status` | Yes | Change status |
| PATCH | `/api/tasks/:id/assignee` | Yes | Reassign task |
| DELETE | `/api/tasks/:id` | Yes | Delete task |
| POST | `/api/tasks/:taskId/comments` | Yes | Add comment |
| GET | `/api/tasks/:taskId/comments` | Yes | List comments |
| GET | `/api/dashboard/summary` | Yes | Dashboard stats |
| GET | `/api/users` | Admin | List all users |
| PATCH | `/api/users/:id/role` | Admin | Change user role |
| PATCH | `/api/users/:id/deactivate` | Admin | Deactivate user |

---

## 🏗️ Architecture Highlights

- **Modular Backend** — Feature-based folder structure (auth, users, projects, tasks, comments, dashboard)
- **Prisma Transactions** — Atomic project + member creation
- **Database Indexes** — On `projectId`, `assigneeId`, `status`, `dueDate` for fast dashboard queries
- **JWT Refresh Flow** — Automatic silent token refresh via Axios interceptors
- **RBAC Middleware** — System-level (Admin) and Project-level (Manager/Member) role checks
- **Activity Logging** — All mutations logged to `ActivityLog` table for audit trail
- **Optimistic UI** — Drag-and-drop status updates with instant visual feedback

---

## 📄 License

This project is for educational/assessment purposes.
