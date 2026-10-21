import React from 'react';

/**
 * Standardized Badge Component
 * Variants: success | danger | warning | primary | neutral | gold
 * Sizes: sm | md
 */
export const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  ...props
}) => {
  const variantStyles = {
    success: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
    danger: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
    warning: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
    primary: 'bg-amber-900/40 text-amber-200 border-amber-700/50',
    gold: 'bg-[#fbc687]/20 text-[#fbc687] border-[#fbc687]/40',
    neutral: 'bg-stone-800/80 text-stone-300 border-stone-700/60',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wider uppercase font-extrabold',
    md: 'text-xs px-2.5 py-1 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border ${variantStyles[variant] || variantStyles.neutral} ${sizeStyles[size] || sizeStyles.md} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
