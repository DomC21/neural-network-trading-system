import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, TrendingUp, TrendingDown, AlertCircle, DollarSign, Users, Package } from 'lucide-react';
import { ServiceResponse, FilterThresholds, SimulationParams } from './types';
import { analyzeService } from './api';

// Core MSS services with fixed categories
const getCoreServices = (): ServiceResponse[] => {
  const highPerformanceServices = [
    {
      name: 'Fine Art Packaging',
      description: 'Industry-specific packing materials and methods for securing precious works of art',
      profitMargin: 45.5
    },
    {
      name: 'Precision Packaging & Crating',
      description: 'Expert crating and packaging for high-value items and delicate equipment',
      profitMargin: 42.0
    },
    {
      name: 'Pure Install',
      description: 'Professional installation services for complex equipment and systems',
      profitMargin: 41.2
    }
  ];

  const optimizationServices = [
    {
      name: 'Chandelier Services',
      description: 'Expert removal, crating, and reinstallation of chandeliers and light fixtures',
      profitMargin: 35.0
    },
    {
      name: 'Exercise Equipment Services',
      description: 'Professional disassembly and reassembly of home and commercial exercise equipment',
      profitMargin: 32.5
    },
    {
      name: 'Gaming Table Services',
      description: 'Expert handling of pool tables, air hockey, and other gaming equipment',
      profitMargin: 28.6
    }
  ];

  const underReviewServices = [
    {
      name: 'Outdoor Play Equipment',
      description: 'Disassembly and reassembly of forts, swing sets, and trampolines',
      profitMargin: 15.4
    },
    {
      name: 'Basic Appliance Service',
      description: 'Basic appliance disconnection and reconnection',
      profitMargin: 13.3
    },
    {
      name: 'Clock Services',
      description: 'Basic clock removal and reinstallation services',
      profitMargin: 10.2
    }
  ];

  const createServiceResponse = (service: any, index: number, category: string): ServiceResponse => ({
    id: `core-${category.toLowerCase()}-${index + 1}`,
    name: service.name,
    description: service.description,
    category,
    metrics: {
      revenue: 25000 + Math.random() * 75000,
      usage_count: Math.floor(Math.random() * 50) + 20,
      profit_margin: service.profitMargin
    },
    performance: {
      monthly_profits: Array.from({ length: 12 }, () => 
        Math.random() * 50000 * (service.profitMargin / 40)
      ),
      seasonal_trends: {
        winter: 0.8 + Math.random() * 0.4,
        spring: 0.8 + Math.random() * 0.4,
        summer: 0.8 + Math.random() * 0.4,
        fall: 0.8 + Math.random() * 0.4
      }
    }
  });

  return [
    ...highPerformanceServices.map((s, i) => createServiceResponse(s, i, 'Profitable')),
    ...optimizationServices.map((s, i) => createServiceResponse(s, i, 'Optimization')),
    ...underReviewServices.map((s, i) => createServiceResponse(s, i, 'Unprofitable'))
  ];
};

