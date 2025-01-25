import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
  ResponsiveContainer,
  ComposedChart,
  Area,
} from "recharts"
import { MessageSquare, HelpCircle } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Custom tooltip component for the chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded p-2 shadow-lg">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry: any, index: number) => {
          // Format value based on data type
          let formattedValue = entry.value
          if (entry.name === "Price") {
            formattedValue = `$${entry.value.toFixed(2)}`
          } else if (entry.name === "Volume") {
            formattedValue = entry.value.toLocaleString()
          } else {
            formattedValue = entry.value > 1000000 
              ? `$${(entry.value / 1000000).toFixed(1)}M` 
              : `$${(entry.value / 1000).toFixed(1)}K`
          }
          
          return (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formattedValue}
            </p>
          )
        })}
      </div>
    )
  }
  return null
}

import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface PremiumFlowData {
  // Base fields
  sector: string
  option_type: string
  premium: number
  volume: number
  date: string
  avg_strike: number
  avg_expiry_days: number
  market_time: string

  // Cumulative metrics
  cumulative_call_premium: number
  cumulative_put_premium: number
  net_premium: number

  // Intraday specific fields
  price?: number
  net_call_premium?: number
  net_put_premium?: number

  // Volume metrics
  call_volume?: number
  put_volume?: number
  volume_ratio?: number
}

interface SectorDescriptions {
  [key: string]: string
}

interface HistoricalStats {
  max_call_premium: number
  min_call_premium: number
  max_put_premium: number
  min_put_premium: number
  avg_daily_volume: number
  highest_volume_date: string | null
}

