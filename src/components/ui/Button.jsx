import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Standardized Button Component
 * Variants: primary | secondary | outline | ghost | danger
 * Sizes: sm | md | lg
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  type = 'button',
  ...props
}) => {
  const variantStyles = {
    primary:
      'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-xs border border-indigo-600',
    secondary:
      'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-200',
    outline:
      'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs',
    ghost:
      'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-700',
    danger:
      'bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-200',
    success:
      'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs border border-emerald-600',
  };

  const sizeStyles = {
    sm: 'text-xs h-8 px-3 gap-1.5 rounded-lg font-semibold',
    md: 'text-xs sm:text-sm h-10 px-4 gap-2 rounded-xl font-semibold',
    lg: 'text-sm sm:text-base h-12 px-6 gap-2.5 rounded-xl font-bold',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center cursor-pointer select-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        LeftIcon && <LeftIcon className="w-4 h-4 text-current" />
      )}
      <span>{children}</span>
      {!isLoading && RightIcon && <RightIcon className="w-4 h-4 text-current" />}
    </button>
  );
};
