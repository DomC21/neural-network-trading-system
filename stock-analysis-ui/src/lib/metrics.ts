// Metric types and interfaces


export interface MetricExplanation {
  name: string
  description: string
  getContext: (value: number) => string
  getColor?: (value: number) => string
}

export const technicalMetrics: Record<string, MetricExplanation> = {
  rsi: {
    name: 'Relative Strength Index (RSI)',
    description: 'Momentum indicator measuring the speed and magnitude of recent price changes to evaluate overbought or oversold conditions.',
    getContext: (value) => {
      if (value > 70) return 'Currently overbought - potential reversal or consolidation may occur'
      if (value < 30) return 'Currently oversold - potential reversal or accumulation may occur'
      return 'Currently in neutral territory, showing balanced buying and selling pressure'
    },
    getColor: (value) => {
      if (value > 70) return 'text-red-500'
      if (value < 30) return 'text-green-500'
      return 'text-white'
    }
  },
  macd: {
    name: 'Moving Average Convergence Divergence (MACD)',
    description: 'Trend-following momentum indicator showing the relationship between two moving averages of an asset\'s price.',
    getContext: (value) => {
      if (value > 2) return 'Strong bullish momentum - price trending above moving averages'
      if (value < -2) return 'Strong bearish momentum - price trending below moving averages'
      return 'Neutral momentum - price consolidating near moving averages'
    }
  },
  volume: {
    name: 'Trading Volume',
    description: 'Total number of shares traded during a specific period, indicating market activity and liquidity.',
    getContext: (value) => {
      if (value > 1000000) return 'High trading activity indicating strong market interest'
      if (value < 100000) return 'Low trading activity suggesting limited market interest'
      return 'Moderate trading activity with typical market interest'
    }
  },
  support: {
    name: 'Support Level',
    description: 'Price level where a stock tends to stop falling due to concentrated buying interest.',
    getContext: (value) => `Current support level at $${value.toFixed(2)} - watch for bounces or breaks`
  },
  resistance: {
    name: 'Resistance Level',
    description: 'Price level where a stock tends to stop rising due to concentrated selling pressure.',
    getContext: (value) => `Current resistance level at $${value.toFixed(2)} - watch for rejections or breakouts`
  },
  sma_20: {
    name: '20-Day Simple Moving Average',
    description: 'Average closing price over the last 20 trading days, used to identify short-term trends.',
    getContext: (value) => `20-day moving average at $${value.toFixed(2)} - key short-term trend indicator`
  },
  sma_50: {
    name: '50-Day Simple Moving Average',
    description: 'Average closing price over the last 50 trading days, used to identify medium-term trends.',
    getContext: (value) => `50-day moving average at $${value.toFixed(2)} - key medium-term trend indicator`
  },
  sma_200: {
    name: '200-Day Simple Moving Average',
    description: 'Average closing price over the last 200 trading days, used to identify long-term trends.',
    getContext: (value) => `200-day moving average at $${value.toFixed(2)} - key long-term trend indicator`
  }
}

export const fundamentalMetrics: Record<string, MetricExplanation> = {
  pe_ratio: {
    name: 'Price to Earnings (P/E) Ratio',
    description: 'Valuation metric comparing stock price to earnings per share, indicating how much investors are willing to pay for each dollar of earnings.',
    getContext: (value) => {
      if (value > 30) return 'Trading at premium valuation - high growth expectations'
      if (value < 15) return 'Trading at discount valuation - potential value opportunity'
      return 'Trading at average market valuation'
    }
  },
  market_cap: {
    name: 'Market Capitalization',
    description: 'Total market value of a company\'s outstanding shares, indicating company size and risk profile.',
    getContext: (value) => {
      const capInBillions = value / 1e9
      if (capInBillions > 200) return 'Large-cap company - typically more stable'
      if (capInBillions > 10) return 'Mid-cap company - balanced growth and stability'
      return 'Small-cap company - potentially higher growth and risk'
    }
  },
  debt_to_equity: {
    name: 'Debt to Equity Ratio',
    description: 'Financial metric comparing total debt to shareholders\' equity, indicating financial leverage and risk.',
    getContext: (value) => {
      if (value > 200) return 'High leverage - increased financial risk'
      if (value < 50) return 'Low leverage - conservative financial position'
      return 'Moderate leverage - balanced financial position'
    }
  },
  profit_margins: {
    name: 'Profit Margins',
    description: 'Percentage of revenue that translates into profit, indicating operational efficiency and pricing power.',
    getContext: (value) => {
      const percentage = value * 100
      if (percentage > 20) return 'High margins indicating strong competitive advantage'
      if (percentage < 10) return 'Low margins suggesting competitive pressures'
      return 'Average margins indicating stable market position'
    }
  },
  revenue_growth: {
    name: 'Revenue Growth',
    description: 'Year-over-year percentage increase in company revenue, indicating business expansion.',
    getContext: (value) => {
      const percentage = value * 100
      if (percentage > 20) return 'Strong growth indicating market share gains'
      if (percentage < 5) return 'Slow growth suggesting market maturity'
      return 'Moderate growth indicating stable market position'
    }
  },
  earnings_growth: {
    name: 'Earnings Growth',
    description: 'Year-over-year percentage increase in company earnings, indicating profitability trends.',
    getContext: (value) => {
      const percentage = value * 100
      if (percentage > 20) return 'Strong earnings growth indicating improving efficiency'
      if (percentage < 0) return 'Negative earnings growth suggesting operational challenges'
      return 'Moderate earnings growth indicating stable operations'
    }
  }
}
