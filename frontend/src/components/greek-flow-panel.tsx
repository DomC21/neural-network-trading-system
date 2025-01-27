import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"
import { MessageSquare, HelpCircle } from "lucide-react"
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface GreekData {
  ticker: string
  date: string
  delta: number
  gamma: number
  theta: number
  volume: number
}

interface GreekDescriptions {
  delta: string
  gamma: string
  theta: string
}

export function GreekFlowPanel() {
  const [data, setData] = useState<GreekData[]>([])
  const [descriptions, setDescriptions] = useState<GreekDescriptions>({
    delta: "",
    gamma: "",
    theta: ""
  })
  const [selectedTicker, setSelectedTicker] = useState("AAPL")
  const [insightLoading, setInsightLoading] = useState(true)
  const [error, setError] = useState("")
  const [insight, setInsight] = useState("")

  const tickers = ["AAPL", "TSLA", "GOOGL", "MSFT", "AMZN"]

  // Fetch Greek flow data
  const fetchData = async () => {
    setInsightLoading(true)
    setError("")
    try {
      const params = new URLSearchParams()
      if (selectedTicker) params.append("ticker", selectedTicker)

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/greek-flow/data?${params.toString()}`
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const { data, insight } = await response.json()
      setData(data)
      setInsight(insight)
      setError("")
    } catch (error) {
      console.error("Error fetching Greek flow data:", error)
      setError("Failed to fetch Greek flow data. Please try again.")
      setInsight("")
    } finally {
      setInsightLoading(false)
    }
  }

  // Fetch Greek descriptions
  const fetchDescriptions = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/greek-flow/descriptions`
      )
      const data = await response.json()
      setDescriptions(data)
    } catch (error) {
      console.error("Error fetching Greek descriptions:", error)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchData()
    fetchDescriptions()
  }, [selectedTicker])

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl mb-2">Greek Flow Data</CardTitle>
            <CardDescription className="text-brand-gray-300">
              Track options Greeks trends and analyze market dynamics
            </CardDescription>
          </div>
          <div className="w-full sm:w-48">
            <Label htmlFor="ticker-select" className="text-brand-gray-200">Stock Ticker</Label>
            <Select
              value={selectedTicker}
              onValueChange={(value) => setSelectedTicker(value)}
            >
              <SelectTrigger 
                id="ticker-select"
                className="bg-brand-gray-900 border-brand-gray-700 text-brand-gray-100 focus:border-brand-gold focus:ring-brand-gold/20"
              >
                <SelectValue placeholder="Select stock" />
              </SelectTrigger>
              <SelectContent className="bg-brand-gray-900 border-brand-gray-700">
                {tickers.map((ticker) => (
                  <SelectItem 
                    key={ticker} 
                    value={ticker}
                    className="text-brand-gray-100 hover:bg-brand-gray-800 focus:bg-brand-gray-800"
                  >
                    {ticker}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Line Chart */}
        <Card className="p-6 bg-brand-navy/30 border-brand-gray-700/50">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="text-lg bg-gradient-to-r from-brand-teal to-brand-cyan bg-clip-text text-transparent font-semibold">Greeks Trends</CardTitle>
              <div className="flex flex-wrap gap-4">
                {Object.entries(descriptions).map(([greek, description]) => (
                  <TooltipProvider key={greek}>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-sm text-brand-gray-300 hover:text-brand-gray-100 transition-colors">
                          <span className="capitalize">{greek}</span>
                          <HelpCircle className="h-4 w-4" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-brand-gray-900 border-brand-gray-700">
                        <p className="text-brand-gray-100">{description}</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                {data.length > 0 ? (
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--brand-gray-700)/30)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--brand-gray-400))"
                      tick={{ fill: "hsl(var(--brand-gray-400))" }}
                    />
                    <YAxis 
                      stroke="hsl(var(--brand-gray-400))"
                      tick={{ fill: "hsl(var(--brand-gray-400))" }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--brand-navy))",
                        border: "1px solid hsl(var(--brand-gray-700))",
                        color: "hsl(var(--brand-gray-100))",
                        backdropFilter: "blur(8px)"
                      }}
                      labelStyle={{ color: "hsl(var(--brand-gray-400))" }}
                    />
                    <Legend wrapperStyle={{ color: "hsl(var(--brand-gray-400))" }} />
                    <Line
                      type="monotone"
                      dataKey="delta"
                      stroke="hsl(var(--brand-gold))"
                      strokeWidth={2}
                      name="Delta"
                    />
                    <Line
                      type="monotone"
                      dataKey="gamma"
                      stroke="hsl(var(--brand-cyan))"
                      strokeWidth={2}
                      name="Gamma"
                    />
                    <Line
                      type="monotone"
                      dataKey="theta"
                      stroke="hsl(var(--brand-accent))"
                      strokeWidth={2}
                      name="Theta"
                    />
                  </LineChart>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-brand-gray-400">
                    {insightLoading ? (
                      <span className="text-brand-gray-400 animate-pulse transition-opacity duration-500 tracking-wide text-sm font-medium">Loading data...</span>
                    ) : error ? (
                      <span className="text-red-500/90">No data available</span>
                    ) : (
                      <span className="text-brand-gray-400 tracking-wide text-sm">No Greek flow data found</span>
                    )}
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* ChatGPT Insight Box */}
        <Card className="bg-brand-navy/30 border-brand-gray-700/50 transition-all duration-300 hover:bg-brand-navy/40">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="shrink-0">
                <MessageSquare className={`h-5 w-5 mt-0.5 transition-all duration-300 ${
                  insightLoading 
                    ? 'animate-pulse text-brand-gray-400' 
                    : error 
                    ? 'text-red-500' 
                    : 'text-brand-gold hover:text-brand-cyan hover:scale-110'
                }`} />
              </div>
              <div className="min-h-[2.5rem] flex items-center">
                <p className={`text-sm leading-relaxed ${
                  error 
                    ? 'text-red-500' 
                    : 'text-brand-gray-200'
                }`}>
                  {error || insight || (insightLoading ? "Analyzing options flow patterns..." : "No insights available.")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
