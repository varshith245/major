import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'central' | 'state' | 'saffron' | 'green' | 'slate' | 'rose';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  icon,
  className = ''
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full shrink-0';

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5'
  };

  const variantStyles = {
    central: 'bg-govblue-50 text-govblue-800 border border-govblue-200',
    state: 'bg-govgreen-50 text-govgreen-800 border border-govgreen-200',
    saffron: 'bg-saffron-50 text-saffron-800 border border-saffron-200',
    green: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    slate: 'bg-slate-100 text-slate-700 border border-slate-200',
    rose: 'bg-rose-50 text-rose-800 border border-rose-200'
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
