import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/layout/Layout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import DashboardOverview from '../pages/Dashboard/DashboardOverview';
import ProjectList from '../pages/Projects/ProjectList';
import ProjectBoard from '../pages/Projects/ProjectBoard';
import UserManagement from '../pages/Admin/UserManagement';
import Profile from '../pages/Profile/Profile';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner className="min-h-screen" size="lg" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (user?.systemRole !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardOverview />} />
        <Route path="projects" element={<ProjectList />} />
        <Route path="projects/:id" element={<ProjectBoard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
