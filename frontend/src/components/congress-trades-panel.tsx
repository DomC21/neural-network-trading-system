import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { MessageSquare } from "lucide-react"

interface CongressTrade {
  ticker: string
  congress_member: string
  trade_type: string
  amount: number
  trade_date: string
  disclosure_date: string
}

interface StockSummary {
  ticker: string
  total_amount: number
}

export function CongressTradesPanel() {
  const [trades, setTrades] = useState<CongressTrade[]>([])
  const [insightLoading, setInsightLoading] = useState(true)
  const [insight, setInsight] = useState("")
  const [error, setError] = useState("")
  const [ticker, setTicker] = useState("")
  const [congressMember, setCongressMember] = useState("")
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 1)
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    const date = new Date()
    return date.toISOString().split('T')[0]
  })

  // Fetch trades data
  const fetchTrades = async () => {
    setInsightLoading(true)
    setError("")
    try {
      const params = new URLSearchParams()
      if (ticker) params.append("ticker", ticker)
      if (congressMember) params.append("congress_member", congressMember)
      if (startDate) params.append("start_date", startDate)
      if (endDate) params.append("end_date", endDate)

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/congress/trades?${params.toString()}`
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const { data, insight } = await response.json()
      setTrades(data)
      setInsight(insight)
      setError("")
    } catch (error) {
      console.error("Error fetching trades:", error)
      setError("Failed to fetch trading data. Please try again.")
      setInsight("")
    } finally {
      setInsightLoading(false)
    }
  }

  // Calculate most actively traded stocks for bar chart
  const getTopStocks = (): StockSummary[] => {
    const stockMap = new Map<string, number>()
    trades.forEach((trade) => {
      const current = stockMap.get(trade.ticker) || 0
      stockMap.set(trade.ticker, current + trade.amount)
    })
    return Array.from(stockMap.entries())
      .map(([ticker, total_amount]) => ({ ticker, total_amount }))
      .sort((a, b) => b.total_amount - a.total_amount)
      .slice(0, 5)
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Initial data fetch
  useEffect(() => {
    fetchTrades()
  }, [ticker, congressMember, startDate, endDate])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Congress Trades</CardTitle>
        <CardDescription>
          Track and analyze recent trading activity by members of Congress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-2 sm:px-0">
          <div className="space-y-2 w-full">
            <Label htmlFor="ticker">Stock Ticker</Label>
            <Input
              id="ticker"
              placeholder="e.g. AAPL"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              onBlur={fetchTrades}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="member">Congress Member</Label>
            <Input
              id="member"
              placeholder="Member name"
              value={congressMember}
              onChange={(e) => setCongressMember(e.target.value)}
              onBlur={fetchTrades}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onBlur={fetchTrades}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              onBlur={fetchTrades}
            />
          </div>
        </div>

        {/* Bar Chart */}
        <Card className="p-4">
          <CardHeader>
            <CardTitle className="text-lg">Most Actively Traded Stocks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {trades.length > 0 ? (
                  <BarChart data={getTopStocks()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground)/30)" />
                    <XAxis dataKey="ticker" stroke="hsl(var(--muted-foreground))" />
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
                      formatter={(value: number) => [formatCurrency(value), 'Total Amount']}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        color: "hsl(var(--foreground))"
                      }}
                      labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                    />
                    <Bar dataKey="total_amount" fill="hsl(var(--primary))" />
                  </BarChart>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    {insightLoading ? "Loading data..." : error ? "No data available" : "No trades found"}
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Trades Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticker</TableHead>
                <TableHead>Congress Member</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Trade Date</TableHead>
                <TableHead>Disclosure Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.length > 0 ? (
                trades.map((trade, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{trade.ticker}</TableCell>
                    <TableCell>{trade.congress_member}</TableCell>
                    <TableCell>{trade.trade_type}</TableCell>
                    <TableCell className="text-right">{formatCurrency(trade.amount)}</TableCell>
                    <TableCell>{trade.trade_date}</TableCell>
                    <TableCell>{trade.disclosure_date}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {insightLoading ? (
                      <span className="text-muted-foreground">Loading trades...</span>
                    ) : error ? (
                      <span className="text-destructive">{error}</span>
                    ) : (
                      <span className="text-muted-foreground">No trades found</span>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* ChatGPT Insight Box */}
        <Card className="bg-muted transition-all duration-300 hover:bg-muted/80">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="shrink-0">
                <MessageSquare className={`h-5 w-5 mt-0.5 transition-colors ${insightLoading ? 'animate-pulse text-muted-foreground/70' : error ? 'text-destructive' : 'text-primary'}`} />
              </div>
              <div className="min-h-[2.5rem] flex items-center">
                <p className={`text-sm leading-relaxed ${error ? 'text-destructive' : ''}`}>
                  {error || insight || (insightLoading ? "Analyzing trading patterns..." : "No insights available.")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
