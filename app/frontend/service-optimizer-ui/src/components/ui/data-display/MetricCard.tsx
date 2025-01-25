import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from '@radix-ui/react-tooltip';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  tooltipContent?: string;
}

export function MetricCard({
  title,
  value,
  icon,
  description,
  trend,
  tooltipContent,
}: MetricCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <Tooltip content={tooltipContent}>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
              {trend && (
                <span
                  className={`text-sm font-medium ${
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            )}
          </div>
          <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            {icon}
          </div>
        </div>
      </Tooltip>
    </motion.div>
  );
}
