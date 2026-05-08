import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import apiClient from '../../services/apiClient';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import StatusBadge from '../../components/ui/StatusBadge';
import PriorityBadge from '../../components/ui/PriorityBadge';
import { ProjectBoardSkeleton } from '../../components/ui/Skeleton';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import type { Task, Project, ProjectMember } from '../../types';

const COLUMNS: { key: Task['status']; label: string; color: string; bg: string }[] = [
  { key: 'TODO', label: 'To Do', color: 'border-slate-300 dark:border-slate-600', bg: 'bg-slate-100/50 dark:bg-slate-800/50' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: 'border-blue-400 dark:border-blue-600', bg: 'bg-blue-50/50 dark:bg-blue-900/10' },
  { key: 'DONE', label: 'Done', color: 'border-emerald-400 dark:border-emerald-600', bg: 'bg-emerald-50/50 dark:bg-emerald-900/10' },
];

// Draggable Task Card
const TaskCard: React.FC<{ task: Task; onClick: () => void }> = ({ task, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id, data: { task } });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className={`bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-0.5 transition-all
      ${isOverdue ? 'border-rose-300 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-900/10' : 'border-slate-100 dark:border-slate-700'}`}>
      <div className="flex items-start justify-between mb-2" onClick={(e) => { e.stopPropagation(); onClick(); }}>
        <h4 className="text-sm font-medium text-slate-900 dark:text-white flex-1 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{task.title}</h4>
        <PriorityBadge priority={task.priority} />
      </div>
      {task.description && <p className="text-xs text-slate-500 mb-2 line-clamp-2">{task.description}</p>}
      <div className="flex items-center justify-between">
        {task.assignee ? (
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <span className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-[8px] font-bold">{task.assignee.name.charAt(0)}</span>
            {task.assignee.name}
          </span>
        ) : <span className="text-xs text-slate-400 italic">Unassigned</span>}
        {task.dueDate && (
          <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-rose-500 font-semibold' : 'text-slate-400'}`}>
            {isOverdue && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
      {task.comments && task.comments.length > 0 && (
        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-50 dark:border-slate-700 text-xs text-slate-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          {task.comments.length}
        </div>
      )}
    </div>
  );
};

// Kanban Column with Droppable support
const KanbanColumn: React.FC<{ col: any; colTasks: Task[]; openTaskDetail: (t: Task) => void }> = ({ col, colTasks, openTaskDetail }) => {
  const { setNodeRef } = useDroppable({ id: col.key });
  
  return (
    <SortableContext id={col.key} items={colTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
      <div ref={setNodeRef} className={`rounded-2xl p-4 border-t-2 ${col.color} ${col.bg} min-h-[300px]`} id={col.key}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">{col.label}</h3>
          <span className="text-xs bg-white dark:bg-slate-700 px-2 py-0.5 rounded-full text-slate-500 font-medium shadow-sm">{colTasks.length}</span>
        </div>
        <div className="space-y-2">
          {colTasks.map(task => (
            <TaskCard key={task.id} task={task} onClick={() => openTaskDetail(task)} />
          ))}
          {colTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              <p className="text-xs">Drop tasks here</p>
            </div>
          )}
        </div>
      </div>
    </SortableContext>
  );
};

const ProjectBoard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const [comment, setComment] = useState('');

  // CSV Export
  const exportCSV = () => {
    if (tasks.length === 0) return;
    const headers = ['Title', 'Status', 'Priority', 'Assignee', 'Due Date', 'Description'];
    const rows = tasks.map(t => [
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.status,
      t.priority,
      t.assignee?.name || 'Unassigned',
      t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '',
      `"${(t.description || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.name || 'tasks'}-export.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Tasks exported!');
  };
  const [creating, setCreating] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; taskId: string | null }>({ open: false, taskId: null });

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: '' });
  const [savingEdit, setSavingEdit] = useState(false);
  const [activityLog, setActivityLog] = useState<any[]>([]);

  // Filters
  const [filterPriority, setFilterPriority] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const fetchData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        apiClient.get(`/projects/${id}`),
        apiClient.get(`/tasks/project/${id}`),
      ]);
      setProject(projRes.data.data);
      setTasks(tasksRes.data.data);
    } catch (err) { toast.error('Failed to load project'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (filterPriority && t.priority !== filterPriority) return false;
    if (filterAssignee && t.assigneeId !== filterAssignee) return false;
    if (filterSearch && !t.title.toLowerCase().includes(filterSearch.toLowerCase())) return false;
    return true;
  });

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Identify the target status
    let targetStatus: string | null = null;
    
    if (COLUMNS.some(c => c.key === overId)) {
      targetStatus = overId; // Dropped directly on column
    } else {
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) targetStatus = overTask.status; // Dropped on another task
    }

    if (targetStatus) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== targetStatus) {
        const previousStatus = task.status;
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: targetStatus as Task['status'] } : t));
        try {
          await apiClient.patch(`/tasks/${taskId}/status`, { status: targetStatus });
          const targetColumnLabel = COLUMNS.find(c => c.key === targetStatus)?.label;
          toast.success(`Task moved to ${targetColumnLabel}`);
        } catch (err: any) {
          // Revert on failure
          setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: previousStatus } : t));
          toast.error(err.response?.data?.message || 'Failed to update status. Are you authorized?');
          fetchData();
        }
      }
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    setCreating(true);
    try {
      const body: any = { title: taskForm.title, description: taskForm.description, priority: taskForm.priority };
      if (taskForm.dueDate) body.dueDate = new Date(taskForm.dueDate).toISOString();
      if (taskForm.assigneeId) body.assigneeId = taskForm.assigneeId;
      await apiClient.post(`/tasks/project/${id}`, body);
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: '' });
      toast.success('Task created successfully!');
      fetchData();
    } catch (err) { toast.error('Failed to create task'); }
    finally { setCreating(false); }
  };

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post(`/projects/${id}/members`, { email: memberEmail });
      setMemberEmail('');
      setShowMemberModal(false);
      toast.success('Member added!');
      fetchData();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to add member'); }
  };

  const addComment = async () => {
    if (!comment.trim() || !selectedTask) return;
    try {
      await apiClient.post(`/tasks/${selectedTask.id}/comments`, { content: comment });
      setComment('');
      toast.success('Comment added');
      const res = await apiClient.get(`/tasks/${selectedTask.id}`);
      setSelectedTask(res.data.data);
    } catch (err) { toast.error('Failed to add comment'); }
  };

  const openTaskDetail = async (task: Task) => {
    try {
      const [taskRes, activityRes] = await Promise.all([
        apiClient.get(`/tasks/${task.id}`),
        apiClient.get(`/tasks/${task.id}/activity`),
      ]);
      setSelectedTask(taskRes.data.data);
      setActivityLog(activityRes.data.data || []);
      setIsEditing(false);
      setShowDetailModal(true);
    } catch (err) { toast.error('Failed to load task details'); }
  };

  const startEditing = () => {
    if (!selectedTask) return;
    setEditForm({
      title: selectedTask.title,
      description: selectedTask.description || '',
      priority: selectedTask.priority,
      dueDate: selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString().split('T')[0] : '',
      assigneeId: selectedTask.assigneeId || '',
    });
    setIsEditing(true);
  };

  const saveEdit = async () => {
    if (!selectedTask || !editForm.title.trim()) return;
    setSavingEdit(true);
    try {
      const body: any = { title: editForm.title, description: editForm.description, priority: editForm.priority };
      body.dueDate = editForm.dueDate ? new Date(editForm.dueDate).toISOString() : null;
      await apiClient.patch(`/tasks/${selectedTask.id}`, body);
      if (editForm.assigneeId !== (selectedTask.assigneeId || '')) {
        await apiClient.patch(`/tasks/${selectedTask.id}/assignee`, { assigneeId: editForm.assigneeId || null });
      }
      toast.success('Task updated!');
      setIsEditing(false);
      setShowDetailModal(false);
      fetchData();
    } catch (err) { toast.error('Failed to update task'); }
    finally { setSavingEdit(false); }
  };

  const confirmDeleteTask = (taskId: string) => {
    setDeleteConfirm({ open: true, taskId });
  };

  const deleteTask = async () => {
    if (!deleteConfirm.taskId) return;
    try {
      await apiClient.delete(`/tasks/${deleteConfirm.taskId}`);
      setShowDetailModal(false);
      setDeleteConfirm({ open: false, taskId: null });
      toast.success('Task deleted');
      fetchData();
    } catch (err) { toast.error('Failed to delete task'); }
  };

  if (loading) return <ProjectBoardSkeleton />;

  const members = (project as any)?.members as ProjectMember[] || [];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/projects')} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{project?.name}</h1>
            {project?.description && <p className="text-sm text-slate-500 mt-0.5">{project.description}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={exportCSV} title="Export tasks as CSV">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Export CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setShowMemberModal(true)}>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            Add Member
          </Button>
          <Button size="sm" onClick={() => setShowTaskModal(true)}>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Task
          </Button>
        </div>
      </div>

      {/* Members strip */}
      {members.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 mr-1">Members:</span>
          {members.map(m => (
            <span key={m.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs">
              <span className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">{m.user?.name?.charAt(0)}</span>
              {m.user?.name} <span className="text-slate-400">({m.role})</span>
            </span>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 p-3 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Search tasks..." value={filterSearch} onChange={e => setFilterSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
        </div>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
          className="px-3 py-2 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
          <option value="">All Priorities</option>
          <option value="HIGH">🔴 High</option>
          <option value="MEDIUM">🟡 Medium</option>
          <option value="LOW">🟢 Low</option>
        </select>
        <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)}
          className="px-3 py-2 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
          <option value="">All Assignees</option>
          {members.map(m => <option key={m.userId} value={m.userId}>{m.user?.name}</option>)}
        </select>
        {(filterSearch || filterPriority || filterAssignee) && (
          <button onClick={() => { setFilterSearch(''); setFilterPriority(''); setFilterAssignee(''); }}
            className="px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
            Clear Filters
          </button>
        )}
      </div>

      {/* Kanban Board with DnD */}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.key);
            return <KanbanColumn key={col.key} col={col} colTasks={colTasks} openTaskDetail={openTaskDetail} />;
          })}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-xl border-2 border-indigo-400 rotate-2 scale-105">
              <h4 className="text-sm font-medium text-slate-900 dark:text-white">{activeTask.title}</h4>
              <PriorityBadge priority={activeTask.priority} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Create Task Modal */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Create Task">
        <form onSubmit={createTask} className="space-y-4">
          <Input label="Title" placeholder="Task title" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <textarea className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" rows={3} value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Priority</label>
              <select className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
              </select>
            </div>
            <Input label="Due Date" type="date" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} />
          </div>
          {members.length > 0 && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Assign To</label>
              <select className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={taskForm.assigneeId} onChange={e => setTaskForm({...taskForm, assigneeId: e.target.value})}>
                <option value="">Unassigned</option>
                {members.map(m => <option key={m.userId} value={m.userId}>{m.user?.name}</option>)}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowTaskModal(false)}>Cancel</Button>
            <Button type="submit" isLoading={creating}>Create</Button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Add Team Member">
        <form onSubmit={addMember} className="space-y-4">
          <Input label="Email Address" type="email" placeholder="member@example.com" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowMemberModal(false)}>Cancel</Button>
            <Button type="submit">Add Member</Button>
          </div>
        </form>
      </Modal>

      {/* Task Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => { setShowDetailModal(false); setSelectedTask(null); setIsEditing(false); }} title={isEditing ? 'Edit Task' : (selectedTask?.title || 'Task Details')} size="lg">
        {selectedTask && !isEditing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge status={selectedTask.status} />
              <PriorityBadge priority={selectedTask.priority} />
              {selectedTask.assignee && <span className="text-sm text-slate-500">→ {selectedTask.assignee.name}</span>}
              {selectedTask.dueDate && (
                <span className={`text-sm ${new Date(selectedTask.dueDate) < new Date() && selectedTask.status !== 'DONE' ? 'text-rose-500 font-semibold' : 'text-slate-500'}`}>
                  📅 {new Date(selectedTask.dueDate).toLocaleDateString()}
                  {new Date(selectedTask.dueDate) < new Date() && selectedTask.status !== 'DONE' && ' (OVERDUE)'}
                </span>
              )}
            </div>
            {selectedTask.description && <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/30 p-3 rounded-xl">{selectedTask.description}</p>}

            {/* Quick status change */}
            <div className="flex gap-2">
              {COLUMNS.filter(c => c.key !== selectedTask.status).map(c => (
                <button key={c.key} onClick={async () => {
                  try {
                    await apiClient.patch(`/tasks/${selectedTask.id}/status`, { status: c.key });
                    toast.success(`Moved to ${c.label}`);
                    setShowDetailModal(false);
                    fetchData();
                  } catch { toast.error('Failed'); }
                }} className="flex-1 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-100 hover:text-indigo-700 dark:hover:bg-indigo-900/30 transition-colors">
                  → {c.label}
                </button>
              ))}
            </div>

            {/* Comments */}
            <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">💬 Comments ({selectedTask.comments?.length || 0})</h4>
              <div className="space-y-3 max-h-48 overflow-y-auto mb-3">
                {selectedTask.comments?.map(c => (
                  <div key={c.id} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">{c.author?.name?.charAt(0)}</span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{c.author?.name}</span>
                      <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{c.content}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Add a comment..." value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && addComment()} />
                <Button size="sm" onClick={addComment}>Send</Button>
              </div>
            </div>

            {/* Activity Timeline */}
            {activityLog.length > 0 && (
              <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">📜 Activity Timeline</h4>
                <div className="space-y-0 max-h-48 overflow-y-auto">
                  {activityLog.map((log, i) => (
                    <div key={log.id} className="flex gap-3 relative">
                      <div className="flex flex-col items-center">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${
                          log.action === 'CREATED' ? 'bg-emerald-500' :
                          log.action === 'STATUS_UPDATED' ? 'bg-blue-500' :
                          log.action === 'DELETED' ? 'bg-rose-500' : 'bg-indigo-500'
                        }`} />
                        {i < activityLog.length - 1 && <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700 my-1" />}
                      </div>
                      <div className="pb-3">
                        <p className="text-xs text-slate-700 dark:text-slate-300">
                          <span className="font-medium">{log.user?.name}</span>{' '}
                          <span className="text-slate-500">
                            {log.action === 'CREATED' && 'created this task'}
                            {log.action === 'UPDATED' && 'updated this task'}
                            {log.action === 'STATUS_UPDATED' && `changed status${log.metadata?.from ? ` from ${log.metadata.from}` : ''} to ${log.metadata?.to || ''}`}
                            {log.action === 'ASSIGNEE_UPDATED' && 'reassigned this task'}
                            {log.action === 'DELETED' && 'deleted this task'}
                          </span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{new Date(log.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
              <Button variant="danger" size="sm" onClick={() => confirmDeleteTask(selectedTask.id)}>Delete Task</Button>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={startEditing}>
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Edit
                </Button>
                <Button variant="secondary" size="sm" onClick={() => { setShowDetailModal(false); setSelectedTask(null); }}>Close</Button>
              </div>
            </div>
          </div>
        )}
        {selectedTask && isEditing && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
              <input className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
              <textarea className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" rows={3} value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Priority</label>
                <select className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={editForm.priority} onChange={e => setEditForm({...editForm, priority: e.target.value})}>
                  <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Due Date</label>
                <input type="date" className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={editForm.dueDate} onChange={e => setEditForm({...editForm, dueDate: e.target.value})} />
              </div>
            </div>
            {members.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Assign To</label>
                <select className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={editForm.assigneeId} onChange={e => setEditForm({...editForm, assigneeId: e.target.value})}>
                  <option value="">Unassigned</option>
                  {members.map(m => <option key={m.userId} value={m.userId}>{m.user?.name}</option>)}
                </select>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
              <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button size="sm" isLoading={savingEdit} onClick={saveEdit}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={deleteTask}
        onCancel={() => setDeleteConfirm({ open: false, taskId: null })}
      />
    </div>
  );
};

export default ProjectBoard;
