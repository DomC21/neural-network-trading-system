import { useState } from 'react'
import { MainLayout } from './components/layout/MainLayout'
import { StockInput } from './components/stock/StockInput'
import { TechnicalAnalysis } from './components/analysis/TechnicalAnalysis'
import { FundamentalAnalysis } from './components/analysis/FundamentalAnalysis'
import { MarketSentiment } from './components/analysis/MarketSentiment'
import { RiskAssessment } from './components/analysis/RiskAssessment'
import { Toaster } from './components/ui/sonner'
import { toast } from 'sonner'

function App() {
  const [analysisData, setAnalysisData] = useState<any>(null)
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
    if (!analysisData) return
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/stock/analysis/${analysisData.ticker}?export_format=${format}`,
        { headers: { Accept: format === 'csv' ? 'text/csv' : 'application/json' } }
      )
      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `stock_analysis.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export analysis')
    }
  }

  return (
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
          <MarketSentiment data={analysisData} />
          <RiskAssessment 
            technicalData={analysisData.technical_analysis}
            fundamentalData={analysisData.fundamental_analysis}
          />
        </div>
      )}
      
      <Toaster />
    </MainLayout>
  )
}

export default App
