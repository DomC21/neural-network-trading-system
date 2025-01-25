import { useState, useEffect } from "react"
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
  const fetchData = async () => {
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
  }

  // Initial data fetch
  useEffect(() => {
    fetchData()
  }, [interval5m, granularity])

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Market-Wide Options Flow</CardTitle>
            <CardDescription>
              {granularity === "minute" 
                ? "Track real-time market sentiment through minute-by-minute premium flow"
                : "Monitor market sentiment through daily cumulative premium flow"}
            </CardDescription}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="interval-switch"
                checked={interval5m}
                onCheckedChange={setInterval5m}
                disabled={granularity === "daily"}
              />
              <Label htmlFor="interval-switch">5-Minute Intervals</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="granularity-switch"
                checked={granularity === "daily"}
                onCheckedChange={(checked) => setGranularity(checked ? "daily" : "minute")}
              />
              <Label htmlFor="granularity-switch">Daily View</Label>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Market Tide Chart */}
        <Card className="p-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              {granularity === "minute" ? "Intraday Premium Flow" : "Daily Premium Flow"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {data.length > 0 ? (
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground)/30)" />
                    <XAxis 
                      dataKey="market_time" 
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => granularity === "minute" ? value.split(' ')[1] : value.split(' ')[0]} // Show time for minute view, date for daily view
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))"
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
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        color: "hsl(var(--foreground))"
                      }}
                      labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                    />
                    <Legend wrapperStyle={{ color: "hsl(var(--muted-foreground))" }} />
                    <Line
                      type="monotone"
                      dataKey="cumulative_call_premium"
                      name="Cumulative Call Premium"
                      stroke="#33B890"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="cumulative_put_premium"
                      name="Cumulative Put Premium"
                      stroke="#EC4B5E"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="net_premium"
                      name="Net Premium"
                      stroke="#28479C"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                    />
                    {granularity === "minute" && (
                      <>
                        <Line
                          type="monotone"
                          dataKey="net_call_premium"
                          name="Net Call Flow"
                          stroke="#33B890"
                          strokeWidth={1}
                          strokeDasharray="2 2"
                          opacity={0.5}
                        />
                        <Line
                          type="monotone"
                          dataKey="net_put_premium"
                          name="Net Put Flow"
                          stroke="#EC4B5E"
                          strokeWidth={1}
                          strokeDasharray="2 2"
                          opacity={0.5}
                        />
                      </>
                    )}
                  </LineChart>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    {insightLoading ? "Loading data..." : error ? "No data available" : "No market tide data found"}
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Historical Stats Summary */}
        <Card className="p-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Historical Context</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Call Premium Range</p>
                <p className="text-lg font-medium">
                  {formatCurrency(historicalStats.min_call_premium)} - {formatCurrency(historicalStats.max_call_premium)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Put Premium Range</p>
                <p className="text-lg font-medium">
                  {formatCurrency(historicalStats.min_put_premium)} - {formatCurrency(historicalStats.max_put_premium)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Volume Range</p>
                <p className="text-lg font-medium">
                  {historicalStats.min_net_volume.toLocaleString()} - {historicalStats.max_net_volume.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ChatGPT Insight Box */}
        <Card className="bg-muted transition-all duration-300 hover:bg-muted/80">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="shrink-0">
                <MessageSquare className={`h-5 w-5 mt-0.5 transition-colors ${insightLoading ? 'animate-pulse text-muted-foreground/70' : error ? 'text-destructive' : 'text-primary'}`} />
              </div>
              <div className="min-h-[2.5rem] flex items-center">
                <p className={`text-sm leading-relaxed ${error ? 'text-destructive' : ''}`}>
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
