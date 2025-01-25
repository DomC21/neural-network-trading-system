import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './components/ui/theme/ThemeProvider';
import { Container, Grid, Section } from './components/ui/layout';
import { PageLayout } from './components/ui/layout/PageLayout';
import { Sidebar } from './components/ui/navigation/Sidebar';
import { ServiceGrid } from './components/ui/data-display/ServiceGrid';
import { MetricCard } from './components/ui/data-display/MetricCard';
import { PieChart } from './components/ui/charts';
import { ChatBox } from './components/chat/ChatBox';
import { AIRecommendations } from './components/ui/data-display/AIRecommendations';
import { ServiceSimulator } from './components/ui/data-display/ServiceSimulator';
import { TrendingUp, TrendingDown, Users, DollarSign, Search } from 'lucide-react';
import { fetchServices, analyzeService } from './api';
import type { Service, ServiceClassification } from './types';
import { Button } from './components/ui/base';

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
            <Container>
              {/* Header Section */}
              <Section>
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between"
                >
                  <div>
                    <h1 className="text-4xl font-bold text-foreground">Service Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Monitor and optimize service performance</p>
                  </div>
                  <img src="/mss_logo.svg" alt="MSS Logo" className="h-12" />
                </motion.div>
              </Section>

              {/* Summary Metrics Section */}
              <Section title="Performance Overview">
                <Grid cols={4} gap={6}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <MetricCard
                      title="Total Revenue"
                      value={`$${totalRevenue.toLocaleString()}`}
                      icon={<DollarSign className="w-5 h-5 text-green-600" />}
                      trend={{ value: 12.5, isPositive: true }}
                      tooltipContent="Total revenue across all services"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <MetricCard
                      title="Average Margin"
                      value={`${averageMargin.toFixed(1)}%`}
                      icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
                      trend={{ value: 2.3, isPositive: true }}
                      tooltipContent="Average profit margin across all services"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <MetricCard
                      title="Total Usage"
                      value={totalUsage.toLocaleString()}
                      icon={<Users className="w-5 h-5 text-purple-600" />}
                      trend={{ value: 8.7, isPositive: true }}
                      tooltipContent="Total number of service usages"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <MetricCard
                      title="Services Needing Optimization"
                      value={profitabilityData[1].value}
                      icon={<TrendingDown className="w-5 h-5 text-yellow-600" />}
                      tooltipContent="Number of services requiring optimization"
                    />
                  </motion.div>
                </Grid>
              </Section>

              {/* Main Content Section */}
              <Section title="Service Analysis">
                <Grid cols={3} gap={6}>
                  <div className="col-span-2">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card rounded-lg p-6 border"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">Service Performance</h2>
                        <Button variant="outline" size="sm">
                          <Search className="w-4 h-4 mr-2" />
                          Filter Services
                        </Button>
                      </div>
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
                    </motion.div>
                  </div>
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-card rounded-lg p-6 border"
                    >
                      <h2 className="text-xl font-semibold mb-4">Profitability Distribution</h2>
                      <PieChart data={profitabilityData} height={300} />
                    </motion.div>

                    {selectedServiceId && aiAnalysis && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <AIRecommendations analysis={aiAnalysis} />
                      </motion.div>
                    )}

                    {selectedServiceId && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <ServiceSimulator
                          initialRevenue={services.find(s => s.id === selectedServiceId)?.metrics.revenue || 0}
                          initialUsage={services.find(s => s.id === selectedServiceId)?.metrics.usage_count || 0}
                          initialMargin={services.find(s => s.id === selectedServiceId)?.metrics.profit_margin || 0}
                          onSimulate={(params) => {
                            console.log('Simulation params:', params);
                            // TODO: Implement simulation logic
                          }}
                        />
                      </motion.div>
                    )}
                  </div>
                </Grid>
              </Section>
          </main>
        </div>
        <ChatBox />
      </PageLayout>
    </ThemeProvider>
  );
}

export default App;
