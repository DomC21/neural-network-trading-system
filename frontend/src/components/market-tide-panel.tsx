import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { MessageSquare } from "lucide-react"

interface MarketTideData {
  date: string
  net_call_premium: string
  net_put_premium: string
  net_volume: string
  timestamp: string
  cumulative_call_premium: number
  cumulative_put_premium: number
  net_premium: number
  market_time: string
}

interface HistoricalStats {
  max_call_premium: number
  min_call_premium: number
  max_put_premium: number
  min_put_premium: number
  max_net_volume: number
  min_net_volume: number
  highest_volume_date: string | null
}

export function MarketTidePanel() {
  const [data, setData] = useState<MarketTideData[]>([])
  const [interval5m, setInterval5m] = useState(false)
  const [granularity, setGranularity] = useState<"minute" | "daily">("minute")
  const [insightLoading, setInsightLoading] = useState(true)
  const [error, setError] = useState("")
  const [insight, setInsight] = useState("")
  const [historicalStats, setHistoricalStats] = useState<HistoricalStats>({
    max_call_premium: 0,
    min_call_premium: 0,
    max_put_premium: 0,
    min_put_premium: 0,
    max_net_volume: 0,
    min_net_volume: 0,
    highest_volume_date: null
  })

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount)
  }

  // Fetch market tide data
  const fetchData = useCallback(async () => {
    setInsightLoading(true)
    setError("")
    try {
      const params = new URLSearchParams()
      params.append("interval_5m", interval5m.toString())
      params.append("granularity", granularity)

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/market-tide/data?${params.toString()}`
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const { data, insight, historical_stats } = await response.json()
      setData(data)
      setInsight(insight)
      setHistoricalStats(historical_stats)
      setError("")
    } catch (error) {
      console.error("Error fetching market tide data:", error)
      setError("Failed to fetch market tide data. Please try again.")
      setInsight("")
    } finally {
      setInsightLoading(false)
    }
  }, [interval5m, granularity, setInsightLoading, setError, setData, setInsight, setHistoricalStats])

  // Initial data fetch
  useEffect(() => {
    fetchData()
  }, [interval5m, granularity, fetchData])

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl mb-2">Market-Wide Options Flow</CardTitle>
            <CardDescription className="text-brand-gray-300">
              {granularity === "minute" 
                ? "Track real-time market sentiment through minute-by-minute premium flow"
                : "Monitor market sentiment through daily cumulative premium flow"}
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="interval-switch"
                checked={interval5m}
                onCheckedChange={setInterval5m}
                disabled={granularity === "daily"}
                className="data-[state=checked]:bg-gradient-to-r from-brand-teal to-brand-cyan"
              />
              <Label htmlFor="interval-switch" className="text-brand-gray-200">5-Minute Intervals</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="granularity-switch"
                checked={granularity === "daily"}
                onCheckedChange={(checked) => setGranularity(checked ? "daily" : "minute")}
                className="data-[state=checked]:bg-gradient-to-r from-brand-teal to-brand-cyan"
              />
              <Label htmlFor="granularity-switch" className="text-brand-gray-200">Daily View</Label>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Market Tide Chart */}
        <Card className="p-6 bg-brand-navy/30 border-brand-gray-700/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg bg-gradient-to-r from-brand-teal to-brand-cyan bg-clip-text text-transparent font-semibold">
              {granularity === "minute" ? "Intraday Premium Flow" : "Daily Premium Flow"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                {data.length > 0 ? (
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--brand-gray-700)/30)" />
                    <XAxis 
                      dataKey="market_time" 
                      stroke="hsl(var(--brand-gray-400))"
                      tick={{ fill: "hsl(var(--brand-gray-400))" }}
                      tickFormatter={(value) => granularity === "minute" ? value.split(' ')[1] : value.split(' ')[0]} // Show time for minute view, date for daily view
                    />
                    <YAxis 
                      stroke="hsl(var(--brand-gray-400))"
                      tick={{ fill: "hsl(var(--brand-gray-400))" }}
                      tickFormatter={(value) => 
                        new Intl.NumberFormat('en-US', {
                          notation: 'compact',
                          compactDisplay: 'short',
                          style: 'currency',
                          currency: 'USD',
                        }).format(value)
                      }
                    />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), 'Premium']}
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
                      dataKey="cumulative_call_premium"
                      name="Cumulative Call Premium"
                      stroke="hsl(var(--brand-teal))"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="cumulative_put_premium"
                      name="Cumulative Put Premium"
                      stroke="hsl(var(--brand-cyan))"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="net_premium"
                      name="Net Premium"
                      stroke="hsl(var(--brand-accent))"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                    />
                    {granularity === "minute" && (
                      <>
                        <Line
                          type="monotone"
                          dataKey="net_call_premium"
                          name="Net Call Flow"
                          stroke="hsl(var(--brand-teal))"
                          strokeWidth={1}
                          strokeDasharray="2 2"
                          opacity={0.5}
                        />
                        <Line
                          type="monotone"
                          dataKey="net_put_premium"
                          name="Net Put Flow"
                          stroke="hsl(var(--brand-cyan))"
                          strokeWidth={1}
                          strokeDasharray="2 2"
                          opacity={0.5}
                        />
                      </>
                    )}
                  </LineChart>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    {insightLoading ? (
                      <span className="text-brand-gray-400 animate-pulse transition-opacity duration-500 tracking-wide text-sm font-medium">Loading data...</span>
                    ) : error ? (
                      <span className="text-red-500/90">No data available</span>
                    ) : (
                      <span className="text-brand-gray-400 tracking-wide text-sm">No market tide data found</span>
                    )}
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Historical Stats Summary */}
        <Card className="p-6 bg-brand-navy/30 border-brand-gray-700/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg bg-gradient-to-r from-brand-teal to-brand-cyan bg-clip-text text-transparent font-semibold">Historical Context</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-brand-gray-400">Call Premium Range</p>
                <p className="text-lg font-medium text-brand-gray-100">
                  {formatCurrency(historicalStats.min_call_premium)} - {formatCurrency(historicalStats.max_call_premium)}
                </p>
              </div>
              <div>
                <p className="text-sm text-brand-gray-400">Put Premium Range</p>
                <p className="text-lg font-medium text-brand-gray-100">
                  {formatCurrency(historicalStats.min_put_premium)} - {formatCurrency(historicalStats.max_put_premium)}
                </p>
              </div>
              <div>
                <p className="text-sm text-brand-gray-400">Volume Range</p>
                <p className="text-lg font-medium text-brand-gray-100">
                  {historicalStats.min_net_volume.toLocaleString()} - {historicalStats.max_net_volume.toLocaleString()}
                </p>
              </div>
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
                    : 'text-brand-teal hover:text-brand-cyan hover:scale-110'
                }`} />
              </div>
              <div className="min-h-[2.5rem] flex items-center">
                <p className={`text-sm leading-relaxed ${
                  error 
                    ? 'text-red-500' 
                    : 'text-brand-gray-200'
                }`}>
                  {error || insight || (insightLoading ? "Analyzing market tide patterns..." : "No insights available.")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
