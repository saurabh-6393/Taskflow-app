import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../services/apiClient';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await apiClient.patch('/auth/me/profile', { name });
      toast.success('Name updated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update name');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error("Passwords don't match"); return; }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setChangingPw(true);
    try {
      await apiClient.patch('/auth/me/profile', { currentPassword, newPassword });
      toast.success('Password changed successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setChangingPw(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
        <p className="text-slate-500 mt-1">Manage your account settings</p>
      </div>

      {/* Avatar & Info */}
      <Card className="p-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-indigo-500/20">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <span className={`inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${user?.systemRole === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
              {user?.systemRole}
            </span>
          </div>
        </div>
      </Card>

      {/* Edit Name */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Edit Profile</h3>
        <form onSubmit={handleUpdateName} className="space-y-4">
          <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          <Input label="Email" value={user?.email || ''} disabled />
          <div className="flex justify-end">
            <Button type="submit" isLoading={saving}>Save Changes</Button>
          </div>
        </form>
      </Card>

      {/* Change Password */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Change Password</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input label="Current Password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" />
          <Input label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" />
          <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" />
          <div className="flex justify-end">
            <Button type="submit" isLoading={changingPw} variant="secondary">Change Password</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Profile;
