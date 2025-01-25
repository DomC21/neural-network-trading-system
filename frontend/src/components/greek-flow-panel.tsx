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
            <CardTitle>Greek Flow Data</CardTitle>
            <CardDescription>
              Track options Greeks trends and analyze market dynamics
            </CardDescription>
          </div>
          <div className="w-full sm:w-48">
            <Label htmlFor="ticker-select">Stock Ticker</Label>
            <Select
              value={selectedTicker}
              onValueChange={(value) => setSelectedTicker(value)}
            >
              <SelectTrigger id="ticker-select">
                <SelectValue placeholder="Select stock" />
              </SelectTrigger>
              <SelectContent>
                {tickers.map((ticker) => (
                  <SelectItem key={ticker} value={ticker}>
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
        <Card className="p-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Greeks Trends</CardTitle>
              <div className="flex gap-4">
                {Object.entries(descriptions).map(([greek, description]) => (
                  <TooltipProvider key={greek}>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <span className="capitalize">{greek}</span>
                          <HelpCircle className="h-4 w-4" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{description}</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {data.length > 0 ? (
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground)/30)" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
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
                      dataKey="delta"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Delta"
                    />
                    <Line
                      type="monotone"
                      dataKey="gamma"
                      stroke="hsl(var(--secondary))"
                      strokeWidth={2}
                      name="Gamma"
                    />
                    <Line
                      type="monotone"
                      dataKey="theta"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth={2}
                      name="Theta"
                    />
                  </LineChart>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    {insightLoading ? "Loading data..." : error ? "No data available" : "No Greek flow data found"}
                  </div>
                )}
              </ResponsiveContainer>
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
