import { motion } from 'framer-motion';
import { Icons } from '../icons';
import { ServiceMetricsChart } from './ServiceMetricsChart';
import { ServiceSimulator } from './ServiceSimulator';
import { Tooltip } from '../tooltip';

interface ServiceCardProps {
  service: {
    id: string;
    name: string;
    description: string;
    category: string;
    metrics: {
      revenue: number;
      profit_margin: number;
      usage_count: number;
    };
    performance: {
      monthly_profits: number[];
      seasonal_trends: Record<string, number>;
    };
  };
  onAnalyze: () => void;
  isSelected: boolean;
}

export function ServiceCard({ service, onAnalyze, isSelected }: ServiceCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Profitable':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Optimization':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Unprofitable':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const chartData = service.performance.monthly_profits.map((profit, index) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index],
    profit,
    revenue: profit * (1 + service.metrics.profit_margin / 100),
  }));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{service.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{service.description}</p>
          </div>
          <Tooltip content={
            service.category === 'Profitable' ? 'Services with profit margins above 40%, ideal for scaling' :
            service.category === 'Optimization' ? 'Services with margins between 20-40%, requiring optimization' :
            'Services with margins below 20%, consider restructuring'
          }>
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${getCategoryColor(service.category)}`}>
              {service.category}
            </span>
          </Tooltip>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <Tooltip content="Total monthly revenue generated from this service, including all fees and charges">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-600">
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                Revenue
                <Icons.HelpCircle className="w-4 h-4 text-gray-400" /></p>
              <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                ${service.metrics.revenue.toLocaleString()}
              </p>
            </div>
          </Tooltip>

          <Tooltip content="Percentage of revenue that becomes profit after deducting all costs (fixed and variable)">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-600">
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                Margin
                <Icons.HelpCircle className="w-4 h-4 text-gray-400" /></p>
              <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {service.metrics.profit_margin.toFixed(1)}%
              </p>
            </div>
          </Tooltip>

          <Tooltip content="Total number of service utilizations in the last month, indicating demand and adoption">
            <div className="col-span-2 sm:col-span-1 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-600">
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                Usage
                <Icons.HelpCircle className="w-4 h-4 text-gray-400" /></p>
              <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {service.metrics.usage_count}
              </p>
            </div>
          </Tooltip>
        </div>

        {isSelected && (
          <>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <ServiceMetricsChart data={chartData} height={200} />
            </motion.div>
            <ServiceSimulator
              initialRevenue={service.metrics.revenue}
              initialUsage={service.metrics.usage_count}
              initialMargin={service.metrics.profit_margin}
              onSimulate={(params) => {
                console.log('Simulation params:', params);
                // TODO: Implement simulation logic
              }}
            />
          </>
        )}

        <Tooltip content={isSelected ? 'Hide detailed analysis and metrics' : 'View AI-powered analysis and detailed performance metrics'}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAnalyze}
            className="w-full py-2 px-4 bg-[#45B6B0] hover:bg-[#3a9a95] text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Icons.BarChart className="w-4 h-4" />
            <span>{isSelected ? 'Hide Details' : 'Analyze Service'}</span>
          </motion.button>
        </Tooltip>
      </div>
    </motion.div>
  );
}