export function PremiumFlowPanel() {
  const [data, setData] = useState<PremiumFlowData[]>([])
  const [descriptions, setDescriptions] = useState<SectorDescriptions>({})
  const [selectedType, setSelectedType] = useState("all")
  const [selectedSector, setSelectedSector] = useState("all")
  const [showIntraday, setShowIntraday] = useState(false)
  const [insightLoading, setInsightLoading] = useState(true)
  const [error, setError] = useState("")
  const [insight, setInsight] = useState("")
  const [priceData, setPriceData] = useState<Array<{ time: string, price: number }>>([])

  // Generate mock price data for demo
  useEffect(() => {
    if (showIntraday) {
      const basePrice = 100
      const mockPriceData = Array.from({ length: 390 }, (_, i) => ({
        time: new Date(new Date().setHours(9, 30, 0, 0) + i * 60000).toLocaleTimeString(),
        price: basePrice + Math.sin(i / 30) * 5 + Math.random() * 2
      }))
      setPriceData(mockPriceData)
    }
  }, [showIntraday])

  // Initialize historical stats
  const [historicalStats, setHistoricalStats] = useState<HistoricalStats>({
    max_call_premium: 0,
    min_call_premium: 0,
    max_put_premium: 0,
    min_put_premium: 0,
    avg_daily_volume: 0,
    highest_volume_date: null
  })

  const sectors = ["tech", "healthcare", "energy", "finance", "consumer", "industrial"]
  const optionTypes = [
    { value: "all", label: "All Types" },
    { value: "call", label: "Calls" },
    { value: "put", label: "Puts" }
  ]

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount)
  }

  // Fetch premium flow data
  const fetchData = async () => {
    setInsightLoading(true)
    setError("")
    try {
      const params = new URLSearchParams()
      if (selectedType !== "all") params.append("option_type", selectedType)
      if (selectedSector !== "all") params.append("sector", selectedSector)
      params.append("is_intraday", showIntraday.toString())

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/premium-flow/data?${params.toString()}`
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
      console.error("Error fetching premium flow data:", error)
      setError("Failed to fetch premium flow data. Please try again.")
      setInsight("")
    } finally {
      setInsightLoading(false)
    }
  }

  // Fetch sector descriptions
  const fetchDescriptions = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/premium-flow/sectors`
      )
      const data = await response.json()
      setDescriptions(data)
    } catch (error) {
      console.error("Error fetching sector descriptions:", error)
    }
  }

  // Process data for heatmap
  const processDataForHeatmap = () => {
    const sectorMap = new Map<string, { 
      calls: number, 
      puts: number, 
      volume: number,
      call_volume: number,
      put_volume: number 
    }>()
    
    data.forEach((flow) => {
      const key = flow.sector
      const current = sectorMap.get(key) || { 
        calls: 0, 
        puts: 0, 
        volume: 0,
        call_volume: 0,
        put_volume: 0
      }
      
      if (flow.option_type === "call") {
        current.calls += flow.premium
        current.call_volume += flow.volume
      } else {
        current.puts += flow.premium
        current.put_volume += flow.volume
      }
      current.volume += flow.volume
      
      sectorMap.set(key, current)
    })

    return Array.from(sectorMap.entries()).map(([sector, data]) => ({
      sector,
      callPremium: data.calls,
      putPremium: data.puts,
      ratio: data.calls / (data.calls + data.puts),
      volume: data.volume,
      call_volume: data.call_volume,
      put_volume: data.put_volume,
      volume_ratio: data.call_volume / (data.call_volume + data.put_volume)
    }))
  }

  // Process data for trend line
  const processDataForTrendline = () => {
    const sortedData = data.sort((a, b) => a.market_time.localeCompare(b.market_time))
    
    if (showIntraday) {
      // Merge price data with flow data for intraday view
      let callSum = 0
      let putSum = 0
      
      return sortedData.map((point, index) => {
        // Calculate running totals
        if (point.option_type === "call") {
          callSum += point.premium
        } else {
          putSum += point.premium
        }
        
        return {
          ...point,
          price: priceData[index]?.price || null,
          net_call_premium: point.option_type === "call" ? point.premium : 0,
          net_put_premium: point.option_type === "put" ? point.premium : 0,
          cumulative_call_premium: callSum,
          cumulative_put_premium: putSum,
          net_premium: callSum - putSum,
          volume: point.volume || 0
        }
      })
    }
    
    // For non-intraday view, ensure volume is present
    return sortedData.map(point => ({
      ...point,
      volume: point.volume || 0
    }))
  }

  // Initial data fetch
  useEffect(() => {
    fetchData()
    fetchDescriptions()
  }, [selectedType, selectedSector, showIntraday])

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Market-Wide Premium Flow</CardTitle>
            <CardDescription>
              {showIntraday 
                ? "Track real-time market sentiment through minute-by-minute premium flow"
                : "Analyze options premium flow trends across sectors"}
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="intraday-switch"
                checked={showIntraday}
                onCheckedChange={setShowIntraday}
              />
              <Label htmlFor="intraday-switch">Intraday View</Label>
            </div>
            <div className="w-full sm:w-48">
              <Label htmlFor="type-select">Option Type</Label>
              <Select
                value={selectedType}
                onValueChange={setSelectedType}
              >
                <SelectTrigger id="type-select">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  {optionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
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
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Premium Flow Trend */}
        <Card className="p-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Premium Flow Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {data.length > 0 ? (
                  <ComposedChart data={processDataForTrendline()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground)/30)" />
                    <XAxis 
                      dataKey="market_time" 
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => showIntraday ? value.split(' ')[1] : value.split(' ')[0]}
                    />
                    <YAxis 
                      yAxisId="premium" 
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => 
                        new Intl.NumberFormat('en-US', {
                          notation: 'compact',
                          compactDisplay: 'short',
                          style: 'currency',
                          currency: 'USD',
                        }).format(value)
                      }
                    />
                    {showIntraday && (
                      <YAxis
                        yAxisId="price"
                        orientation="right"
                        stroke="#28479C"
                        domain={['auto', 'auto']}
                        tickFormatter={(value) => value.toFixed(2)}
                      />
                    )}
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      yAxisId="premium"
                      type="monotone"
                      dataKey="volume"
                      name="Volume"
                      fill="#28479C"
                      fillOpacity={0.1}
                      stroke="none"
                    />
                    <Legend wrapperStyle={{ color: "hsl(var(--muted-foreground))" }} />
                    <Line
                      yAxisId="premium"
                      type="monotone"
                      dataKey="cumulative_call_premium"
                      name="Cumulative Call Premium"
                      stroke="#33B890"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      yAxisId="premium"
                      type="monotone"
                      dataKey="cumulative_put_premium"
                      name="Cumulative Put Premium"
                      stroke="#EC4B5E"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      yAxisId="premium"
                      type="monotone"
                      dataKey="net_premium"
                      name="Net Premium"
                      stroke="#28479C"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                      dot={false}
                    />
                    {showIntraday && (
                      <>
                        <Line
                          yAxisId="premium"
                          type="monotone"
                          dataKey="net_call_premium"
                          name="Net Call Flow"
                          stroke="#33B890"
                          strokeWidth={1}
                          strokeDasharray="2 2"
                          opacity={0.5}
                          dot={false}
                        />
                        <Line
                          yAxisId="premium"
                          type="monotone"
                          dataKey="net_put_premium"
                          name="Net Put Flow"
                          stroke="#EC4B5E"
                          strokeWidth={1}
                          strokeDasharray="2 2"
                          opacity={0.5}
                          dot={false}
                        />
                        <Line
                          yAxisId="price"
                          type="monotone"
                          dataKey="price"
                          name="Price"
                          stroke="#28479C"
                          strokeWidth={1}
                          dot={false}
                        />
                      </>
                    )}
                  </ComposedChart>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    {insightLoading ? "Loading data..." : error ? "No data available" : "No premium flow data found"}
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sector Heatmap */}
        <Card className="p-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Sector Premium Distribution</CardTitle>
              <div className="flex gap-4">
                {Object.entries(descriptions).map(([sector, description]) => (
                  <TooltipProvider key={sector}>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <span className="capitalize">{sector}</span>
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
                  <ComposedChart data={processDataForHeatmap()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground)/30)" />
                    <XAxis dataKey="sector" stroke="hsl(var(--muted-foreground))" />
                    <YAxis yAxisId="premium" stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => 
                        new Intl.NumberFormat('en-US', {
                          notation: 'compact',
                          compactDisplay: 'short',
                          style: 'currency',
                          currency: 'USD',
                        }).format(value)
                      }
                    />
                    <YAxis
                      yAxisId="ratio"
                      orientation="right"
                      stroke="#28479C"
                      domain={[0, 1]}
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      yAxisId="premium"
                      type="monotone"
                      dataKey="volume"
                      fill="#28479C"
                      fillOpacity={0.1}
                      stroke="none"
                    />
                    <Legend wrapperStyle={{ color: "hsl(var(--muted-foreground))" }} />
                    <Line
                      yAxisId="premium"
                      type="monotone"
                      dataKey="callPremium"
                      name="Call Premium"
                      stroke="#33B890"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="premium"
                      type="monotone"
                      dataKey="putPremium"
                      name="Put Premium"
                      stroke="#EC4B5E"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="ratio"
                      type="monotone"
                      dataKey="ratio"
                      name="Call/Put Ratio"
                      stroke="#28479C"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                    />
                  </ComposedChart>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    {insightLoading ? "Loading data..." : error ? "No data available" : "No sector premium data found"}
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
                  {error || insight || (insightLoading ? "Analyzing premium flow patterns..." : "No insights available.")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
