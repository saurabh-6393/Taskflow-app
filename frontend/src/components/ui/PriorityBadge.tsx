import React from 'react';

interface PriorityBadgeProps {
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const styles = {
    LOW: 'text-slate-500 dark:text-slate-400',
    MEDIUM: 'text-amber-600 dark:text-amber-400',
    HIGH: 'text-rose-600 dark:text-rose-400',
  };

  const icons = {
    LOW: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 15.586l3.293-3.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    ),
    MEDIUM: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    ),
    HIGH: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414l-3.293 3.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    ),
  };

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${styles[priority]}`}>
      {icons[priority]}
      {priority}
    </span>
  );
};

export default PriorityBadge;
