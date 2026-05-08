import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { ProjectListSkeleton } from '../../components/ui/Skeleton';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import type { Project } from '../../types';

const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  // Edit state
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; project: Project | null }>({ open: false, project: null });

  // Menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const fetchProjects = () => {
    apiClient.get('/projects').then(r => { setProjects(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  // Close menu on click outside
  useEffect(() => {
    const handler = () => setOpenMenuId(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      await apiClient.post('/projects', form);
      setShowModal(false);
      setForm({ name: '', description: '' });
      toast.success('Project created!');
      fetchProjects();
    } catch (err) { toast.error('Failed to create project'); }
    finally { setCreating(false); }
  };

  const openEdit = (p: Project) => {
    setEditProject(p);
    setEditForm({ name: p.name, description: p.description || '' });
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProject || !editForm.name.trim()) return;
    setSaving(true);
    try {
      await apiClient.patch(`/projects/${editProject.id}`, editForm);
      setShowEditModal(false);
      toast.success('Project updated!');
      fetchProjects();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to update project'); }
    finally { setSaving(false); }
  };

  const handleArchive = async (p: Project) => {
    setOpenMenuId(null);
    const newStatus = p.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
    try {
      await apiClient.patch(`/projects/${p.id}`, { status: newStatus });
      toast.success(`Project ${newStatus === 'ARCHIVED' ? 'archived' : 'restored'}!`);
      fetchProjects();
    } catch (err) { toast.error('Failed to update project'); }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.project) return;
    try {
      await apiClient.delete(`/projects/${deleteConfirm.project.id}`);
      setDeleteConfirm({ open: false, project: null });
      toast.success('Project deleted!');
      fetchProjects();
    } catch (err) { toast.error('Failed to delete project'); }
  };

  if (loading) return <ProjectListSkeleton />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Projects</h1>
          <p className="text-slate-500 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">📂</div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No projects yet</h3>
          <p className="text-slate-500 mt-1">Create your first project to get started</p>
          <Button onClick={() => setShowModal(true)} className="mt-4">Create Project</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <Card key={p.id} hover className="p-5 relative group">
              {/* 3-dot menu */}
              <div className="absolute top-3 right-3 z-10">
                <button
                  onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === p.id ? null : p.id); }}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                {openMenuId === p.id && (
                  <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1 animate-scale-in z-20" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => openEdit(p)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Edit Project
                    </button>
                    <button onClick={() => handleArchive(p)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                      {p.status === 'ACTIVE' ? 'Archive' : 'Restore'}
                    </button>
                    <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                    <button onClick={() => { setDeleteConfirm({ open: true, project: p }); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Delete Project
                    </button>
                  </div>
                )}
              </div>

              <div onClick={() => navigate(`/projects/${p.id}`)} className="cursor-pointer">
                <div className="flex items-start justify-between mb-3 pr-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                    {p.status}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{p.name}</h3>
                {p.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{p.description}</p>}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    {p._count?.tasks || 0} tasks
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    {p._count?.members || 0} members
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Project Name" placeholder="e.g. Q3 Marketing Campaign" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <textarea className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" rows={3} placeholder="Describe your project..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" isLoading={creating}>Create Project</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Project Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Project">
        <form onSubmit={handleEdit} className="space-y-4">
          <Input label="Project Name" placeholder="Project name" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <textarea className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" rows={3} placeholder="Describe your project..." value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button type="submit" isLoading={saving}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteConfirm.project?.name}"? All tasks and data will be permanently removed.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ open: false, project: null })}
      />
    </div>
  );
};

export default ProjectList;
