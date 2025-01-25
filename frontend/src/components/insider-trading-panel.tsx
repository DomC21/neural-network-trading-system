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
  ResponsiveContainer,
  Tooltip,
  Cell
} from "recharts"
import { MessageSquare } from "lucide-react"
import { Treemap } from "recharts"

interface InsiderTrade {
  sector: string
  ticker: string
  insider_role: string
  trade_type: string
  amount: number
  trade_date: string
  sector_volume: number
}

interface TreemapData {
  name: string
  size: number
  color: string
}

export function InsiderTradingPanel() {
  const [data, setData] = useState<InsiderTrade[]>([])
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [insightLoading, setInsightLoading] = useState(true)
  const [error, setError] = useState("")
  const [insight, setInsight] = useState("")

  const roles = ["CEO", "CFO", "CTO", "Director", "VP"]
  const tradeTypes = [
    { value: "all", label: "All Types" },
    { value: "buy", label: "Buy" },
    { value: "sell", label: "Sell" }
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

  // Fetch insider trading data
  const fetchData = async () => {
    setInsightLoading(true)
    setError("")
    try {
      const params = new URLSearchParams()
      if (selectedRole !== "all") params.append("insider_role", selectedRole)
      if (selectedType !== "all") params.append("trade_type", selectedType)

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/insider-trading/data?${params.toString()}`
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const { data, insight } = await response.json()
      setData(data)
      setInsight(insight)
      setError("")
    } catch (error) {
      console.error("Error fetching insider trading data:", error)
      setError("Failed to fetch insider trading data. Please try again.")
      setInsight("")
    } finally {
      setInsightLoading(false)
    }
  }

  // Process data for treemap
  const processDataForTreemap = (): TreemapData[] => {
    const sectorMap = new Map<string, number>()
    data.forEach((trade) => {
      const current = sectorMap.get(trade.sector) || 0
      sectorMap.set(trade.sector, current + trade.amount)
    })

    return Array.from(sectorMap.entries())
      .map(([sector, volume], index) => ({
        name: sector.charAt(0).toUpperCase() + sector.slice(1),
        size: volume,
        color: `hsl(${index * 60}, 70%, 50%)`
      }))
  }

  // Initial data fetch
  useEffect(() => {
    fetchData()
  }, [selectedRole, selectedType])

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Insider Trading Activity</CardTitle>
            <CardDescription>
              Monitor insider trading patterns across different sectors
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-48">
              <Label htmlFor="role-select">Insider Role</Label>
              <Select
                value={selectedRole}
                onValueChange={setSelectedRole}
              >
                <SelectTrigger id="role-select">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Label htmlFor="type-select">Trade Type</Label>
              <Select
                value={selectedType}
                onValueChange={setSelectedType}
              >
                <SelectTrigger id="type-select">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  {tradeTypes.map((type) => (
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
        {/* Treemap */}
        <Card className="p-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sector Activity Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {data.length > 0 ? (
                  <Treemap
                    data={processDataForTreemap()}
                    dataKey="size"
                    stroke="#fff"
                    fill="hsl(var(--primary))"
                  >
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), 'Trading Volume']}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        color: "hsl(var(--foreground))"
                      }}
                      labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                    />
                    {
                      processDataForTreemap().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                      ))
                    }
                  </Treemap>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    {insightLoading ? "Loading data..." : error ? "No data available" : "No insider trading data found"}
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
                  {error || insight || (insightLoading ? "Analyzing insider trading patterns..." : "No insights available.")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
