import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, error, icon, className = '', id, ...props }) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full rounded-xl border transition-all duration-200 bg-white/50 backdrop-blur-sm
            ${icon ? 'pl-11' : 'pl-4'} pr-4 py-2.5 text-sm
            ${error
              ? 'border-rose-300 text-rose-900 placeholder-rose-400 focus:ring-rose-500 focus:border-rose-500'
              : 'border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-indigo-500 focus:border-indigo-500 hover:border-slate-300'
            }
            focus:outline-none focus:ring-2 focus:ring-offset-0
            dark:bg-slate-800/50 dark:border-slate-600 dark:text-white dark:placeholder-slate-500
            ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
