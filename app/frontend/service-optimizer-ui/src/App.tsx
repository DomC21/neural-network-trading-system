import { useState, useEffect } from 'react';
import { ThemeProvider } from './components/ui/theme/ThemeProvider';
import { Container, Section } from './components/ui/layout';
import { PageLayout } from './components/ui/layout/PageLayout';
import { Sidebar } from './components/ui/navigation/Sidebar';
import { ServiceGrid } from './components/ui/data-display/ServiceGrid';
import { MetricCard } from './components/ui/data-display/MetricCard';
import { PieChart } from './components/ui/charts';
import { ChatBox } from './components/chat/ChatBox';
import { AIRecommendations } from './components/ui/data-display/AIRecommendations';
import { ServiceSimulator } from './components/ui/data-display/ServiceSimulator';
import { Icons } from './components/ui/icons';
// Import removed
import { fetchServices, analyzeService } from './api';
import type { Service, ServiceClassification } from './types';
import { Button } from './components/ui/base';

function App() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<ServiceClassification | null>(null);
  const [, setIsLoading] = useState(true);
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
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-4xl font-bold text-foreground">Service Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Monitor and optimize service performance</p>
                  </div>
                  <img src="/mss_logo.svg" alt="MSS Logo" className="h-12" />
                </div>
              </Section>

              {/* Summary Metrics Section */}
              <Section title="Performance Overview">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="animate-fade-in">
                    <MetricCard
                      title="Total Revenue"
                      value={`$${totalRevenue.toLocaleString()}`}
                      icon={<Icons.DollarSign className="w-5 h-5 text-green-600" />}
                      trend={{ value: 12.5, isPositive: true }}
                    />
                  </div>
                  <div className="animate-fade-in">
                    <MetricCard
                      title="Average Margin"
                      value={`${averageMargin.toFixed(1)}%`}
                      icon={<Icons.TrendingUp className="w-5 h-5 text-blue-600" />}
                      trend={{ value: 2.3, isPositive: true }}
                    />
                  </div>
                  <div className="animate-fade-in">
                    <MetricCard
                      title="Total Usage"
                      value={totalUsage.toLocaleString()}
                      icon={<Icons.Users className="w-5 h-5 text-purple-600" />}
                      trend={{ value: 8.7, isPositive: true }}
                    />
                  </div>
                  <div className="animate-fade-in">
                    <MetricCard
                      title="Services Needing Optimization"
                      value={profitabilityData[1].value}
                      icon={<Icons.TrendingDown className="w-5 h-5 text-yellow-600" />}
                    />
                  </div>
                </div>
              </Section>

              {/* Main Content Section */}
              <Section title="Service Analysis">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded p-6 border">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">Service Performance</h2>
                        <Button variant="outline" size="sm">
                          <Icons.Search className="w-4 h-4 mr-2" />
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
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded p-6 border">
                      <h2 className="text-xl font-semibold mb-4">Profitability Distribution</h2>
                      <PieChart data={profitabilityData} height={300} />
                    </div>

                    {selectedServiceId && aiAnalysis && (
                      <div className="animate-fade-in">
                        <AIRecommendations analysis={aiAnalysis} />
                      </div>
                    )}

                    {selectedServiceId && (
                      <div className="animate-fade-in">
                        <ServiceSimulator
                          initialRevenue={services.find(s => s.id === selectedServiceId)?.metrics.revenue || 0}
                          initialUsage={services.find(s => s.id === selectedServiceId)?.metrics.usage_count || 0}
                          initialMargin={services.find(s => s.id === selectedServiceId)?.metrics.profit_margin || 0}
                          onSimulate={(params) => {
                            console.log('Simulation params:', params);
                            // TODO: Implement simulation logic
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Section>
            </Container>
          </main>
        </div>
        <ChatBox />
      </PageLayout>
    </ThemeProvider>
  );
}

export default App;
