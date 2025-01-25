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

export interface ServiceClassification {
  service_id: string;
  category: string;
  confidence_score: number;
  optimization_suggestions: string[];
  market_insights: {
    market_position: string;
    scaling_recommended: boolean;
    discontinuation_recommended: boolean;
    revenue_per_use: number;
    profit_trend: string;
  };
}

export interface TooltipProps {
  children: React.ReactNode;
  content: string;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
