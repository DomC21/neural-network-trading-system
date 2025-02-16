
import { Card } from "../ui/card"
import { Alert, AlertDescription } from "../ui/alert"
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"

interface RiskAssessmentProps {
  technicalData: {
    rsi: number
    price: number
    sma_200: number
  }
  fundamentalData: {
    debt_to_equity: number
    profit_margins: number
  }
}

export const RiskAssessment = ({ technicalData, fundamentalData }: RiskAssessmentProps) => {
  const isOverbought = technicalData.rsi > 70
  const isOvervalued = technicalData.price > technicalData.sma_200 * 1.2
  const highDebt = fundamentalData.debt_to_equity > 200
  const lowMargins = fundamentalData.profit_margins < 0.1

  return (
    <Card className="p-6 bg-zinc-900 border-gold">
      <h2 className="text-xl font-semibold text-gold mb-4">Risk & Opportunity Assessment</h2>
      
      <div className="space-y-4">
        {isOverbought && (
          <Alert variant="destructive" className="bg-red-900/50 border-red-500">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              RSI indicates overbought conditions ({technicalData.rsi.toFixed(1)})
            </AlertDescription>
          </Alert>
        )}
        
        {isOvervalued && (
          <Alert variant="destructive" className="bg-red-900/50 border-red-500">
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              Price significantly above 200-day moving average
            </AlertDescription>
          </Alert>
        )}
        
        {highDebt && (
          <Alert variant="destructive" className="bg-red-900/50 border-red-500">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              High debt-to-equity ratio ({fundamentalData.debt_to_equity.toFixed(1)}%)
            </AlertDescription>
          </Alert>
        )}
        
        {lowMargins && (
          <Alert variant="destructive" className="bg-red-900/50 border-red-500">
            <TrendingDown className="h-4 w-4" />
            <AlertDescription>
              Low profit margins ({(fundamentalData.profit_margins * 100).toFixed(1)}%)
            </AlertDescription>
          </Alert>
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
    </Card>
  )
}
