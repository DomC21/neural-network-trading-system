import { Icons } from '../icons';
import { ServiceMetricsChart } from './ServiceMetricsChart';
import { ServiceSimulator } from './ServiceSimulator';

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
    <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-4">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{service.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{service.description}</p>
          </div>
          <span className={`px-3 py-1 rounded text-sm font-medium ${getCategoryColor(service.category)}`}>
            {service.category}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <p className="text-sm text-gray-500 dark:text-gray-400">Revenue</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              ${service.metrics.revenue.toLocaleString()}
            </p>
          </div>

          <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <p className="text-sm text-gray-500 dark:text-gray-400">Margin</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {service.metrics.profit_margin.toFixed(1)}%
            </p>
          </div>

          <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <p className="text-sm text-gray-500 dark:text-gray-400">Usage</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {service.metrics.usage_count}
            </p>
          </div>
        </div>

        {isSelected && (
          <div className="space-y-4">
            <div className="animate-fade-in">
              <ServiceMetricsChart data={chartData} height={200} />
            </div>
            <ServiceSimulator
              initialRevenue={service.metrics.revenue}
              initialUsage={service.metrics.usage_count}
              initialMargin={service.metrics.profit_margin}
              onSimulate={(params) => {
                console.log('Simulation params:', params);
                // TODO: Implement simulation logic
              }}
            />
          </div>
        )}

        <button
          onClick={onAnalyze}
          className="w-full py-2 bg-[#45B6B0] hover:bg-[#3a9a95] text-white rounded flex items-center justify-center gap-2"
        >
          <Icons.BarChart className="w-4 h-4" />
          <span>{isSelected ? 'Hide Details' : 'Analyze Service'}</span>
        </button>
      </div>
    </div>
  );
}
