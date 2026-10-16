import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * Standardized Stat Card Component
 */
export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'indigo', // 'indigo' | 'emerald' | 'purple' | 'pink' | 'amber'
  className = '',
}) => {
  const colorMap = {
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      accent: 'text-indigo-600',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      accent: 'text-emerald-600',
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      accent: 'text-purple-600',
    },
    pink: {
      iconBg: 'bg-pink-50 text-pink-600 border-pink-100',
      accent: 'text-pink-600',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      accent: 'text-amber-600',
    },
  };

  const scheme = colorMap[colorScheme] || colorMap.indigo;

  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-2xl p-5 card-shadow card-shadow-hover flex flex-col justify-between space-y-3 ${className}`}
    >
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center border ${scheme.iconBg}`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-3xl font-extrabold font-['Outfit'] text-slate-900 tracking-tight">
          {value}
        </div>

        {(subtitle || trend) && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            {trend && (
              <span
                className={`inline-flex items-center gap-0.5 font-semibold ${
                  trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {trend.isPositive ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                <span>{trend.text}</span>
              </span>
            )}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
