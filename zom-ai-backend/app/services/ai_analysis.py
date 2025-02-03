from typing import Dict
from openai import AsyncOpenAI
import os
from dotenv import load_dotenv

load_dotenv()

class AIAnalysisService:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
        self.client = AsyncOpenAI(api_key=api_key)

    async def analyze_technical_indicators(self, indicators: Dict) -> str:
        prompt = f"""As a financial expert, analyze these technical indicators:

Technical Indicators:
- RSI: {indicators.get('rsi', 'N/A')}
- MACD: {indicators.get('macd', 'N/A')} (Signal: {indicators.get('macd_signal', 'N/A')}, Hist: {indicators.get('macd_hist', 'N/A')})
- Moving Averages:
  * 10-day: {indicators.get('sma_10', 'N/A')}
  * 50-day: {indicators.get('sma_50', 'N/A')}
  * 200-day: {indicators.get('sma_200', 'N/A')}
- Bollinger Bands:
  * Upper: {indicators.get('bollinger_upper', 'N/A')}
  * Middle: {indicators.get('bollinger_middle', 'N/A')}
  * Lower: {indicators.get('bollinger_lower', 'N/A')}
- Support/Resistance:
  * Support: {indicators.get('support', 'N/A')}
  * Resistance: {indicators.get('resistance', 'N/A')}
- Fibonacci Levels:
  * 23.6%: {indicators.get('fib_236', 'N/A')}
  * 38.2%: {indicators.get('fib_382', 'N/A')}
  * 50.0%: {indicators.get('fib_500', 'N/A')}
  * 61.8%: {indicators.get('fib_618', 'N/A')}

Please provide:
1. Summary (3-5 sentences focused on price action and momentum)
2. Key Signals:
   - Trend Direction (bullish/bearish/neutral)
   - Support/Resistance Analysis
   - Potential Entry/Exit Points
3. Risk Assessment (low/medium/high)"""

        response = await self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a financial expert providing technical analysis."},
                {"role": "user", "content": prompt}
            ]
        )
        if not response.choices or not response.choices[0].message.content:
            return "Unable to generate technical analysis at this time."
        return response.choices[0].message.content

    async def analyze_fundamental_data(self, data: Dict) -> str:
        prompt = f"""As a financial expert, analyze these fundamental metrics:

Company Fundamentals:
- Valuation:
  * P/E Ratio: {data.get('PERatio', 'N/A')}
  * Market Cap: {data.get('MarketCapitalization', 'N/A')}
  * EPS: {data.get('EPS', 'N/A')}
- Financial Health:
  * Debt-to-Equity: {data.get('DebtToEquityRatio', 'N/A')}
  * Profit Margin: {data.get('ProfitMargin', 'N/A')}
- Shareholder Returns:
  * Dividend Yield: {data.get('DividendYield', 'N/A')}
- Market Risk:
  * Beta: {data.get('Beta', 'N/A')}

Please provide:
1. Summary (3-5 sentences focused on company's financial health)
2. Valuation Analysis:
   - Current valuation assessment (undervalued/fair/overvalued)
   - Key metrics comparison with industry standards
3. Risk Assessment:
   - Financial stability
   - Market volatility exposure
4. Investment Outlook:
   - Short-term considerations
   - Long-term growth potential"""

        response = await self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a financial expert providing fundamental analysis."},
                {"role": "user", "content": prompt}
            ]
        )
        if not response.choices or not response.choices[0].message.content:
            return "Unable to generate fundamental analysis at this time."
        return response.choices[0].message.content

    async def analyze_single_metric(self, metric: str, value: str) -> str:
        try:
            print(f"Starting analysis for {metric} with value {value}")
            print(f"Using OpenAI API key: {self.client.api_key[:8]}...")
            
            prompt = f"""You are a financial expert analyzing the {metric} value of {value}.

Please provide a structured analysis in the following format:
1. Brief explanation of what {metric} means and its importance (1-2 sentences)
2. Current value interpretation:
   - Sentiment score (0-100%, where 0% is extremely bearish, 50% is neutral, 100% is extremely bullish)
   - Impact analysis (both short-term and long-term price implications)
3. Supporting evidence or comparative context
4. Actionable insights or trading considerations

Format the response in clear paragraphs with line breaks between sections.
Keep the total response under 200 words and focus on practical implications."""

            print("Sending request to OpenAI API...")
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a financial expert providing specific metric analysis."},
                    {"role": "user", "content": prompt}
                ],
                timeout=15,
                max_tokens=300,
                temperature=0.7
            )
            
            print("Received response from OpenAI API")
            if not response.choices or not response.choices[0].message.content:
                print("Warning: Empty response from OpenAI API")
                return "Unable to generate analysis at this time."
                
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"Error in analyze_single_metric: {str(e)}")
            raise Exception(f"Failed to analyze metric: {str(e)}")
