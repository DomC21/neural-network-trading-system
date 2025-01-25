import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="relative">
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        <AnimatePresence mode="popLayout">
          {services.map((service) => (
            <motion.div
              key={service.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 },
                layout: { duration: 0.3 }
              }}
              className="w-full"
            >
              <ServiceCard
                service={service}
                isSelected={selectedServiceId === service.id}
                onAnalyze={() => onServiceSelect(service.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
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
