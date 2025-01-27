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
  }, [selectedSector, surpriseType, fetchData])

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl mb-2">After-Hours Earnings Reports</CardTitle>
            <CardDescription className="text-brand-gray-300">
              Analyze earnings surprises and their impact on stock prices
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-full sm:w-48">
              <Label htmlFor="sector-select" className="text-brand-gray-200">Sector</Label>
              <Select
                value={selectedSector}
                onValueChange={setSelectedSector}
              >
                <SelectTrigger 
                  id="sector-select"
                  className="bg-brand-gray-900 border-brand-gray-700 text-brand-gray-100 focus:border-brand-cyan focus:ring-brand-cyan/20"
                >
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent className="bg-brand-gray-900 border-brand-gray-700">
                  <SelectItem 
                    value="all"
                    className="text-brand-gray-100 hover:bg-brand-gray-800 focus:bg-brand-gray-800"
                  >
                    All Sectors
                  </SelectItem>
                  {sectors.map((sector) => (
                    <SelectItem 
                      key={sector} 
                      value={sector}
                      className="text-brand-gray-100 hover:bg-brand-gray-800 focus:bg-brand-gray-800"
                    >
                      {sector.charAt(0).toUpperCase() + sector.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Label htmlFor="surprise-select" className="text-brand-gray-200">Surprise Type</Label>
              <Select
                value={surpriseType}
                onValueChange={setSurpriseType}
              >
                <SelectTrigger 
                  id="surprise-select"
                  className="bg-brand-gray-900 border-brand-gray-700 text-brand-gray-100 focus:border-brand-cyan focus:ring-brand-cyan/20"
                >
                  <SelectValue placeholder="All Surprises" />
                </SelectTrigger>
                <SelectContent className="bg-brand-gray-900 border-brand-gray-700">
                  {surpriseTypes.map((type) => (
                    <SelectItem 
                      key={type.value} 
                      value={type.value}
                      className="text-brand-gray-100 hover:bg-brand-gray-800 focus:bg-brand-gray-800"
                    >
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
        <Card className="p-6 bg-brand-navy/30 border-brand-gray-700/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg bg-gradient-to-r from-brand-teal to-brand-cyan bg-clip-text text-transparent font-semibold">Earnings Surprises vs. Price Movements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                {data.length > 0 ? (
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid stroke="hsl(var(--brand-gray-700)/30)" />
                    <XAxis 
                      stroke="hsl(var(--brand-gray-400))"
                      tick={{ fill: "hsl(var(--brand-gray-400))" }}
                      type="number"
                      dataKey="earnings_surprise"
                      name="Earnings Surprise"
                      tickFormatter={formatPercent}
                      domain={[-0.5, 0.5]}
                    />
                    <YAxis
                      stroke="hsl(var(--brand-gray-400))"
                      tick={{ fill: "hsl(var(--brand-gray-400))" }}
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
                      cursor={{ strokeDasharray: '3 3', stroke: 'hsl(var(--brand-gray-400))' }}
                      formatter={(value: number, name: string) => [
                        formatPercent(value),
                        name.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')
                      ]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--brand-navy))",
                        border: "1px solid hsl(var(--brand-gray-700))",
                        color: "hsl(var(--brand-gray-100))",
                        backdropFilter: "blur(8px)"
                      }}
                      labelStyle={{ color: "hsl(var(--brand-gray-400))" }}
                    />
                    <Scatter
                      name="Companies"
                      data={data}
                      fill="hsl(var(--brand-teal))"
                    />
                  </ScatterChart>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-brand-gray-400">
                    {insightLoading ? (
                      <span className="text-brand-gray-400 animate-pulse transition-opacity duration-500 tracking-wide text-sm font-medium">Loading data...</span>
                    ) : error ? (
                      <span className="text-red-500/90">No data available</span>
                    ) : (
                      <span className="text-brand-gray-400 tracking-wide text-sm">No earnings data found</span>
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
                    : 'text-brand-teal hover:text-brand-cyan hover:scale-110'
                }`} />
              </div>
              <div className="min-h-[2.5rem] flex items-center">
                <p className={`text-sm leading-relaxed ${
                  error 
                    ? 'text-red-500' 
                    : 'text-brand-gray-200'
                }`}>
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
