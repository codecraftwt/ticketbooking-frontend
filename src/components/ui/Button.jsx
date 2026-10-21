import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Standardized Button Component with proper shape (rounded-xl)
 * Variants: primary | gold | secondary | outline | ghost | danger | success
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
      'bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white shadow-sm border border-amber-600/80',
    gold:
      'bg-[#fbc687] hover:bg-[#fad3a2] active:bg-[#f7b973] text-[#341602] font-bold shadow-md border border-[#fbc687]',
    secondary:
      'bg-stone-800/80 hover:bg-stone-800 text-stone-200 border border-amber-900/50',
    outline:
      'bg-transparent hover:bg-white/5 active:bg-white/10 text-stone-200 border border-amber-900/60',
    ghost:
      'bg-transparent hover:bg-white/10 active:bg-white/15 text-stone-300',
    danger:
      'bg-rose-900/60 hover:bg-rose-900 text-rose-200 border border-rose-700/60',
    success:
      'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-sm border border-emerald-600',
  };

  const sizeStyles = {
    sm: 'text-xs h-8 px-3.5 gap-1.5 rounded-lg font-semibold',
    md: 'text-xs sm:text-sm h-10 px-5 gap-2 rounded-xl font-bold',
    lg: 'text-sm sm:text-base h-12 px-6 gap-2.5 rounded-xl font-extrabold',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center cursor-pointer select-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
      ) : (
        LeftIcon && <LeftIcon className="w-4 h-4 text-current shrink-0" strokeWidth={2} />
      )}
      <span>{children}</span>
      {!isLoading && RightIcon && <RightIcon className="w-4 h-4 text-current shrink-0" strokeWidth={2} />}
    </button>
  );
};
