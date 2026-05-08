import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { UserManagementSkeleton } from '../../components/ui/Skeleton';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import type { User } from '../../types';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmState, setConfirmState] = useState<{ open: boolean; userId: string | null; action: string }>({ open: false, userId: null, action: '' });

  const fetchUsers = () => {
    apiClient.get('/users').then(r => { setUsers(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { fetchUsers(); }, []);

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await apiClient.patch(`/users/${userId}/role`, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch { toast.error('Failed to update role'); }
  };

  const confirmDeactivate = (userId: string) => {
    setConfirmState({ open: true, userId, action: 'deactivate' });
  };

  const handleDeactivate = async () => {
    if (!confirmState.userId) return;
    try {
      await apiClient.patch(`/users/${confirmState.userId}/deactivate`);
      toast.success('User deactivated');
      setConfirmState({ open: false, userId: null, action: '' });
      fetchUsers();
    } catch { toast.error('Failed to deactivate user'); }
  };

  if (loading) return <UserManagementSkeleton />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
        <p className="text-slate-500 mt-1">{users.length} registered users</p>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">{u.name.charAt(0)}</div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.systemRole === 'ADMIN' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' : 'bg-slate-100 text-slate-600'}`}>{u.systemRole}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.isActive !== false ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {u.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => toggleRole(u.id, u.systemRole)}>
                        {u.systemRole === 'ADMIN' ? 'Make User' : 'Make Admin'}
                      </Button>
                      {u.isActive !== false && <Button variant="danger" size="sm" onClick={() => confirmDeactivate(u.id)}>Deactivate</Button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmDialog
        isOpen={confirmState.open}
        title="Deactivate User"
        message="Are you sure you want to deactivate this user? They will no longer be able to log in."
        confirmLabel="Deactivate"
        onConfirm={handleDeactivate}
        onCancel={() => setConfirmState({ open: false, userId: null, action: '' })}
      />
    </div>
  );
};

export default UserManagement;
