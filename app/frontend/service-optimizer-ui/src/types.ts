export interface ServiceCosts {
  fixed_costs: number;
  variable_costs: number;
}

export interface ServiceMetrics {
  revenue: number;
  usage_count: number;
  profit_margin: number;
}

export interface ServiceResources {
  equipment_required: string[];
  contractor_count: number;
}

export interface ServicePerformance {
  monthly_profits: number[];
  seasonal_trends: Record<string, number>;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  costs: ServiceCosts;
  metrics: ServiceMetrics;
  resources: ServiceResources;
  performance: ServicePerformance;
}

export interface SimulationParams {
  newFixedCosts: number;
  newVariableCosts: number;
  newRevenue: number;
  newUsageCount: number;
}

export interface FilterThresholds {
  profitableMin: number;
  optimizationMin: number;
  unprofitableMax: number;
}

export interface ServiceResponse {
  id: string;
  name: string;
  description: string;
  category: string;
  metrics: ServiceMetrics;
  performance: ServicePerformance;
}
