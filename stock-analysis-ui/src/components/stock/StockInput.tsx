import { useState } from "react"
import { Card } from "../ui/card"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Search, Download } from "lucide-react"
import { toast } from "sonner"

interface StockInputProps {
  onAnalyze: (ticker: string) => void
  onExport: (format: 'csv' | 'json') => void
  isLoading?: boolean
}

export function StockInput({ onAnalyze, onExport, isLoading }: StockInputProps) {
  const [ticker, setTicker] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticker) {
      toast.error("Please enter a stock ticker")
      return
    }
    onAnalyze(ticker.toUpperCase())
  }

  return (
    <Card className="p-6 bg-zinc-900 border-gold">
      <form onSubmit={handleSubmit} className="flex gap-4">
        <Input
          type="text"
          placeholder="Enter stock ticker (e.g., AAPL)"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          className="flex-1 bg-black text-white border-gold placeholder:text-gray-500"
        />
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-gold hover:bg-gold/90 text-black"
        >
          <Search className="mr-2 h-4 w-4" />
          Analyze
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onExport('csv')}
            className="border-gold text-gold hover:bg-gold/10"
          >
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onExport('json')}
            className="border-gold text-gold hover:bg-gold/10"
          >
            <Download className="mr-2 h-4 w-4" />
            JSON
          </Button>
        </div>
      </form>
    </Card>
  )
}
