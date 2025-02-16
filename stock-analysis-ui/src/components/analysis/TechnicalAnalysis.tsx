import { Card } from "../ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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
    <Card className="p-6 bg-zinc-900 border-gold">
      <h2 className="text-xl font-semibold text-gold mb-4">Technical Analysis</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-gray-400">Current Price</p>
          <p className="text-2xl font-bold text-white">${data.price.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-400">Volume</p>
          <p className="text-2xl font-bold text-white">{data.volume.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-400">RSI (14)</p>
          <p className="text-xl font-bold text-white">{data.rsi.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-400">MACD</p>
          <p className="text-xl font-bold text-white">{data.macd.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.historical_data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip 
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
        <div>
          <p className="text-gray-400">Support Level</p>
          <p className="text-xl font-bold text-white">${data.support.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-400">Resistance Level</p>
          <p className="text-xl font-bold text-white">${data.resistance.toFixed(2)}</p>
        </div>
      </div>
    </Card>
  )
}
