import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  // Removed tooltipContent prop
}

export function MetricCard({
  title,
  value,
  icon,
  description,
  trend,
  // Removed tooltipContent from props
}: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700 transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex justify-between">
        <div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
            {trend && (
              <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
                {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>
        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
          {icon}
        </div>
      </div>
    </div>
  );
}
