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
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis
} from "recharts"
import { MessageSquare } from "lucide-react"

interface EarningsData {
  ticker: string
  sector: string
  earnings_surprise: number
  price_movement: number
  report_date: string
  market_cap: number
}

export function EarningsPanel() {
  const [data, setData] = useState<EarningsData[]>([])
  const [selectedSector, setSelectedSector] = useState<string>("all")
  const [surpriseType, setSurpriseType] = useState<string>("all")
  const [insightLoading, setInsightLoading] = useState(true)
  const [error, setError] = useState("")
  const [insight, setInsight] = useState("")

  const sectors = ["tech", "healthcare", "energy", "finance"]
  const surpriseTypes = [
    { value: "all", label: "All Surprises" },
    { value: "positive", label: "Positive Surprises" },
    { value: "negative", label: "Negative Surprises" }
  ]

  // Format percentages
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

  // Fetch earnings data
  const fetchData = async () => {
    setInsightLoading(true)
    setError("")
    try {
      const params = new URLSearchParams()
      if (selectedSector !== "all") params.append("sector", selectedSector)
      if (surpriseType !== "all") params.append("surprise_type", surpriseType)

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/earnings/data?${params.toString()}`
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const { data, insight } = await response.json()
      setData(data)
      setInsight(insight)
      setError("")
    } catch (error) {
      console.error("Error fetching earnings data:", error)
      setError("Failed to fetch earnings data. Please try again.")
      setInsight("")
    } finally {
      setInsightLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchData()
  }, [selectedSector, surpriseType])

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>After-Hours Earnings Reports</CardTitle>
            <CardDescription>
              Analyze earnings surprises and their impact on stock prices
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-48">
              <Label htmlFor="sector-select">Sector</Label>
              <Select
                value={selectedSector}
                onValueChange={setSelectedSector}
              >
                <SelectTrigger id="sector-select">
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {sectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector.charAt(0).toUpperCase() + sector.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Label htmlFor="surprise-select">Surprise Type</Label>
              <Select
                value={surpriseType}
                onValueChange={setSurpriseType}
              >
                <SelectTrigger id="surprise-select">
                  <SelectValue placeholder="All Surprises" />
                </SelectTrigger>
                <SelectContent>
                  {surpriseTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scatter Plot */}
        <Card className="p-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Earnings Surprises vs. Price Movements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {data.length > 0 ? (
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid stroke="hsl(var(--muted-foreground)/30)" />
                    <XAxis stroke="hsl(var(--muted-foreground))"
                      type="number"
                      dataKey="earnings_surprise"
                      name="Earnings Surprise"
                      tickFormatter={formatPercent}
                      domain={[-0.5, 0.5]}
                    />
                    <YAxis
                      type="number"
                      dataKey="price_movement"
                      name="Price Movement"
                      tickFormatter={formatPercent}
                      domain={[-0.15, 0.15]}
                    />
                    <ZAxis
                      type="number"
                      dataKey="market_cap"
                      range={[50, 400]}
                      name="Market Cap"
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(value: number, name: string) => [
                        formatPercent(value),
                        name.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')
                      ]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        color: "hsl(var(--foreground))"
                      }}
                      labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                    />
                    <Scatter
                      name="Companies"
                      data={data}
                      fill="hsl(var(--primary))"
                    />
                  </ScatterChart>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    {insightLoading ? "Loading data..." : error ? "No data available" : "No earnings data found"}
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
                  {error || insight || (insightLoading ? "Analyzing earnings patterns..." : "No insights available.")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
