import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-govblue-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5'
  };

  const variantStyles = {
    primary: 'bg-govblue-800 hover:bg-govblue-900 text-white shadow-sm hover:shadow-md border border-transparent active:translate-y-0.5',
    secondary: 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 shadow-sm hover:border-slate-400 active:translate-y-0.5',
    accent: 'bg-saffron-600 hover:bg-saffron-700 text-white shadow-sm hover:shadow-md border border-transparent',
    outline: 'bg-transparent hover:bg-govblue-50 text-govblue-800 border border-govblue-800',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-transparent',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
      )}
      {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
