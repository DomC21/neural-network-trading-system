
import { Card } from "../ui/card"

interface MarketSentimentProps {
  data: {
    ai_insight: string
  }
}

export const MarketSentiment = ({ data }: MarketSentimentProps) => {
  return (
    <Card className="p-6 bg-zinc-900 border-gold">
      <h2 className="text-xl font-semibold text-gold mb-4">Market Sentiment & Macroeconomic Analysis</h2>
      <div className="prose prose-invert">
        <p className="text-white whitespace-pre-wrap">{data.ai_insight}</p>
      </div>
    </Card>
  )
}
