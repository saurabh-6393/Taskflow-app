import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ThemeContext } from '../../context/ThemeContext';
import apiClient from '../../services/apiClient';
import Card from '../../components/ui/Card';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import type { DashboardSummary, Project } from '../../types';

const COLORS = {
  TODO: '#a855f7', // neon purple
  IN_PROGRESS: '#ec4899', // neon pink
  DONE: '#06b6d4', // neon cyan
};

const DashboardOverview: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useContext(ThemeContext);
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get('/dashboard/summary'),
      apiClient.get('/projects'),
    ]).then(([dashRes, projRes]) => {
      setData(dashRes.data.data);
      setProjects(projRes.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const stats = [
    { label: 'Total Tasks', value: data?.totalTasks || 0, icon: '📋', color: 'from-indigo-500 to-purple-500', shadow: 'shadow-indigo-500/20' },
    { label: 'In Progress', value: data?.tasksByStatus?.IN_PROGRESS || 0, icon: '🔄', color: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/20' },
    { label: 'Completed', value: data?.tasksByStatus?.DONE || 0, icon: '✅', color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' },
    { label: 'Overdue', value: data?.overdueTasks || 0, icon: '⚠️', color: 'from-rose-500 to-pink-500', shadow: 'shadow-rose-500/20' },
  ];

  // Pie chart data
  const pieData = [
    { name: 'To Do', value: data?.tasksByStatus?.TODO || 0, color: COLORS.TODO },
    { name: 'In Progress', value: data?.tasksByStatus?.IN_PROGRESS || 0, color: COLORS.IN_PROGRESS },
    { name: 'Done', value: data?.tasksByStatus?.DONE || 0, color: COLORS.DONE },
  ].filter(d => d.value > 0);

  // Bar chart data
  const barData = projects.map(p => ({
    name: p.name.length > 15 ? p.name.slice(0, 15) + '…' : p.name,
    tasks: p._count?.tasks || 0,
  }));

  const textColor = isDark ? '#e2e8f0' : '#334155';
  const gridColor = isDark ? '#334155' : '#e2e8f0';

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back! Here's your overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5 hover:scale-[1.02] transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{s.value}</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center text-xl shadow-lg ${s.shadow}`}>
                {s.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Task Distribution</h3>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                {pieData.map((item) => {
                  const total = data?.totalTasks || 1;
                  const pct = Math.round((item.value / total) * 100);
                  return (
                    <div key={item.name} className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{item.value} ({pct}%)</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No tasks yet</div>
          )}
        </Card>

        {/* Bar Chart - Tasks per Project */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Tasks per Project</h3>
          {barData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#fff',
                      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      color: textColor,
                      fontSize: '13px',
                    }}
                    cursor={{ fill: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.05)' }}
                  />
                  <Bar dataKey="tasks" fill="url(#barGradient)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No projects yet</div>
          )}
        </Card>

        {/* Bar Chart - Tasks per User */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Tasks per User</h3>
          {(data?.tasksPerUser?.length || 0) > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.tasksPerUser || []} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d946ef" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#252836' : '#fff',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'}`,
                      borderRadius: '16px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                      color: textColor,
                      fontSize: '13px',
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#d946ef" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No tasks assigned</div>
          )}
        </Card>
      </div>

      {/* Recent Activity + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
          {data?.recentActivity?.length ? (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {data.recentActivity.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-sm group">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0 group-hover:scale-150 transition-transform" />
                  <div>
                    <p className="text-slate-700 dark:text-slate-300">
                      <span className="font-medium text-indigo-600 dark:text-indigo-400">{log.action.replace(/_/g, ' ')}</span> on {log.entityType.toLowerCase()}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No recent activity</p>
          )}
        </Card>

        {/* Quick Stats Column */}
        <div className="space-y-4">
          <Card className="p-5 hover:scale-[1.02] transition-transform">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-600">📅</div>
              <div><p className="text-sm text-slate-500">Due Today</p><p className="text-xl font-bold text-slate-900 dark:text-white">{data?.tasksDueToday || 0}</p></div>
            </div>
          </Card>
          <Card className="p-5 hover:scale-[1.02] transition-transform">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600">📂</div>
              <div><p className="text-sm text-slate-500">Projects</p><p className="text-xl font-bold text-slate-900 dark:text-white">{data?.projectsCount || 0}</p></div>
            </div>
          </Card>
          <Card className="p-5 hover:scale-[1.02] transition-transform">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/20 rounded-xl flex items-center justify-center text-rose-600">🔥</div>
              <div><p className="text-sm text-slate-500">Completion Rate</p><p className="text-xl font-bold text-slate-900 dark:text-white">{data?.totalTasks ? Math.round(((data.tasksByStatus?.DONE || 0) / data.totalTasks) * 100) : 0}%</p></div>
            </div>
          </Card>
        </div>
      </div>

      {/* Per-Project Task Breakdown */}
      {projects.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Projects Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map(p => (
              <Card key={p.id} hover onClick={() => navigate(`/projects/${p.id}`)} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{p.name}</h4>
                      <p className="text-xs text-slate-500">{p._count?.members || 0} members</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'}`}>
                    {p.status}
                  </span>
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                    📋 {p._count?.tasks || 0} tasks
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
