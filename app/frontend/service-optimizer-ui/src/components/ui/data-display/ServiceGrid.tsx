import { AlertCircle } from 'lucide-react';
import { ServiceCard } from './ServiceCard';

interface Service {
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
}

interface ServiceGridProps {
  services: Service[];
  selectedServiceId: string | null;
  onServiceSelect: (serviceId: string) => void;
}

export function ServiceGrid({ services, selectedServiceId, onServiceSelect }: ServiceGridProps) {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <div key={service.id} className="w-full animate-fade-in">
            <ServiceCard
              service={service}
              isSelected={selectedServiceId === service.id}
              onAnalyze={() => onServiceSelect(service.id)}
            />
          </div>
        ))}
      </div>
      {services.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 mb-4">
            <AlertCircle className="w-6 h-6 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            No services found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your filters or search criteria
          </p>
        </div>
      )}
    </div>
  );
}
