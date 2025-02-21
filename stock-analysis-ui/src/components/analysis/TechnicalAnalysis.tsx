import { Card } from "../ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../ui/tooltip"
import { technicalMetrics } from "@/lib/metrics"
import { cn } from "@/lib/utils"

interface TechnicalAnalysisProps {
  data: {
    price: number
    volume: number
    rsi: number
    macd: number
    macd_signal: number
    sma_20: number
    sma_50: number
    sma_200: number
    support: number
    resistance: number
    historical_data: any[]
  }
}

export function TechnicalAnalysis({ data }: TechnicalAnalysisProps) {
  return (
    <Card className={cn("p-6 bg-zinc-900", "border-gold")}>
      <h2 className={cn("text-xl font-semibold mb-4", "text-gold")}>Technical Analysis</h2>
      <TooltipProvider>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-400">Current Price</p>
            <p className="text-2xl font-bold text-white">${data.price.toFixed(2)}</p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                <p className="text-gray-400">Volume</p>
                <p className="text-2xl font-bold text-white">{data.volume.toLocaleString()}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent className={cn("max-w-sm bg-zinc-900", "border-gold")}>
              <h3 className={cn("font-semibold", "text-gold")}>{technicalMetrics.volume.name}</h3>
              <p className="text-sm text-white">{technicalMetrics.volume.description}</p>
              <p className="text-sm text-gray-400 mt-1">{technicalMetrics.volume.getContext(data.volume)}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                <p className="text-gray-400">RSI (14)</p>
                <p className={`text-xl font-bold ${technicalMetrics.rsi.getColor?.(data.rsi) ?? 'text-white'}`}>
                  {data.rsi.toFixed(2)}
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent className={cn("max-w-sm bg-zinc-900", "border-gold")}>
              <h3 className={cn("font-semibold", "text-gold")}>{technicalMetrics.rsi.name}</h3>
              <p className="text-sm text-white">{technicalMetrics.rsi.description}</p>
              <p className="text-sm text-gray-400 mt-1">{technicalMetrics.rsi.getContext(data.rsi)}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                <p className="text-gray-400">MACD</p>
                <p className="text-xl font-bold text-white">{data.macd.toFixed(2)}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent className={cn("max-w-sm bg-zinc-900", "border-gold")}>
              <h3 className={cn("font-semibold", "text-gold")}>{technicalMetrics.macd.name}</h3>
              <p className="text-sm text-white">{technicalMetrics.macd.description}</p>
              <p className="text-sm text-gray-400 mt-1">{technicalMetrics.macd.getContext(data.macd)}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
      
      <div className="h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.historical_data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" />
            <RechartsTooltip 
              contentStyle={{ backgroundColor: '#000', border: '1px solid #FFD700' }}
              labelStyle={{ color: '#FFD700' }}
            />
            <Line 
              type="monotone" 
              dataKey="Close" 
              stroke="#FFD700" 
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="sma_20" 
              stroke="#4CAF50" 
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">
              <p className="text-gray-400">Support Level</p>
              <p className="text-xl font-bold text-white">${data.support.toFixed(2)}</p>
            </div>
          </TooltipTrigger>
          <TooltipContent className={cn("max-w-sm bg-zinc-900", "border-gold")}>
            <h3 className={cn("font-semibold", "text-gold")}>{technicalMetrics.support.name}</h3>
            <p className="text-sm text-white">{technicalMetrics.support.description}</p>
            <p className="text-sm text-gray-400 mt-1">{technicalMetrics.support.getContext(data.support)}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">
              <p className="text-gray-400">Resistance Level</p>
              <p className="text-xl font-bold text-white">${data.resistance.toFixed(2)}</p>
            </div>
          </TooltipTrigger>
          <TooltipContent className={cn("max-w-sm bg-zinc-900", "border-gold")}>
            <h3 className={cn("font-semibold", "text-gold")}>{technicalMetrics.resistance.name}</h3>
            <p className="text-sm text-white">{technicalMetrics.resistance.description}</p>
            <p className="text-sm text-gray-400 mt-1">{technicalMetrics.resistance.getContext(data.resistance)}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </Card>
  )
}
