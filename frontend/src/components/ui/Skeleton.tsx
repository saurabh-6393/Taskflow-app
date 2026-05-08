import React from 'react';

const shimmer = 'animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg';

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 ${className}`}>
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-10 h-10 rounded-xl ${shimmer}`} />
      <div className="flex-1 space-y-2">
        <div className={`h-4 w-3/4 ${shimmer}`} />
        <div className={`h-3 w-1/2 ${shimmer}`} />
      </div>
    </div>
    <div className="space-y-2">
      <div className={`h-3 w-full ${shimmer}`} />
      <div className={`h-3 w-5/6 ${shimmer}`} />
    </div>
    <div className="flex gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
      <div className={`h-3 w-16 ${shimmer}`} />
      <div className={`h-3 w-20 ${shimmer}`} />
    </div>
  </div>
);

export const SkeletonStat: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className={`h-3 w-20 ${shimmer}`} />
        <div className={`h-8 w-12 ${shimmer}`} />
      </div>
      <div className={`w-12 h-12 rounded-xl ${shimmer}`} />
    </div>
  </div>
);

export const SkeletonChart: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
    <div className={`h-5 w-40 mb-4 ${shimmer}`} />
    <div className="flex items-end gap-3 h-48">
      {[60, 80, 45, 90, 70, 55].map((h, i) => (
        <div key={i} className={`flex-1 rounded-t-lg ${shimmer}`} style={{ height: `${h}%` }} />
      ))}
    </div>
  </div>
);

export const SkeletonKanban: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {[0, 1, 2].map((col) => (
      <div key={col} className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <div className={`h-5 w-24 ${shimmer}`} />
          <div className={`h-5 w-6 rounded-full ${shimmer}`} />
        </div>
        <div className="space-y-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-3 min-h-[300px]">
          {Array.from({ length: col === 0 ? 3 : col === 1 ? 2 : 1 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 space-y-3">
              <div className={`h-4 w-4/5 ${shimmer}`} />
              <div className={`h-3 w-full ${shimmer}`} />
              <div className="flex justify-between items-center">
                <div className={`h-3 w-16 ${shimmer}`} />
                <div className={`w-6 h-6 rounded-full ${shimmer}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonTable: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
    <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 flex gap-6">
      {[120, 80, 60, 80, 100].map((w, i) => (
        <div key={i} className={`h-3 ${shimmer}`} style={{ width: w }} />
      ))}
    </div>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="px-6 py-4 flex items-center gap-6 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3 w-40">
          <div className={`w-8 h-8 rounded-lg ${shimmer}`} />
          <div className="space-y-1.5">
            <div className={`h-3 w-24 ${shimmer}`} />
            <div className={`h-2.5 w-32 ${shimmer}`} />
          </div>
        </div>
        <div className={`h-5 w-16 rounded-full ${shimmer}`} />
        <div className={`h-5 w-14 rounded-full ${shimmer}`} />
        <div className={`h-3 w-20 ${shimmer}`} />
        <div className="flex gap-2 ml-auto">
          <div className={`h-7 w-20 rounded-lg ${shimmer}`} />
          <div className={`h-7 w-20 rounded-lg ${shimmer}`} />
        </div>
      </div>
    ))}
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-8 animate-fade-in">
    <div className="space-y-2">
      <div className={`h-7 w-40 ${shimmer}`} />
      <div className={`h-4 w-64 ${shimmer}`} />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SkeletonChart />
      <SkeletonChart />
    </div>
  </div>
);

export const ProjectListSkeleton: React.FC = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className={`h-7 w-28 ${shimmer}`} />
        <div className={`h-4 w-20 ${shimmer}`} />
      </div>
      <div className={`h-10 w-36 rounded-xl ${shimmer}`} />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  </div>
);

export const ProjectBoardSkeleton: React.FC = () => (
  <div className="space-y-5 animate-fade-in">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${shimmer}`} />
        <div className="space-y-2">
          <div className={`h-7 w-48 ${shimmer}`} />
          <div className={`h-4 w-64 ${shimmer}`} />
        </div>
      </div>
      <div className="flex gap-2">
        <div className={`h-9 w-28 rounded-lg ${shimmer}`} />
        <div className={`h-9 w-28 rounded-lg ${shimmer}`} />
      </div>
    </div>
    <div className={`h-12 w-full rounded-xl border border-slate-100 dark:border-slate-700 ${shimmer}`} />
    <SkeletonKanban />
  </div>
);

export const UserManagementSkeleton: React.FC = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="space-y-2">
      <div className={`h-7 w-48 ${shimmer}`} />
      <div className={`h-4 w-32 ${shimmer}`} />
    </div>
    <SkeletonTable />
  </div>
);
