import { Card } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../ui/tooltip";

interface RiskAssessmentProps {
  technicalData?: {
    rsi: number;
    price: number;
    sma_200: number;
  };
  fundamentalData?: {
    debt_to_equity: number;
    profit_margins: number;
  };
}

export function RiskAssessment({ technicalData, fundamentalData }: RiskAssessmentProps) {
  if (!technicalData || !fundamentalData) return null

  const { rsi = 0, price = 0, sma_200 = 0 } = technicalData
  const { debt_to_equity = 0, profit_margins = 0 } = fundamentalData

  const isOverbought = rsi > 70
  const isOvervalued = price > sma_200 * 1.2
  const highDebt = debt_to_equity > 200
  const lowMargins = profit_margins < 0.1

  return (
    <Card className="p-6 bg-zinc-900 border-gold">
      <h2 className="text-xl font-semibold text-gold mb-4">Risk & Opportunity Assessment</h2>
      
      <TooltipProvider>
        <div className="space-y-4">
          {isOverbought && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Alert variant="destructive" className="bg-red-900/50 border-red-500 cursor-help">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    RSI indicates overbought conditions ({rsi.toFixed(1)})
                  </AlertDescription>
                </Alert>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm bg-zinc-900 border-gold">
                <h3 className="font-semibold text-gold">Relative Strength Index (RSI)</h3>
                <p className="text-sm text-white">Momentum indicator measuring the speed and magnitude of recent price changes.</p>
                <p className="text-sm text-gray-400 mt-1">Current value above 70 suggests potential reversal or consolidation.</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          {isOvervalued && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Alert variant="destructive" className="bg-red-900/50 border-red-500 cursor-help">
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    Price significantly above 200-day moving average
                  </AlertDescription>
                </Alert>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm bg-zinc-900 border-gold">
                <h3 className="font-semibold text-gold">200-Day Moving Average</h3>
                <p className="text-sm text-white">Long-term trend indicator showing average price over 200 trading days.</p>
                <p className="text-sm text-gray-400 mt-1">Price 20% above average suggests extended valuation.</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          {highDebt && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Alert variant="destructive" className="bg-red-900/50 border-red-500 cursor-help">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    High debt-to-equity ratio ({debt_to_equity.toFixed(1)}%)
                  </AlertDescription>
                </Alert>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm bg-zinc-900 border-gold">
                <h3 className="font-semibold text-gold">Debt-to-Equity Ratio</h3>
                <p className="text-sm text-white">Financial metric comparing total debt to shareholders' equity.</p>
                <p className="text-sm text-gray-400 mt-1">Ratio above 200% indicates high financial leverage and risk.</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          {lowMargins && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Alert variant="destructive" className="bg-red-900/50 border-red-500 cursor-help">
                  <TrendingDown className="h-4 w-4" />
                  <AlertDescription>
                    Low profit margins ({(profit_margins * 100).toFixed(1)}%)
                  </AlertDescription>
                </Alert>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm bg-zinc-900 border-gold">
                <h3 className="font-semibold text-gold">Profit Margins</h3>
                <p className="text-sm text-white">Percentage of revenue that translates into profit.</p>
                <p className="text-sm text-gray-400 mt-1">Margins below 10% suggest competitive pressures or operational inefficiencies.</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          {!isOverbought && !isOvervalued && !highDebt && !lowMargins && (
            <Alert className="bg-green-900/50 border-green-500">
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                No significant risk factors identified
              </AlertDescription>
            </Alert>
          )}
        </div>
      </TooltipProvider>
    </Card>
  )
}
