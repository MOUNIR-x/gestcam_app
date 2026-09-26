import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
    label: string;
  };
  icon?: LucideIcon;
  badge?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  badge,
  onClick,
  className = ''
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 backdrop-blur-xs transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </p>
        <div className="flex items-center gap-2">
          {badge}
          {Icon && (
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300">
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight font-mono-num text-slate-900 dark:text-white">
          {value}
        </span>
      </div>

      {(trend || subtitle) && (
        <div className="mt-2.5 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`font-semibold font-mono-num ${
                trend.isPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
          {trend && <span className="text-slate-400 dark:text-slate-500">·</span>}
          <span className="text-slate-500 dark:text-slate-400 truncate">
            {trend?.label || subtitle}
          </span>
        </div>
      )}
    </div>
  );
};