function App() {
  const [services, setServices] = React.useState<ServiceResponse[]>(() => getCoreServices());
  const [selectedService, setSelectedService] = React.useState<ServiceResponse | null>(null);
  const [aiAnalysis, setAiAnalysis] = React.useState<any>(null);
  const [simulationParams, setSimulationParams] = React.useState<SimulationParams>({
    newFixedCosts: 0,
    newVariableCosts: 0,
    newRevenue: 0,
    newUsageCount: 0
  });
  const [filterThresholds, setFilterThresholds] = React.useState<FilterThresholds>({
    profitableMin: 40,
    optimizationMin: 20,
    unprofitableMax: 20
  });

  // Update service categories when thresholds change
  React.useEffect(() => {
    // Force re-render of service cards when thresholds change
    const updatedServices = services.map(service => ({
      ...service,
      category: service.metrics.profit_margin >= filterThresholds.profitableMin
        ? 'Profitable'
        : service.metrics.profit_margin >= filterThresholds.optimizationMin
        ? 'Optimization'
        : 'Unprofitable'
    }));
    setServices(updatedServices);
  }, [filterThresholds]);

  // Calculate overview statistics
  const stats = React.useMemo(() => {
    const totalRevenue = services.reduce((sum, s) => sum + s.metrics.revenue, 0);
    const avgProfitMargin = services.reduce((sum, s) => sum + s.metrics.profit_margin, 0) / services.length;
    const categoryCount = services.reduce((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRevenue,
      avgProfitMargin,
      categoryCount,
      totalServices: services.length
    };
  }, [services]);

  const filterServices = (category: string): ServiceResponse[] => {
    if (category === 'all') return services;
    
    return services.filter(service => {
      const margin = service.metrics.profit_margin;
      switch (category) {
        case 'Profitable':
          return margin >= filterThresholds.profitableMin;
        case 'Optimization':
          return margin >= filterThresholds.optimizationMin && margin < filterThresholds.profitableMin;
        case 'Unprofitable':
          return margin < filterThresholds.optimizationMin;
        default:
          return false;
      }
    });
  };

  const getCategoryIcon = (category: string): JSX.Element => {
    switch (category) {
      case 'Profitable':
        return <TrendingUp className="text-green-500" />;
      case 'Optimization':
        return <AlertCircle className="text-yellow-500" />;
      case 'Unprofitable':
        return <TrendingDown className="text-red-500" />;
      default:
        return <BarChart />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-[#2B2B2B] text-white py-2 px-4">
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center space-x-6">
            <span>800.433.1159 | M-F 8am-8pm EST</span>
            <span className="text-gray-400">211 Commerce Drive | Montgomeryville PA 18936</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-400">We're social!</span>
            <div className="flex space-x-4">
              <a href="https://www.linkedin.com/company/689014" className="hover:text-[#45B6B0] transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
              </a>
              <a href="https://www.facebook.com/trusttheexperience" className="hover:text-[#45B6B0] transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/mss.inc" className="hover:text-[#45B6B0] transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Navigation */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <a href="/" className="flex items-center">
              <img src="/MSSLogoColorRetina.png" alt="MSS Logo" className="h-12" />
            </a>
            <div className="hidden md:flex space-x-8">
              <a href="#" className="text-[#2B2B2B] hover:text-[#45B6B0] font-medium transition-colors">Relocation Support</a>
              <a href="#" className="text-[#2B2B2B] hover:text-[#45B6B0] font-medium transition-colors">Precision Packaging & Crating</a>
              <a href="#" className="text-[#2B2B2B] hover:text-[#45B6B0] font-medium transition-colors">Pure Install</a>
              <a href="#" className="text-[#2B2B2B] hover:text-[#45B6B0] font-medium transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Overview Stats */}
      <div className="bg-white border-b">
        <div className="container mx-auto py-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-2">
                <DollarSign className="text-[#45B6B0]" />
                <h3 className="text-lg font-semibold">Total Revenue</h3>
              </div>
              <p className="text-2xl font-bold mt-2">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-2">
                <TrendingUp className="text-[#45B6B0]" />
                <h3 className="text-lg font-semibold">Avg Profit Margin</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{stats.avgProfitMargin.toFixed(1)}%</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-2">
                <Package className="text-[#45B6B0]" />
                <h3 className="text-lg font-semibold">Total Services</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{stats.totalServices}</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-2">
                <Users className="text-[#45B6B0]" />
                <h3 className="text-lg font-semibold">Category Distribution</h3>
              </div>
              <div className="mt-2">
                <PieChart width={100} height={100}>
                  <Pie
                    data={Object.entries(stats.categoryCount).map(([name, value]) => ({ name, value }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={40}
                  >
                    {Object.entries(stats.categoryCount).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={['#4CAF50', '#FFC107', '#F44336'][index]} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto p-4">
        {/* Overview Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-[#2B2B2B]">
                  ${services.reduce((sum, s) => sum + s.metrics.revenue, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-[#45B6B0]/10 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-[#45B6B0]" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Profit Margin</p>
                <p className="text-2xl font-bold text-[#2B2B2B]">
                  {(services.reduce((sum, s) => sum + s.metrics.profit_margin, 0) / services.length).toFixed(1)}%
                </p>
              </div>
              <div className="bg-[#45B6B0]/10 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-[#45B6B0]" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Services</p>
                <p className="text-2xl font-bold text-[#2B2B2B]">{services.length}</p>
              </div>
              <div className="bg-[#45B6B0]/10 p-3 rounded-full">
                <Package className="w-6 h-6 text-[#45B6B0]" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Contractors</p>
                <p className="text-2xl font-bold text-[#2B2B2B]">
                  {services.length * 3} {/* Average 3 contractors per service */}
                </p>
              </div>
              <div className="bg-[#45B6B0]/10 p-3 rounded-full">
                <Users className="w-6 h-6 text-[#45B6B0]" />
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="bg-[#45B6B0] p-1 rounded-lg">
            <TabsTrigger value="all" className="text-white hover:bg-white/10">All Services</TabsTrigger>
            <TabsTrigger value="Profitable" className="text-white hover:bg-white/10">High Performance</TabsTrigger>
            <TabsTrigger value="Optimization" className="text-white hover:bg-white/10">Optimization Needed</TabsTrigger>
            <TabsTrigger value="Unprofitable" className="text-white hover:bg-white/10">Under Review</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterServices('all').map((service) => (
                <Card key={service.id} className="overflow-hidden border-t-4 border-t-[#45B6B0]">
                  <CardHeader className="border-b border-gray-100 bg-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold text-[#2B2B2B]">{service.name}</CardTitle>
                        <CardDescription className="text-gray-600 mt-1">{service.description}</CardDescription>
                      </div>
                      <div className={`p-2 rounded-full ${
                        service.category === 'Profitable' ? 'bg-green-100 text-green-600' :
                        service.category === 'Optimization' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {getCategoryIcon(service.category)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* Key Metrics */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Profit Margin</p>
                          <p className="text-2xl font-bold text-[#2B2B2B]">{service.metrics.profit_margin.toFixed(1)}%</p>
                          <p className={`text-xs mt-1 ${
                            service.metrics.profit_margin > 40 ? 'text-green-600' :
                            service.metrics.profit_margin > 20 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {service.metrics.profit_margin > 40 ? 'High Performance' :
                             service.metrics.profit_margin > 20 ? 'Needs Optimization' :
                             'Under Review'}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Revenue</p>
                          <p className="text-2xl font-bold text-[#2B2B2B]">
                            ${service.metrics.revenue.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            ${(service.metrics.revenue / service.metrics.usage_count).toFixed(0)} per use
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Usage Count</p>
                          <p className="text-2xl font-bold text-[#2B2B2B]">{service.metrics.usage_count}</p>
                          <p className="text-xs text-gray-500 mt-1">Last 12 months</p>
                        </div>
                      </div>

                      {/* Performance Chart */}
                      <div className="bg-white rounded-lg p-4 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-gray-600">Monthly Performance</h4>
                          <div className="flex items-center space-x-2 text-sm">
                            <span className={`flex items-center ${
                              service.performance.monthly_profits[11] > service.performance.monthly_profits[0]
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}>
                              {service.performance.monthly_profits[11] > service.performance.monthly_profits[0]
                                ? <TrendingUp className="w-4 h-4 mr-1" />
                                : <TrendingDown className="w-4 h-4 mr-1" />
                              }
                              {Math.abs(((service.performance.monthly_profits[11] - service.performance.monthly_profits[0]) /
                                service.performance.monthly_profits[0]) * 100).toFixed(1)}% YoY
                            </span>
                          </div>
                        </div>
                        <LineChart
                          width={300}
                          height={200}
                          data={service.performance.monthly_profits.map((profit, index) => ({
                            month: index + 1,
                            profit
                          }))}
                          margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                          <XAxis 
                            dataKey="month" 
                            stroke="#666"
                            tickFormatter={(value) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][value - 1]}
                          />
                          <YAxis 
                            stroke="#666"
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                          />
                          <Tooltip 
                            formatter={(value: any) => [`$${parseInt(value).toLocaleString()}`, 'Profit']}
                            labelFormatter={(label: any) => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][label - 1]}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="profit" 
                            stroke="#45B6B0" 
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </div>

                      {/* Seasonal Performance */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-600 mb-4">Seasonal Performance</h4>
                        <div className="grid grid-cols-4 gap-2">
                          {Object.entries(service.performance.seasonal_trends).map(([season, trend]) => (
                            <div 
                              key={season}
                              className={`text-center p-3 rounded ${
                                trend > 1.1 ? 'bg-green-100 text-green-800' :
                                trend < 0.9 ? 'bg-red-100 text-red-800' :
                                'bg-white text-gray-800 border border-gray-200'
                              }`}
                            >
                              <p className="text-xs font-medium capitalize mb-1">{season}</p>
                              <p className="text-sm font-bold">{((trend - 1) * 100).toFixed(1)}%</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Service Simulation */}
                      {selectedService?.id === service.id && (
                        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-semibold text-[#2B2B2B]">Service Simulation</h4>
                            <div className="text-xs text-gray-500">Adjust values to see impact</div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm text-gray-600 block mb-2">New Revenue</label>
                              <input
                                type="number"
                                className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#45B6B0] focus:border-transparent"
                                value={simulationParams.newRevenue}
                                onChange={(e) => setSimulationParams({
                                  ...simulationParams,
                                  newRevenue: parseFloat(e.target.value)
                                })}
                              />
                            </div>
                            <div>
                              <label className="text-sm text-gray-600 block mb-2">New Usage Count</label>
                              <input
                                type="number"
                                className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#45B6B0] focus:border-transparent"
                                value={simulationParams.newUsageCount}
                                onChange={(e) => setSimulationParams({
                                  ...simulationParams,
                                  newUsageCount: parseInt(e.target.value)
                                })}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* AI Recommendations */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold text-[#2B2B2B]">AI Insights & Recommendations</h4>
                          {selectedService?.id === service.id && aiAnalysis ? (
                            <div className={`px-2 py-1 rounded text-xs font-medium ${
                              aiAnalysis.category === 'Profitable' ? 'bg-green-100 text-green-800' :
                              aiAnalysis.category === 'Optimization' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {aiAnalysis.market_insights.market_position} Position
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500">Select to analyze</div>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          {selectedService?.id === service.id && aiAnalysis ? (
                            <>
                              {/* Performance Analysis */}
                              <div className="flex items-start space-x-3">
                                <div className="bg-gray-50 p-2 rounded">
                                  <TrendingUp className="w-4 h-4 text-[#45B6B0]" />
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium text-gray-900">Performance Analysis</h5>
                                  <p className="text-sm text-gray-600">
                                    Confidence Score: {(aiAnalysis.confidence_score * 100).toFixed(1)}%
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Profit Trend: {aiAnalysis.market_insights.profit_trend}
                                  </p>
                                </div>
                              </div>

                              {/* Market Position */}
                              <div className="flex items-start space-x-3">
                                <div className="bg-gray-50 p-2 rounded">
                                  <BarChart className="w-4 h-4 text-[#45B6B0]" />
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium text-gray-900">Market Position</h5>
                                  <p className="text-sm text-gray-600">
                                    Revenue per use: ${aiAnalysis.market_insights.revenue_per_use.toFixed(0)}
                                  </p>
                                  {aiAnalysis.market_insights.scaling_recommended && (
                                    <p className="text-sm text-green-600 mt-1">
                                      ✓ Recommended for scaling
                                    </p>
                                  )}
                                  {aiAnalysis.market_insights.discontinuation_recommended && (
                                    <p className="text-sm text-red-600 mt-1">
                                      ⚠ Consider discontinuation
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Key Recommendations */}
                              <div className="flex items-start space-x-3">
                                <div className="bg-gray-50 p-2 rounded">
                                  <AlertCircle className="w-4 h-4 text-[#45B6B0]" />
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium text-gray-900">Key Recommendations</h5>
                                  <ul className="mt-1 space-y-1">
                                    {aiAnalysis.optimization_suggestions.map((suggestion: string, index: number) => (
                                      <li key={index} className="text-sm text-gray-600">
                                        {suggestion}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-6 text-gray-500">
                              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                              <p>Select "Analyze Service" to view AI recommendations</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          const newSelected = selectedService?.id === service.id ? null : service;
                          setSelectedService(newSelected);
                          if (newSelected) {
                            try {
                              const analysis = await analyzeService(newSelected);
                              setAiAnalysis(analysis);
                            } catch (err) {
                              console.error('Failed to analyze service:', err);
                              setAiAnalysis(null);
                            }
                          } else {
                            setAiAnalysis(null);
                          }
                        }}
                        className="w-full py-2 bg-[#45B6B0] text-white rounded-md hover:bg-[#3a9a95] transition-colors flex items-center justify-center space-x-2"
                      >
                        {selectedService?.id === service.id ? (
                          <>
                            <span>Close Simulation</span>
                          </>
                        ) : (
                          <>
                            <BarChart className="w-4 h-4" />
                            <span>Analyze Service</span>
                          </>
                        )}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="Profitable" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterServices('Profitable').map((service) => (
                <Card key={service.id} className="overflow-hidden border-t-4 border-t-[#45B6B0]">
                  <CardHeader className="border-b border-gray-100 bg-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold text-[#2B2B2B]">{service.name}</CardTitle>
                        <CardDescription className="text-gray-600 mt-1">{service.description}</CardDescription>
                      </div>
                      <div className={`p-2 rounded-full ${
                        service.category === 'Profitable' ? 'bg-green-100 text-green-600' :
                        service.category === 'Optimization' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {getCategoryIcon(service.category)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Content remains the same */}
                    <div className="space-y-6">
                      {/* ... existing content ... */}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="Optimization" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterServices('Optimization').map((service) => (
                <Card key={service.id} className="overflow-hidden border-t-4 border-t-[#45B6B0]">
                  <CardHeader className="border-b border-gray-100 bg-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold text-[#2B2B2B]">{service.name}</CardTitle>
                        <CardDescription className="text-gray-600 mt-1">{service.description}</CardDescription>
                      </div>
                      <div className={`p-2 rounded-full ${
                        service.category === 'Profitable' ? 'bg-green-100 text-green-600' :
                        service.category === 'Optimization' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {getCategoryIcon(service.category)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Content remains the same */}
                    <div className="space-y-6">
                      {/* ... existing content ... */}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="Unprofitable" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterServices('Unprofitable').map((service) => (
                <Card key={service.id} className="overflow-hidden border-t-4 border-t-[#45B6B0]">
                  <CardHeader className="border-b border-gray-100 bg-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold text-[#2B2B2B]">{service.name}</CardTitle>
                        <CardDescription className="text-gray-600 mt-1">{service.description}</CardDescription>
                      </div>
                      <div className={`p-2 rounded-full ${
                        service.category === 'Profitable' ? 'bg-green-100 text-green-600' :
                        service.category === 'Optimization' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {getCategoryIcon(service.category)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Content remains the same */}
                    <div className="space-y-6">
                      {/* ... existing content ... */}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Performance Settings & Recommendations */}
        <div className="mt-8 grid grid-cols-2 gap-8">
          {/* Thresholds Panel */}
          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex items-center mb-6">
              <div className="w-1 h-6 bg-[#45B6B0] rounded-full mr-3"></div>
              <h2 className="text-xl font-bold text-[#2B2B2B]">Performance Thresholds</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">High Performance Minimum (%)</label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#45B6B0] focus:border-transparent"
                  value={filterThresholds.profitableMin}
                  onChange={(e) => setFilterThresholds({
                    ...filterThresholds,
                    profitableMin: parseFloat(e.target.value)
                  })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Optimization Threshold (%)</label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#45B6B0] focus:border-transparent"
                  value={filterThresholds.optimizationMin}
                  onChange={(e) => setFilterThresholds({
                    ...filterThresholds,
                    optimizationMin: parseFloat(e.target.value)
                  })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Review Threshold (%)</label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#45B6B0] focus:border-transparent"
                  value={filterThresholds.unprofitableMax}
                  onChange={(e) => setFilterThresholds({
                    ...filterThresholds,
                    unprofitableMax: parseFloat(e.target.value)
                  })}
                />
              </div>
            </div>
          </div>

          {/* Recommendations Panel */}
          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex items-center mb-6">
              <div className="w-1 h-6 bg-[#45B6B0] rounded-full mr-3"></div>
              <h2 className="text-xl font-bold text-[#2B2B2B]">AI Recommendations</h2>
            </div>
            <div className="space-y-4">
              {selectedService ? (
                <>
                  <div className="p-4 rounded-lg bg-gray-50">
                    <h3 className="font-semibold mb-2">{selectedService.name}</h3>
                    <div className="space-y-2">
                      <p className="text-sm">
                        Current Performance: 
                        <span className={`ml-2 font-semibold ${
                          selectedService.metrics.profit_margin > filterThresholds.profitableMin ? 'text-green-600' :
                          selectedService.metrics.profit_margin > filterThresholds.optimizationMin ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {selectedService.metrics.profit_margin.toFixed(1)}% margin
                        </span>
                      </p>
                      <p className="text-sm">
                        Revenue per Use: 
                        <span className="ml-2 font-semibold">
                          ${(selectedService.metrics.revenue / selectedService.metrics.usage_count).toFixed(2)}
                        </span>
                      </p>
                      <p className="text-sm">
                        Seasonal Strength: 
                        <span className="ml-2 font-semibold">
                          {Object.entries(selectedService.performance.seasonal_trends)
                            .sort((a, b) => b[1] - a[1])[0][0]}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Optimization Suggestions:</h4>
                    <ul className="space-y-2">
                      {aiAnalysis ? (
                        aiAnalysis.optimization_suggestions.map((suggestion: string, index: number) => (
                          <li key={index} className="text-sm flex items-center text-gray-700">
                            {suggestion.includes('Consider discontinuation') ? (
                              <TrendingDown className="w-4 h-4 mr-2 text-red-600" />
                            ) : suggestion.includes('Recommended for scaling') ? (
                              <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                            ) : (
                              <AlertCircle className="w-4 h-4 mr-2 text-yellow-600" />
                            )}
                            {suggestion}
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-gray-500">Loading recommendations...</li>
                      )}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Select a service to view AI-driven recommendations
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Contact Section */}
      <section className="bg-[#2B2B2B] text-white py-16 mt-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">HOW CAN WE HELP?</h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <h5 className="font-semibold mb-4">Household Goods & Crating</h5>
                <a href="tel:+1-800-433-1159" className="text-[#45B6B0] hover:text-[#3a9a95] transition-colors">
                  800.433.1159
                </a>
              </div>
              <div className="text-center">
                <h5 className="font-semibold mb-4">Installation & Assembly</h5>
                <a href="tel:+1-866-902-7768" className="text-[#45B6B0] hover:text-[#3a9a95] transition-colors">
                  866.902.7768
                </a>
              </div>
              <div className="text-center">
                <h5 className="font-semibold mb-4">Precision Crating</h5>
                <a href="tel:+1-877-822-0326" className="text-[#45B6B0] hover:text-[#3a9a95] transition-colors">
                  877.822.0326
                </a>
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl mb-8">Contact our team about your specialty service needs.</h3>
              <a 
                href="https://mss1.com/contact" 
                className="bg-[#45B6B0] text-white px-8 py-3 rounded-md hover:bg-[#3a9a95] transition-colors duration-200 inline-block"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2B2B2B] text-white py-12 border-t border-gray-700">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h5 className="font-semibold mb-4">Address</h5>
              <p className="text-gray-400">
                211 Commerce Drive<br />
                Montgomeryville, PA 18936
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Hours of Operation</h5>
              <p className="text-gray-400">
                Monday - Friday<br />
                8:00 AM - 8:00 PM EST
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Connect With Us</h5>
              <div className="flex space-x-4">
                <a href="https://www.linkedin.com/company/689014" className="text-gray-400 hover:text-[#45B6B0] transition-colors">
                  LinkedIn
                </a>
                <a href="https://www.facebook.com/trusttheexperience" className="text-gray-400 hover:text-[#45B6B0] transition-colors">
                  Facebook
                </a>
                <a href="https://www.instagram.com/mss.inc" className="text-gray-400 hover:text-[#45B6B0] transition-colors">
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
