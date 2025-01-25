import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './components/ui/theme/ThemeProvider';
import { PageLayout } from './components/ui/layout/PageLayout';
import { Sidebar } from './components/ui/navigation/Sidebar';
import { ServiceGrid } from './components/ui/data-display/ServiceGrid';
import { MetricCard } from './components/ui/data-display/MetricCard';
import { ProfitabilityPieChart } from './components/ui/data-display/ProfitabilityPieChart';
import { ChatBox } from './components/chat/ChatBox';
import { TrendingUp, TrendingDown, Users, DollarSign } from 'lucide-react';
import { fetchServices, analyzeService } from './api';
import type { Service, ServiceClassification } from './types';

function App() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<ServiceClassification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchServices()
      .then(setServices)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleServiceSelect = async (serviceId: string) => {
    if (selectedServiceId === serviceId) {
      setSelectedServiceId(null);
      setAiAnalysis(null);
      return;
    }

    setSelectedServiceId(serviceId);
    const service = services.find(s => s.id === serviceId);
    if (service) {
      try {
        const analysis = await analyzeService(service);
        setAiAnalysis(analysis);
      } catch (err) {
        console.error('Failed to analyze service:', err);
        setAiAnalysis(null);
      }
    }
  };

  // Calculate summary metrics
  const totalRevenue = services.reduce((sum, service) => sum + service.metrics.revenue, 0);
  const averageMargin = services.reduce((sum, service) => sum + service.metrics.profit_margin, 0) / services.length;
  const totalUsage = services.reduce((sum, service) => sum + service.metrics.usage_count, 0);

  const profitabilityData = [
    { name: 'Profitable', value: services.filter(s => s.metrics.profit_margin > 40).length, color: '#22c55e' },
    { name: 'Optimization', value: services.filter(s => s.metrics.profit_margin <= 40 && s.metrics.profit_margin > 20).length, color: '#eab308' },
    { name: 'Unprofitable', value: services.filter(s => s.metrics.profit_margin <= 20).length, color: '#ef4444' },
  ];

  return (
    <ThemeProvider>
      <PageLayout>
        <div className="flex">
          <Sidebar onSearch={setSearchQuery} />
          <main className="flex-1 ml-64 p-8">
            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Service Dashboard</h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor and optimize service performance</p>
                </div>
                <img src="/mss_logo.svg" alt="MSS Logo" className="h-12" />
              </div>
            </header>

            {/* Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Total Revenue"
                value={`$${totalRevenue.toLocaleString()}`}
                icon={<DollarSign className="w-5 h-5 text-green-600" />}
                trend={{ value: 12.5, isPositive: true }}
                tooltipContent="Total revenue across all services"
              />
              <MetricCard
                title="Average Margin"
                value={`${averageMargin.toFixed(1)}%`}
                icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
                trend={{ value: 2.3, isPositive: true }}
                tooltipContent="Average profit margin across all services"
              />
              <MetricCard
                title="Total Usage"
                value={totalUsage.toLocaleString()}
                icon={<Users className="w-5 h-5 text-purple-600" />}
                trend={{ value: 8.7, isPositive: true }}
                tooltipContent="Total number of service usages"
              />
              <MetricCard
                title="Services Needing Optimization"
                value={profitabilityData[1].value}
                icon={<TrendingDown className="w-5 h-5 text-yellow-600" />}
                tooltipContent="Number of services requiring optimization"
              />
            </div>

            {/* Profitability Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Service Performance</h2>
                <ServiceGrid
                  services={services.filter(service => 
                    searchQuery ? 
                      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      service.category.toLowerCase().includes(searchQuery.toLowerCase())
                    : true
                  )}
                  selectedServiceId={selectedServiceId}
                  onServiceSelect={handleServiceSelect}
                />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Profitability Distribution</h2>
                <ProfitabilityPieChart data={profitabilityData} height={300} />
              </div>
            </div>
          </main>
        </div>
        <ChatBox />
      </PageLayout>
    </ThemeProvider>
  );
}

export default App;
