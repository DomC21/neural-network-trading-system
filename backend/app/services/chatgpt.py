import os
from typing import Dict, List
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_deep_research_prompt(ticker: str) -> str:
    """Generate a comprehensive research prompt for stock analysis"""
    return f"Analyze {ticker} with comprehensive depth, including technical, fundamental, and macroeconomic factors."

def generate_insight(data: Dict | List, context: Dict) -> str:
    """Generate comprehensive stock analysis using multi-section prompts"""
    if not isinstance(data, dict):
        return "Error: Invalid data format for analysis"
    
    technical = data.get('technical_analysis', {})
    fundamental = data.get('fundamental_analysis', {})
    
    if not technical or not fundamental:
        return "Error: Missing technical or fundamental data"
        
    required_technical = ['price', 'volume', 'rsi', 'macd', 'sma_200']
    required_fundamental = ['company_name', 'sector', 'market_cap', 'pe_ratio']
    
    missing_technical = [k for k in required_technical if k not in technical]
    missing_fundamental = [k for k in required_fundamental if k not in fundamental]
    
    if missing_technical:
        return f"Missing technical metrics: {', '.join(missing_technical)}"
        
    if missing_fundamental:
        return f"Missing fundamental metrics: {', '.join(missing_fundamental)}"
    
    try:
        # Split analysis into focused sections for depth
        sections = []
        
        # Technical Analysis Section
        technical_prompt = (
            f"Analyze {fundamental.get('company_name', 'the stock')} ({context.get('ticker', '')}) technical indicators in detail:\n\n"
            "1. Price Action Analysis (2-3 paragraphs):\n"
            f"   - Current Price: ${technical.get('price', 0):.2f}\n"
            f"   - Trading Range: Support ${technical.get('support', 0):.2f} to Resistance ${technical.get('resistance', 0):.2f}\n"
            f"   - Volume: {technical.get('volume', 0):,.0f} shares\n"
            "   - Historical Price Patterns\n"
            "   - Chart Formations\n\n"
            "2. Momentum Analysis (2-3 paragraphs):\n"
            f"   - RSI: {technical.get('rsi', 0):.1f}\n"
            f"   - MACD: {technical.get('macd', 0):.2f} (Signal: {technical.get('macd_signal', 0):.2f})\n"
            "   - Volume Trends and Accumulation\n"
            "   - Momentum Divergences\n"
            "   - Trend Strength Indicators\n\n"
            "3. Moving Average Analysis (2-3 paragraphs):\n"
            f"   - Short-term: 20-day MA ${technical.get('sma_20', 0):.2f}\n"
            f"   - Medium-term: 50-day MA ${technical.get('sma_50', 0):.2f}\n"
            f"   - Long-term: 200-day MA ${technical.get('sma_200', 0):.2f}\n"
            "   - Moving Average Crossovers\n"
            "   - Price-MA Relationships\n\n"
            "4. Volume Profile (1-2 paragraphs):\n"
            "   - Volume Distribution\n"
            "   - Institutional Activity\n"
            "   - Volume-Price Relationship\n\n"
            "5. Support/Resistance Analysis (1-2 paragraphs):\n"
            "   - Key Price Levels\n"
            "   - Historical Support/Resistance\n"
            "   - Breakout/Breakdown Potential\n\n"
            "Provide specific insights on trend strength, potential reversals, and key technical levels with detailed evidence."
        )

        # Fundamental Analysis Section
        fundamental_prompt = (
            f"Analyze {fundamental.get('company_name', 'the stock')} fundamental metrics in detail:\n\n"
            "1. Company Overview (2-3 paragraphs):\n"
            f"   - Sector: {fundamental.get('sector', 'Unknown')}\n"
            f"   - Market Cap: ${fundamental.get('market_cap', 0)/1e9:.1f}B\n"
            "   - Business Model\n"
            "   - Market Position\n"
            "   - Competitive Advantages\n\n"
            "2. Valuation Analysis (2-3 paragraphs):\n"
            f"   - P/E Ratio: {fundamental.get('pe_ratio', 0):.2f}\n"
            f"   - Forward P/E: {fundamental.get('forward_pe', 0):.2f}\n"
            f"   - Price/Book: {fundamental.get('price_to_book', 0):.2f}\n"
            "   - Industry Comparison\n"
            "   - Historical Valuation\n\n"
            "3. Growth & Profitability (2-3 paragraphs):\n"
            f"   - Revenue Growth: {fundamental.get('revenue_growth', 0)*100:.1f}%\n"
            f"   - Earnings Growth: {fundamental.get('earnings_growth', 0)*100:.1f}%\n"
            f"   - Profit Margins: {fundamental.get('profit_margins', 0)*100:.1f}%\n"
            "   - Growth Drivers\n"
            "   - Market Opportunities\n\n"
            "4. Financial Health (2-3 paragraphs):\n"
            f"   - Debt/Equity: {fundamental.get('debt_to_equity', 0):.1f}%\n"
            "   - Liquidity Metrics\n"
            "   - Cash Flow Analysis\n"
            "   - Capital Structure\n"
            "   - Credit Rating\n\n"
            "5. Investment Risks (2-3 paragraphs):\n"
            "   - Competitive Threats\n"
            "   - Regulatory Environment\n"
            "   - Market Risks\n"
            "   - Financial Risks\n"
            "   - Technology Risks\n\n"
            "Compare all metrics to industry averages and provide specific insights with detailed evidence."
        )

        # Market Context Section
        market_prompt = (
            "Analyze current market conditions and sector trends:\n\n"
            "1. Interest Rate Environment (2-3 paragraphs):\n"
            "   - Impact on Valuation\n"
            "   - Cost of Capital Effects\n"
            "   - Sector Sensitivity\n\n"
            "2. Industry Analysis (2-3 paragraphs):\n"
            "   - Competitive Position\n"
            "   - Market Share Trends\n"
            "   - Industry Growth Rate\n\n"
            "3. Economic Factors (2-3 paragraphs):\n"
            "   - GDP Growth Impact\n"
            "   - Inflation Effects\n"
            "   - Consumer Spending Trends\n\n"
            "4. Global Considerations (2-3 paragraphs):\n"
            "   - International Exposure\n"
            "   - Currency Effects\n"
            "   - Trade Policy Impact\n\n"
            "Provide specific insights on how macro factors affect the company."
        )

        # Generate insights for each section
        for prompt in [technical_prompt, fundamental_prompt, market_prompt]:
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a senior financial analyst providing detailed stock analysis. Focus on specific data points and actionable insights. Use exact numerical values and provide evidence-based analysis."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=1000
            )
            sections.append(response.choices[0].message.content.strip())
        
        # Combine sections with clear separation
        insight = "\n\n".join(sections)
        
        # Generate investment conclusion
        conclusion_prompt = (
            f"Provide investment conclusion for {fundamental.get('company_name', 'the stock')} ({context.get('ticker', '')}):\n\n"
            "1. Overall Rating (1 paragraph):\n"
            f"   - Current Rating: {fundamental.get('recommendation', 'NEUTRAL').upper()}\n"
            f"   - Target Price: ${fundamental.get('target_price', 0):.2f}\n\n"
            "2. Risk Assessment (1-2 paragraphs):\n"
            "   - Technical Risks\n"
            "   - Fundamental Risks\n"
            "   - Market Risks\n\n"
            "3. Action Plan (1-2 paragraphs):\n"
            "   - Entry Points\n"
            "   - Exit Levels\n"
            "   - Position Sizing\n"
            "   - Time Horizon\n\n"
            "Provide specific, actionable recommendations with clear risk/reward parameters."
        )

        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are a senior financial analyst providing investment recommendations. Focus on actionable insights and specific price levels. Consider both technical and fundamental factors."
                },
                {
                    "role": "user",
                    "content": conclusion_prompt
                }
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        # Add conclusion to insights
        insight += "\n\n" + response.choices[0].message.content.strip()
        
        return insight
    except Exception as e:
        return f"Error generating insight: {str(e)}"

# Endpoint-specific prompt templates
CONGRESS_TRADES_PROMPT = """Analyze Congress member trading activity"""
GREEK_FLOW_PROMPT = """Analyze the options Greek flow data"""
EARNINGS_PROMPT = """Analyze earnings reports and market reactions"""
INSIDER_TRADING_PROMPT = """Analyze insider trading patterns and implications"""
PREMIUM_FLOW_PROMPT = """Analyze market-wide premium flow data"""
MARKET_TIDE_PROMPT = """Analyze market-wide trends and sentiment"""
