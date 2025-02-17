import { useState } from 'react'
import { MainLayout } from './components/layout/MainLayout'
import { StockInput } from './components/stock/StockInput'
import { TechnicalAnalysis } from './components/analysis/TechnicalAnalysis'
import { FundamentalAnalysis } from './components/analysis/FundamentalAnalysis'
import { MarketSentiment } from './components/analysis/MarketSentiment'
import { RiskAssessment } from './components/analysis/RiskAssessment'
import { Toaster } from './components/ui/sonner'
import { toast } from 'sonner'
import { TooltipProvider } from './components/ui/tooltip'

function App() {
  interface AnalysisData {
    technical_analysis: {
      price: number;
      volume: number;
      rsi: number;
      macd: number;
      macd_signal: number;
      sma_20: number;
      sma_50: number;
      sma_200: number;
      support: number;
      resistance: number;
      historical_data: Array<{
        Open: number;
        High: number;
        Low: number;
        Close: number;
        Volume: number;
        Dividends: number;
        'Stock Splits': number;
      }>;
    };
    fundamental_analysis: {
      company_name: string;
      sector: string;
      industry: string;
      market_cap: number;
      pe_ratio: number;
      forward_pe: number;
      peg_ratio: number | null;
      price_to_book: number;
      debt_to_equity: number;
      profit_margins: number;
      revenue_growth: number;
      earnings_growth: number;
      recommendation: string;
      target_price: number;
    };
    ai_insight: string;
  }

  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAnalyze = async (ticker: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stock/analysis/${ticker}`)
      if (!response.ok) throw new Error('Failed to fetch analysis')
      const data = await response.json()
      setAnalysisData(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to fetch stock analysis')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async (format: 'csv' | 'json') => {
    if (!analysisData) {
      toast.error('No analysis data to export')
      return
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/stock/analysis/AAPL?export_format=${format}`,
        { 
          headers: { 
            Accept: format === 'csv' ? 'text/csv' : 'application/json',
            'Content-Type': 'application/json'
          }
        }
      )
      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `stock_analysis_${format === 'csv' ? 'AAPL.csv' : 'AAPL.json'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success(`Analysis exported as ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export analysis')
    }
  }

  return (
    <TooltipProvider>
      <MainLayout>
        <StockInput 
          onAnalyze={handleAnalyze}
          onExport={handleExport}
          isLoading={isLoading}
        />
        
        {analysisData && (
          <div className="space-y-6">
            <TechnicalAnalysis data={analysisData.technical_analysis} />
            <FundamentalAnalysis data={analysisData.fundamental_analysis} />
            <MarketSentiment data={{ ai_insight: analysisData.ai_insight }} />
            <RiskAssessment 
              technicalData={analysisData.technical_analysis}
              fundamentalData={analysisData.fundamental_analysis}
            />
          </div>
        )}
        
        <Toaster />
      </MainLayout>
    </TooltipProvider>
  )
}

export default App
