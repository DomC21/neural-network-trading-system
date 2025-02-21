import { Card } from "../ui/card"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../ui/tooltip"
import { fundamentalMetrics } from "@/lib/metrics"
import { cn } from "@/lib/utils"

interface FundamentalAnalysisProps {
  data: {
    company_name: string
    sector: string
    industry: string
    market_cap: number
    pe_ratio: number
    forward_pe: number
    peg_ratio: number | null
    price_to_book: number
    debt_to_equity: number
    profit_margins: number
    revenue_growth: number
    earnings_growth: number
    recommendation: string
    target_price: number
  }
}

export function FundamentalAnalysis({ data }: FundamentalAnalysisProps) {
  return (
    <Card className={cn("p-6 bg-zinc-900", "border-gold")}>
      <h2 className={cn("text-xl font-semibold mb-4", "text-gold")}>Fundamental Analysis</h2>
      
      <TooltipProvider>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <p className="text-gray-400">Company</p>
            <p className="text-lg font-semibold text-white">{data.company_name}</p>
            <p className="text-sm text-gray-400">{data.sector} | {data.industry}</p>
          </div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                <p className="text-gray-400">Market Cap</p>
                <p className="text-lg font-semibold text-white">
                  ${(data.market_cap / 1e9).toFixed(2)}B
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent className={cn("max-w-sm bg-zinc-900", "border-gold")}>
              <h3 className={cn("font-semibold", "text-gold")}>{fundamentalMetrics.market_cap.name}</h3>
              <p className="text-sm text-white">{fundamentalMetrics.market_cap.description}</p>
              <p className="text-sm text-gray-400 mt-1">{fundamentalMetrics.market_cap.getContext(data.market_cap)}</p>
            </TooltipContent>
          </Tooltip>
          
          <div>
            <p className="text-gray-400">Target Price</p>
            <p className="text-lg font-semibold text-white">
              ${data.target_price.toFixed(2)}
            </p>
          </div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                <p className="text-gray-400">P/E Ratio</p>
                <p className="text-lg font-semibold text-white">{data.pe_ratio.toFixed(2)}</p>
                <p className="text-sm text-gray-400">Forward: {data.forward_pe.toFixed(2)}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent className={cn("max-w-sm bg-zinc-900", "border-gold")}>
              <h3 className={cn("font-semibold", "text-gold")}>{fundamentalMetrics.pe_ratio.name}</h3>
              <p className="text-sm text-white">{fundamentalMetrics.pe_ratio.description}</p>
              <p className="text-sm text-gray-400 mt-1">{fundamentalMetrics.pe_ratio.getContext(data.pe_ratio)}</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                <p className="text-gray-400">Growth Metrics</p>
                <p className="text-lg font-semibold text-white">
                  Revenue: {(data.revenue_growth * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-400">
                  Earnings: {(data.earnings_growth * 100).toFixed(1)}%
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent className={cn("max-w-sm bg-zinc-900", "border-gold")}>
              <div className="space-y-2">
                <div>
                  <h3 className={cn("font-semibold", "text-gold")}>{fundamentalMetrics.revenue_growth.name}</h3>
                  <p className="text-sm text-white">{fundamentalMetrics.revenue_growth.description}</p>
                  <p className="text-sm text-gray-400">{fundamentalMetrics.revenue_growth.getContext(data.revenue_growth)}</p>
                </div>
                <div>
                  <h3 className={cn("font-semibold", "text-gold")}>{fundamentalMetrics.earnings_growth.name}</h3>
                  <p className="text-sm text-white">{fundamentalMetrics.earnings_growth.description}</p>
                  <p className="text-sm text-gray-400">{fundamentalMetrics.earnings_growth.getContext(data.earnings_growth)}</p>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
          
          <div>
            <p className="text-gray-400">Recommendation</p>
            <p className="text-lg font-semibold text-white capitalize">{data.recommendation}</p>
          </div>
        </div>
      </TooltipProvider>
    </Card>
  )
}
