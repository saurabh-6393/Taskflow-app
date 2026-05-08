import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false, onClick }) => {
  return (
    <div
      className={`bg-white dark:bg-card-dark rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_10px_30px_-10px_rgba(0,0,0,0.5)]
        ${hover ? 'hover:shadow-md dark:hover:shadow-[0_15px_35px_-10px_rgba(0,0,0,0.6)] cursor-pointer transition-all duration-300 hover:-translate-y-1' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
