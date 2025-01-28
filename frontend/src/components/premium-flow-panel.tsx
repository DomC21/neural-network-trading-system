import { useState, useEffect, useCallback } from "react"
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

// Types for the tooltip component
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
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
  const [, setHistoricalStats] = useState<HistoricalStats>({
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
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount)
  }

  // Custom tooltip component using formatCurrency
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-brand-gray-900 border border-brand-gray-700 rounded p-2 shadow-lg">
          <p className="text-sm font-medium text-brand-gray-100">{label}</p>
          {payload.map((entry, index) => {
            // Format value based on data type
            let formattedValue: string
            if (entry.name === "Price") {
              formattedValue = `$${entry.value.toFixed(2)}`
            } else if (entry.name === "Volume") {
              formattedValue = entry.value.toLocaleString()
            } else {
              formattedValue = formatCurrency(entry.value)
            }
            
            return (
              <p key={index} className="text-sm text-brand-gray-200" style={{ color: entry.color }}>
                <span className="text-brand-gray-400">{entry.name}:</span> {formattedValue}
              </p>
            )
          })}
        </div>
      )
    }
    return null
  }

  // Fetch premium flow data
  const fetchData = useCallback(async () => {
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
  }, [selectedType, selectedSector, showIntraday, setInsightLoading, setError, setData, setInsight, setHistoricalStats])

  // Fetch sector descriptions
  const fetchDescriptions = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/premium-flow/sectors`
      )
      const data = await response.json()
      setDescriptions(data)
    } catch (error) {
      console.error("Error fetching sector descriptions:", error)
    }
  }, [setDescriptions])

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
  }, [selectedType, selectedSector, showIntraday, fetchData, fetchDescriptions])

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl mb-2">Market-Wide Premium Flow</CardTitle>
            <CardDescription className="text-brand-gray-300">
              {showIntraday 
                ? "Track real-time market sentiment through minute-by-minute premium flow"
                : "Analyze options premium flow trends across sectors"}
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="intraday-switch"
                checked={showIntraday}
                onCheckedChange={setShowIntraday}
                className="data-[state=checked]:bg-gradient-to-r from-brand-teal to-brand-cyan"
              />
              <Label htmlFor="intraday-switch" className="text-brand-gray-200">Intraday View</Label>
            </div>
            <div className="w-full sm:w-48">
              <Label htmlFor="type-select" className="text-brand-gray-200">Option Type</Label>
              <Select
                value={selectedType}
                onValueChange={setSelectedType}
              >
                <SelectTrigger 
                  id="type-select"
                  className="bg-brand-gray-900 border-brand-gray-700 text-brand-gray-100 focus:border-brand-cyan focus:ring-brand-cyan/20"
                >
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="bg-brand-gray-900 border-brand-gray-700">
                  {optionTypes.map((type) => (
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
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Premium Flow Trend */}
        <Card className="p-6 bg-brand-navy/30 border-brand-gray-700/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg bg-gradient-to-r from-brand-teal to-brand-cyan bg-clip-text text-transparent font-semibold">Premium Flow Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                {data.length > 0 ? (
                  <ComposedChart data={processDataForTrendline()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--brand-gray-700)/30)" />
                    <XAxis 
                      dataKey="market_time" 
                      stroke="hsl(var(--brand-gray-400))"
                      tick={{ fill: "hsl(var(--brand-gray-400))" }}
                      tickFormatter={(value) => showIntraday ? value.split(' ')[1] : value.split(' ')[0]}
                    />
                    <YAxis 
                      yAxisId="premium" 
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
                    {showIntraday && (
                      <YAxis
                        yAxisId="price"
                        orientation="right"
                        stroke="hsl(var(--brand-accent))"
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
                      fill="hsl(var(--brand-accent))"
                      fillOpacity={0.1}
                      stroke="none"
                    />
                    <Legend wrapperStyle={{ color: "hsl(var(--brand-gray-400))" }} />
                    <Line
                      yAxisId="premium"
                      type="monotone"
                      dataKey="cumulative_call_premium"
                      name="Cumulative Call Premium"
                      stroke="hsl(var(--brand-teal))"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      yAxisId="premium"
                      type="monotone"
                      dataKey="cumulative_put_premium"
                      name="Cumulative Put Premium"
                      stroke="hsl(var(--brand-cyan))"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      yAxisId="premium"
                      type="monotone"
                      dataKey="net_premium"
                      name="Net Premium"
                      stroke="hsl(var(--brand-accent))"
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
                          stroke="hsl(var(--brand-teal))"
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
                          stroke="hsl(var(--brand-cyan))"
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
                          stroke="hsl(var(--brand-accent))"
                          strokeWidth={1}
                          dot={false}
                        />
                      </>
                    )}
                  </ComposedChart>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    {insightLoading ? (
                      <span className="text-brand-gray-400 animate-pulse transition-opacity duration-500 tracking-wide text-sm font-medium">Loading data...</span>
                    ) : error ? (
                      <span className="text-red-500/90">No data available</span>
                    ) : (
                      <span className="text-brand-gray-400 tracking-wide text-sm">No premium flow data found</span>
                    )}
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sector Heatmap */}
        <Card className="p-6 bg-brand-navy/30 border-brand-gray-700/50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg bg-gradient-to-r from-brand-teal to-brand-cyan bg-clip-text text-transparent font-semibold">Sector Premium Distribution</CardTitle>
              <div className="flex flex-wrap gap-4">
                {Object.entries(descriptions).map(([sector, description]) => (
                  <TooltipProvider key={sector}>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-sm text-brand-gray-400 hover:text-brand-gray-200 transition-colors">
                          <span className="capitalize">{sector}</span>
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
                  <ComposedChart data={processDataForHeatmap()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--brand-gray-700)/30)" />
                    <XAxis dataKey="sector" stroke="hsl(var(--brand-gray-400))" />
                    <YAxis yAxisId="premium" stroke="hsl(var(--brand-gray-400))"
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
                      stroke="hsl(var(--brand-gray-400))"
                      tick={{ fill: "hsl(var(--brand-gray-400))" }}
                      domain={[0, 1]}
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                    />
                    <Tooltip 
                      content={<CustomTooltip />}
                      contentStyle={{
                        backgroundColor: "hsl(var(--brand-gray-900))",
                        border: "1px solid hsl(var(--brand-gray-700))",
                        color: "hsl(var(--brand-gray-100))"
                      }}
                    />
                    <Area
                      yAxisId="premium"
                      type="monotone"
                      dataKey="volume"
                      fill="hsl(var(--brand-accent))"
                      fillOpacity={0.1}
                      stroke="none"
                    />
                    <Legend wrapperStyle={{ color: "hsl(var(--brand-gray-400))" }} />
                    <Line
                      yAxisId="premium"
                      type="monotone"
                      dataKey="callPremium"
                      name="Call Premium"
                      stroke="hsl(var(--brand-teal))"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="premium"
                      type="monotone"
                      dataKey="putPremium"
                      name="Put Premium"
                      stroke="hsl(var(--brand-cyan))"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="ratio"
                      type="monotone"
                      dataKey="ratio"
                      name="Call/Put Ratio"
                      stroke="hsl(var(--brand-accent))"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                    />
                  </ComposedChart>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    {insightLoading ? (
                      <span className="text-brand-gray-400 animate-pulse transition-opacity duration-500 tracking-wide text-sm font-medium">Loading data...</span>
                    ) : error ? (
                      <span className="text-red-500/90">No data available</span>
                    ) : (
                      <span className="text-brand-gray-400 tracking-wide text-sm">No sector premium data found</span>
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
