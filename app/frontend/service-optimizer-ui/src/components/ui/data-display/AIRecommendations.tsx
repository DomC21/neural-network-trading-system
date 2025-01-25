import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../base/Card';
import { Button } from '../base/Button';
import { TrendingUp, AlertCircle, BarChart } from 'lucide-react';

interface AIRecommendationsProps {
  analysis: {
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
  };
}

export function AIRecommendations({ analysis }: AIRecommendationsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">AI Insights & Recommendations</CardTitle>
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            analysis.category === 'Profitable' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
            analysis.category === 'Optimization' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' :
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
          }`}>
            {analysis.market_insights.market_position} Position
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start space-x-4"
        >
          <div className="p-2 rounded bg-muted">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium">Performance Analysis</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Confidence Score: {(analysis.confidence_score * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-muted-foreground">
              Profit Trend: {analysis.market_insights.profit_trend}
            </p>
          </div>
        </motion.div>

        {/* Market Position */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-start space-x-4"
        >
          <div className="p-2 rounded bg-muted">
            <BarChart className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium">Market Position</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Revenue per use: ${analysis.market_insights.revenue_per_use.toFixed(0)}
            </p>
            {analysis.market_insights.scaling_recommended && (
              <p className="text-sm text-green-600 mt-1">
                ✓ Recommended for scaling
              </p>
            )}
            {analysis.market_insights.discontinuation_recommended && (
              <p className="text-sm text-red-600 mt-1">
                ⚠ Consider discontinuation
              </p>
            )}
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-start space-x-4"
        >
          <div className="p-2 rounded bg-muted">
            <AlertCircle className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium">Key Recommendations</h3>
            <ul className="mt-2 space-y-2">
              {analysis.optimization_suggestions.map((suggestion, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start space-x-2"
                >
                  <span className="text-primary">•</span>
                  <span className="text-sm text-muted-foreground">{suggestion}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" size="sm">
            Export Analysis
          </Button>
          <Button size="sm">
            Apply Recommendations
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
