import { useState, useEffect, useCallback } from "react"
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
  const fetchTrades = useCallback(async () => {
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
  }, [ticker, congressMember, startDate, endDate, setInsightLoading, setError, setTrades, setInsight])

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
  }, [ticker, congressMember, startDate, endDate, fetchTrades])

  return (
    <Card className="w-full">
      <CardHeader className="mb-8 px-6">
        <div className="space-y-2">
          <CardTitle className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-brand-teal to-brand-cyan bg-clip-text text-transparent">
            Congress Trades
          </CardTitle>
          <CardDescription className="text-xl text-brand-gray-300 leading-relaxed">
            Track and analyze recent trading activity by members of Congress
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-10 px-6">
        {/* Filters */}
        <Card className="p-6 bg-brand-navy/30 border-brand-gray-700/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold tracking-tight bg-gradient-to-r from-brand-teal to-brand-cyan bg-clip-text text-transparent">Filters</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-3">
                <Label htmlFor="ticker" className="text-brand-gray-200 font-semibold tracking-wide text-sm uppercase">Stock Ticker</Label>
                <Input
              id="ticker"
              placeholder="Enter stock symbol (e.g. AAPL)"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              onBlur={fetchTrades}
              className="bg-brand-gray-900 border-brand-gray-700 text-brand-gray-100 placeholder:text-brand-gray-400 placeholder:text-sm focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 hover:border-brand-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-brand-cyan/5"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="member" className="text-brand-gray-200 font-semibold tracking-wide text-sm uppercase">Congress Member</Label>
            <Input
              id="member"
              placeholder="Search by member name"
              value={congressMember}
              onChange={(e) => setCongressMember(e.target.value)}
              onBlur={fetchTrades}
              className="bg-brand-gray-900 border-brand-gray-700 text-brand-gray-100 placeholder:text-brand-gray-400 placeholder:text-sm focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 hover:border-brand-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-brand-cyan/5"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="start-date" className="text-brand-gray-200 font-semibold tracking-wide text-sm uppercase">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onBlur={fetchTrades}
              className="bg-brand-gray-900 border-brand-gray-700 text-brand-gray-100 focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 hover:border-brand-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-brand-cyan/5"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="end-date" className="text-brand-gray-200 font-semibold tracking-wide text-sm uppercase">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              onBlur={fetchTrades}
              className="bg-brand-gray-900 border-brand-gray-700 text-brand-gray-100 focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 hover:border-brand-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-brand-cyan/5"
            />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="p-6 bg-brand-navy/30 border-brand-gray-700/50 transition-all duration-300 hover:bg-brand-navy/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold tracking-tight bg-gradient-to-r from-brand-teal to-brand-cyan bg-clip-text text-transparent">Most Actively Traded Stocks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                {trades.length > 0 ? (
                  <BarChart data={getTopStocks()}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="hsl(var(--brand-gray-700)/20)" 
                      vertical={false}
                    />
                    <XAxis 
                      dataKey="ticker" 
                      stroke="hsl(var(--brand-gray-400))"
                      tick={{ 
                        fill: "hsl(var(--brand-gray-200))",
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: '0.05em'
                      }}
                      tickLine={{ stroke: "hsl(var(--brand-gray-700))" }}
                      axisLine={{ stroke: "hsl(var(--brand-gray-700))" }}
                      tickFormatter={(value) => value.toUpperCase()}
                    />
                    <YAxis 
                      stroke="hsl(var(--brand-gray-400))"
                      tick={{ 
                        fill: "hsl(var(--brand-gray-200))",
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: '0.05em'
                      }}
                      tickLine={{ stroke: "hsl(var(--brand-gray-700))" }}
                      axisLine={{ stroke: "hsl(var(--brand-gray-700))" }}
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
                        backgroundColor: "hsl(var(--brand-navy))",
                        border: "1px solid hsl(var(--brand-gray-700))",
                        color: "hsl(var(--brand-gray-100))",
                        backdropFilter: "blur(8px)",
                        borderRadius: "0.75rem",
                        padding: "0.75rem 1rem",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        fontSize: "0.875rem",
                        letterSpacing: "0.025em"
                      }}
                      labelStyle={{ 
                        color: "hsl(var(--brand-gray-400))", 
                        marginBottom: "0.5rem", 
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase"
                      }}
                    />
                    <Bar 
                      dataKey="total_amount" 
                      fill="hsl(var(--brand-teal))"
                      radius={[4, 4, 0, 0]}
                      className="transition-all duration-300 cursor-pointer"
                      onMouseOver={(_data, index) => {
                        // Add hover effect with scale transform and glow
                        const bar = document.querySelector(`[dataKey="total_amount"][index="${index}"]`) as HTMLElement;
                        if (bar) {
                          bar.setAttribute('fill', 'hsl(var(--brand-cyan))');
                          bar.style.transform = 'scaleY(1.05) translateY(-2px)';
                          bar.style.transformOrigin = 'bottom';
                          bar.style.filter = 'drop-shadow(0 0 12px hsl(var(--brand-cyan)/40))';
                          bar.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                        }
                      }}
                      onMouseOut={(_data, index) => {
                        // Reset to original state with smooth transition
                        const bar = document.querySelector(`[dataKey="total_amount"][index="${index}"]`) as HTMLElement;
                        if (bar) {
                          bar.setAttribute('fill', 'hsl(var(--brand-teal))');
                          bar.style.transform = 'scaleY(1) translateY(0)';
                          bar.style.filter = 'none';
                          bar.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                        }
                      }}
                    />
                  </BarChart>
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center space-y-2">
                    {insightLoading ? (
                      <div className="flex flex-col items-center space-y-4">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-gradient-to-r from-brand-teal to-brand-cyan rounded-full animate-bounce [animation-delay:-0.3s] shadow-lg shadow-brand-cyan/20"></div>
                          <div className="w-2 h-2 bg-gradient-to-r from-brand-teal to-brand-cyan rounded-full animate-bounce [animation-delay:-0.15s] shadow-lg shadow-brand-cyan/20"></div>
                          <div className="w-2 h-2 bg-gradient-to-r from-brand-teal to-brand-cyan rounded-full animate-bounce shadow-lg shadow-brand-cyan/20"></div>
                        </div>
                        <span className="text-brand-gray-400 animate-pulse transition-opacity duration-500 tracking-wide text-sm font-medium">Loading market data...</span>
                      </div>
                    ) : error ? (
                      <div className="flex items-center justify-center space-x-3 text-red-500/90 bg-red-500/5 px-4 py-3 rounded-lg border border-red-500/10">
                        <span className="animate-pulse text-lg">⚠</span>
                        <span className="font-medium">{error}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <span className="text-brand-gray-300 font-medium tracking-wide">No trades found</span>
                        <span className="text-brand-gray-400 text-sm tracking-wide">Try adjusting your filter criteria</span>
                      </div>
                    )}
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Trades Table */}
        <Card className="p-6 bg-brand-navy/30 border-brand-gray-700/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold tracking-tight bg-gradient-to-r from-brand-teal to-brand-cyan bg-clip-text text-transparent">Recent Congress Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-brand-gray-700/50 hover:bg-transparent">
                  <TableHead className="text-brand-gray-200 font-bold text-sm uppercase tracking-wider transition-colors hover:text-brand-gray-100">Ticker</TableHead>
                  <TableHead className="text-brand-gray-200 font-bold text-sm uppercase tracking-wider transition-colors hover:text-brand-gray-100">Congress Member</TableHead>
                  <TableHead className="text-brand-gray-200 font-bold text-sm uppercase tracking-wider transition-colors hover:text-brand-gray-100">Type</TableHead>
                  <TableHead className="text-right text-brand-gray-200 font-bold text-sm uppercase tracking-wider transition-colors hover:text-brand-gray-100">Amount</TableHead>
                  <TableHead className="text-brand-gray-200 font-bold text-sm uppercase tracking-wider transition-colors hover:text-brand-gray-100">Trade Date</TableHead>
                  <TableHead className="text-brand-gray-200 font-bold text-sm uppercase tracking-wider transition-colors hover:text-brand-gray-100">Disclosure Date</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {trades.length > 0 ? (
                trades.map((trade, index) => (
                  <TableRow 
                    key={index} 
                    className="border-b border-brand-gray-700/50 transition-all duration-300 hover:bg-brand-navy/40 hover:shadow-lg hover:shadow-brand-cyan/5 group"
                  >
                    <TableCell className="font-medium tracking-wide text-brand-gray-100 group-hover:text-brand-cyan transition-colors">{trade.ticker}</TableCell>
                    <TableCell className="text-brand-gray-200 group-hover:text-brand-gray-100 transition-colors tracking-wide">{trade.congress_member}</TableCell>
                    <TableCell className="text-brand-gray-200 group-hover:text-brand-gray-100 transition-colors tracking-wide uppercase text-sm">{trade.trade_type}</TableCell>
                    <TableCell className="text-right text-brand-gray-200 group-hover:text-brand-gray-100 transition-colors font-medium">{formatCurrency(trade.amount)}</TableCell>
                    <TableCell className="text-brand-gray-200 group-hover:text-brand-gray-100 transition-colors text-sm">{trade.trade_date}</TableCell>
                    <TableCell className="text-brand-gray-200 group-hover:text-brand-gray-100 transition-colors text-sm">{trade.disclosure_date}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      {insightLoading ? (
                        <div className="flex flex-col items-center space-y-4">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-gradient-to-r from-brand-teal to-brand-cyan rounded-full animate-bounce [animation-delay:-0.3s] shadow-lg shadow-brand-cyan/20"></div>
                            <div className="w-2 h-2 bg-gradient-to-r from-brand-teal to-brand-cyan rounded-full animate-bounce [animation-delay:-0.15s] shadow-lg shadow-brand-cyan/20"></div>
                            <div className="w-2 h-2 bg-gradient-to-r from-brand-teal to-brand-cyan rounded-full animate-bounce shadow-lg shadow-brand-cyan/20"></div>
                          </div>
                          <span className="text-brand-gray-400 animate-pulse transition-opacity duration-500 tracking-wide text-sm font-medium">Loading trades...</span>
                        </div>
                      ) : error ? (
                        <div className="flex items-center justify-center space-x-3 text-red-500/90 bg-red-500/5 px-4 py-3 rounded-lg border border-red-500/10">
                          <span className="animate-pulse text-lg">⚠</span>
                          <span className="font-medium tracking-wide text-sm">{error}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <span className="text-brand-gray-300 font-medium tracking-wide">No trades found</span>
                          <span className="text-brand-gray-400 text-sm tracking-wide">Try adjusting your filter criteria</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </CardContent>
        </Card>

        {/* ChatGPT Insight Box */}
        <Card className="bg-brand-navy/30 border-brand-gray-700/50 transition-all duration-300 hover:bg-brand-navy/40 hover:shadow-lg hover:shadow-brand-cyan/5">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="shrink-0">
                <MessageSquare className={`h-5 w-5 mt-0.5 transition-all duration-300 ${
                  insightLoading 
                    ? 'animate-pulse text-brand-gray-400' 
                    : error 
                    ? 'text-red-500 animate-pulse' 
                    : 'text-brand-gold hover:text-brand-cyan hover:scale-110'
                }`} />
              </div>
              <div className="min-h-[2.5rem] flex items-center">
                <p className={`text-sm leading-relaxed tracking-wide transition-colors duration-300 ${
                  error 
                    ? 'text-red-500 font-medium' 
                    : 'text-brand-gray-200 group-hover:text-brand-gray-100'
                }`}>
                  {error || insight || (insightLoading ? (
                    <span className="text-brand-gray-400 animate-pulse tracking-wide text-sm font-medium">Analyzing trading patterns...</span>
                  ) : (
                    <span className="text-brand-gray-400 tracking-wide text-sm">No insights available</span>
                  ))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
