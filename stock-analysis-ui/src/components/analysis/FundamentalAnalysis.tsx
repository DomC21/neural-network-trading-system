import { Card } from "../ui/card"

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
    <Card className="p-6 bg-zinc-900 border-gold">
      <h2 className="text-xl font-semibold text-gold mb-4">Fundamental Analysis</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div>
          <p className="text-gray-400">Company</p>
          <p className="text-lg font-semibold text-white">{data.company_name}</p>
          <p className="text-sm text-gray-400">{data.sector} | {data.industry}</p>
        </div>
        
        <div>
          <p className="text-gray-400">Market Cap</p>
          <p className="text-lg font-semibold text-white">
            ${(data.market_cap / 1e9).toFixed(2)}B
          </p>
        </div>
        
        <div>
          <p className="text-gray-400">Target Price</p>
          <p className="text-lg font-semibold text-white">
            ${data.target_price.toFixed(2)}
          </p>
        </div>
        
        <div>
          <p className="text-gray-400">P/E Ratio</p>
          <p className="text-lg font-semibold text-white">{data.pe_ratio.toFixed(2)}</p>
          <p className="text-sm text-gray-400">Forward: {data.forward_pe.toFixed(2)}</p>
        </div>
        
        <div>
          <p className="text-gray-400">Growth Metrics</p>
          <p className="text-lg font-semibold text-white">
            Revenue: {(data.revenue_growth * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-400">
            Earnings: {(data.earnings_growth * 100).toFixed(1)}%
          </p>
        </div>
        
        <div>
          <p className="text-gray-400">Recommendation</p>
          <p className="text-lg font-semibold text-white capitalize">{data.recommendation}</p>
        </div>
      </div>
    </Card>
  )
}
