import React from 'react';

/**
 * Standardized Page Header Banner
 */
export const PageHeader = ({
  title,
  description,
  badge,
  actions,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 card-shadow ${className}`}
    >
      <div className="space-y-1.5">
        {badge && <div>{badge}</div>}
        <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] text-slate-900 tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
