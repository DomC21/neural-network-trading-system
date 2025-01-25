from typing import Dict, List, Optional
from datetime import datetime
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_insight(data: Dict | List, context: Dict) -> str:
    """Generate insights using ChatGPT based on data and context"""
    
    # Format historical high and timing if available
    prefix_parts = []
    
    # Get required phrases and context
    required_phrases = context.get("required_phrases", {})
    is_intraday = context.get("is_intraday", False)
    latest_time = context.get("latest_time", "")
    
    # Always include historical high
    if "historical_high" in required_phrases:
        prefix_parts.append(required_phrases["historical_high"])
    elif isinstance(data, dict) and "historical_high" in data:
        prefix_parts.append(f"30-day High: ${data['historical_high']/1000000:.1f}M")
    else:
        # Ensure we always have a historical high reference
        prefix_parts.append("30-day High: $0.0M")
    
    # Add intraday timestamp if available
    if is_intraday:
        if not latest_time:
            latest_time = datetime.now().strftime("%H:%M ET")
        elif " ET" not in latest_time:
            latest_time = f"{latest_time} ET"
        prefix_parts.append(f"As of {latest_time}")
        # Add intraday reference to required phrases
        if "net_premium" in required_phrases and "minute-by-minute" not in required_phrases["net_premium"]:
            required_phrases["net_premium"] += " showing minute-by-minute momentum"
    
    prefix = ". ".join(prefix_parts) + ". " if prefix_parts else ""
    
    # Ensure required phrases are present in context
    context["required_phrases"] = required_phrases
    
    # Base prompt template
    base_prompt = f"""You are a senior financial analyst specializing in institutional trading patterns and market sentiment analysis. Generate a comprehensive, actionable insight that MUST follow these exact requirements.

    Context:
    - Data Type: {context.get("data_type", "financial data")}
    - Time Range: {context.get("time_range", "recent")}
    - View Type: {context.get("view_type", "standard")}
    - Historical Context: {context.get("historical_context", "No historical data available")}
    - Additional Context: {context.get("additional_context", "")}
    
    Required Phrases (MUST use EXACTLY as provided):
    - Historical High: {context.get("required_phrases", {}).get("historical_high", "30-day High: $0.0M")}
    - Current Metrics: {context.get("required_phrases", {}).get("current_metrics", "")}
    - Sector Lead: {context.get("required_phrases", {}).get("sector_lead", "")}
    - Net Premium: {context.get("required_phrases", {}).get("net_premium", "")}
    
    Data:
    {str(data)}
    
    MANDATORY FORMAT:
    1. Start with historical reference EXACTLY as provided
    2. For intraday data, include timestamp with "ET" timezone
    3. Include ALL required phrases in order
    4. For intraday analysis, use "minute-by-minute" or "intraday" terminology

    Example Format:
    "30-day High: $15.2M. As of 14:30 ET: Tech sector leads with $5.2M net call premium, representing 65% of 30-day High. Minute-by-minute analysis shows strong accumulation patterns in semiconductors, with adjacent sector pairs showing correlated bullish activity. Net premium change of $8.5M over the analyzed period indicates sustained institutional interest."

    CRITICAL REQUIREMENTS:
    - MUST start with the exact historical high phrase provided
    - For intraday data:
      * MUST include "ET" in timestamp
      * MUST use "minute-by-minute" or "intraday" terminology
    - Use exact dollar amounts (e.g., "$5.2M")
    - Include ALL required phrases in order
    - Keep total response under 100 words
    
    Requirements:
    - Use exact dollar amounts for flows over $1M (e.g., "$5.2M net call premium")
    - Include specific percentages and ratios (e.g., "65% above 30-day average")
    - For intraday data:
      * Note timing of significant swings
      * Track accumulation patterns
      * Highlight unusual volume spikes
    - For sector analysis:
      * Compare relative strengths
      * Note sector rotation patterns
      * Identify consensus moves
    - Always highlight divergences from historical patterns
    - Keep insights actionable and specific
    """
    
    # Get required phrases and context
    required_phrases = context.get("required_phrases", {})
    is_intraday = context.get("is_intraday", False)
    latest_time = context.get("latest_time", "")
    
    # Ensure historical high is present
    if "historical_high" not in required_phrases:
        if isinstance(data, dict) and "historical_high" in data:
            required_phrases["historical_high"] = f"30-day High: ${data['historical_high']/1000000:.1f}M"
        else:
            required_phrases["historical_high"] = "30-day High: $0.0M"
    
    # Build template with required phrases
    template_parts = []
    
    # Always start with historical high
    template_parts.append(required_phrases["historical_high"])
    
    # Add intraday timestamp if available
    if is_intraday:
        if latest_time and "ET" not in latest_time:
            latest_time = f"{latest_time} ET"
        template_parts.append(f"As of {latest_time}")
    
    # Add current metrics
    if "current_metrics" in required_phrases:
        template_parts.append(required_phrases["current_metrics"])
    
    # Add sector lead
    if "sector_lead" in required_phrases:
        template_parts.append(required_phrases["sector_lead"])
    
    # Add net premium change with intraday reference
    if "net_premium" in required_phrases:
        net_premium = required_phrases["net_premium"]
        if is_intraday and "minute-by-minute" not in net_premium:
            net_premium += " showing minute-by-minute momentum"
        template_parts.append(net_premium)
    
    # Combine template parts
    template = ". ".join(template_parts) + "."
    
    # Example format for reference
    example = """Example format that MUST be followed:
    "{historical_high}. As of {latest_time}: {current_metrics}. {sector_lead}. {net_premium} showing minute-by-minute momentum."
    """
    
    # Prepare prompt with template and data
    prompt = f"""You MUST follow this EXACT template for your response:
    {template}
    
    {example}
    
    Additional Requirements:
    - Use EXACT phrases as provided
    - For intraday data, include "ET" in timestamps
    - Use "minute" or "intraday" for intraday analysis
    - Keep response focused and concise
    
    Context:
    - Data Type: {context.get("data_type", "financial data")}
    - Time Range: {context.get("time_range", "recent")}
    - View Type: {context.get("view_type", "standard")}
    - Historical Context: {context.get("historical_context", "No historical data available")}
    - Additional Context: {context.get("additional_context", "")}
    
    Data to Analyze:
    {str(data)}"""
    
    try:
        # Generate insight using ChatGPT
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": """You are a senior financial analyst. Your insights MUST follow this EXACT format and requirements:

CRITICAL FORMAT REQUIREMENTS:
1. MUST START with historical high reference: "30-day High: $X.XM"
2. For intraday data:
   - MUST include "As of HH:MM ET" timestamp
   - MUST use phrase "minute-by-minute" (not "intraday")
   - MUST include "showing minute-by-minute momentum"

Required Elements (in exact order):
1. Historical High (MUST be first): Use EXACTLY as provided
2. Timestamp (for intraday): "As of HH:MM ET"
3. Current Metrics: Use EXACTLY as provided
4. Sector Lead: Use EXACTLY as provided
5. Net Premium Change: Use EXACTLY as provided with "showing minute-by-minute momentum" for intraday data

Example Format:
"30-day High: $15.2M. As of 14:30 ET: Tech sector leads with $5.2M net call premium, representing 65% of 30-day high. Minute-by-minute analysis shows strong accumulation in semiconductors. Net premium change of $8.5M showing minute-by-minute momentum."

CRITICAL: Your response MUST:
1. START with the exact historical high phrase
2. Include ALL required phrases in exact order
3. Use "minute-by-minute" (not "intraday") terminology
4. Include "ET" in all timestamps
"""},
                {"role": "user", "content": prompt},
                {"role": "assistant", "content": "I understand I must explicitly mention '30-day High' metrics and include ET timestamps for intraday data in my analysis."}
            ],
            temperature=0.3,  # Lower temperature for more consistent formatting
            max_tokens=400
        )
        
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Error generating insight: {str(e)}"

# Endpoint-specific prompt templates
CONGRESS_TRADES_PROMPT = """Analyze Congress member trading activity with special focus on:

1. Million-Dollar Transactions:
   - Identify and quantify all trades >$1M with exact amounts
   - Track member-specific large position changes
   - Note timing of major transactions relative to market events
   - Calculate net position changes for top traders

2. Member Analysis:
   - Identify members with largest total trading volume
   - Calculate buy/sell ratios for active members
   - Track multi-stock trading strategies
   - Note coordinated trading patterns across members

3. Sector Impact:
   - Calculate net flows by sector
   - Identify sector rotation patterns
   - Track unusual sector concentrations
   - Note consensus moves among multiple members

Requirements:
- First sentence must state the largest transaction(s) with exact dollar amount and member name
- Second sentence must provide sector-level insight and clear trading recommendation
- Use precise amounts for trades over $1M (e.g., "$5.2M AAPL sale by Pelosi")
- Keep total response under 75 words"""

GREEK_FLOW_PROMPT = """Analyze the options Greek flow data, focusing on:

1. Delta Flow Analysis:
   - Calculate net directional exposure (calls vs puts)
   - Identify stocks with highest absolute delta flow
   - Note any significant changes in flow direction

2. Volatility Exposure:
   - Measure net vega exposure across sectors
   - Compare OTM vs ITM option activity
   - Flag unusual volatility positioning

3. Trading Patterns:
   - Calculate volume-weighted average strike prices
   - Identify clustering of similar positions
   - Note any significant hedging activity

Provide a concise insight focusing on:
1. The most significant Greek flow metric and its magnitude
2. Whether the positioning suggests directional or volatility trades
3. Specific implications for price movement risk"""

EARNINGS_PROMPT = """Analyze earnings reports and market reactions, focusing on:

1. Earnings Performance:
   - Calculate average earnings surprise percentage
   - Identify sectors with highest beat/miss rates
   - Compare actual vs expected results

2. Price Impact Analysis:
   - Measure average price movement post-earnings
   - Calculate correlation between surprise and price change
   - Identify outlier reactions

3. Sector Patterns:
   - Compare sector-specific performance trends
   - Note any sector rotation implications
   - Flag unusual price reaction patterns

Provide a concise insight focusing on:
1. The most significant earnings trend by sector
2. Correlation between surprises and price movements
3. Actionable trading opportunities around earnings"""

INSIDER_TRADING_PROMPT = """Analyze insider trading patterns, focusing on:

1. Transaction Analysis:
   - Calculate net buying/selling by insider role
   - Identify clusters of similar transactions
   - Compare transaction sizes to historical averages

2. Sector Patterns:
   - Measure net insider sentiment by sector
   - Identify sectors with unusual activity
   - Note any sector rotation signals

3. Timing Analysis:
   - Flag unusual timing patterns
   - Compare to market events/earnings
   - Note any correlation with price movements

Provide a concise insight focusing on:
1. The most significant insider trading pattern
2. Key sectors or companies with notable activity
3. Actionable implications for investors"""

PREMIUM_FLOW_PROMPT = """Analyze market-wide premium flow, focusing on:

1. Flow Analysis:
   - Calculate net premium flow by sector
   - Compare call vs put premium ratios
   - Track minute-by-minute changes (for intraday data)
   - Monitor daily accumulation patterns (for daily data)
   - Identify unusual volume/premium patterns

2. Historical Context:
   - Compare current flows to historical ranges
   - Note when metrics exceed historical thresholds
   - Track trend changes vs historical patterns
   - Flag divergences from typical behavior

3. Sector Activity:
   - Rank sectors by total premium flow
   - Note significant changes in sentiment
   - Flag unusual concentration patterns
   - Compare sector rotation patterns

4. Market Implications:
   - Evaluate overall market sentiment
   - Identify potential sector rotation
   - Note any hedging patterns
   - Project short-term directional bias

Required Format:
1. Start with "30-day High: $X.XM" using the highest premium value from historical data
2. For intraday data, include timestamp in ET (e.g., "As of 14:30 ET:")
3. Then provide analysis in 2-3 sentences:
   - First sentence: State the largest premium flow with exact amount and timing
   - Second sentence: Compare to historical patterns and thresholds
   - Third sentence: Explain potential catalysts and provide clear trading recommendation

Example:
"30-day High: $15.2M. As of 14:30 ET: Tech sector leads with $5.2M net call premium, representing 65% of 30-day high. This surge in premium flow suggests institutional accumulation, with adjacent sector pairs showing correlated bullish activity. Potential catalyst from upcoming semiconductor earnings could drive further upside in tech names."
"""

MARKET_TIDE_PROMPT = """Analyze market-wide sentiment and flow, focusing on:

1. Flow Analysis:
   - Calculate net premium flow direction
   - Compare institutional vs retail activity
   - Identify significant volume patterns
   - Track minute-by-minute changes (for intraday data)
   - Monitor daily accumulation patterns (for daily data)

2. Time-Based Patterns:
   - For minute data:
     * Identify intraday momentum shifts
     * Note volume spikes and timing
     * Track premium accumulation rate changes
     * Flag unusual divergences between calls/puts
     * Compare to previous intraday sessions
   - For daily data:
     * Monitor multi-day trends
     * Track institutional positioning changes
     * Note market structure shifts
     * Compare to historical ranges
     * Identify trend acceleration/deceleration

3. Historical Context:
   - Compare current flows to 30-day ranges
   - Note when metrics exceed historical thresholds
   - Track trend changes vs historical patterns
   - Flag divergences from typical behavior
   - Identify potential regime changes

4. Market Implications:
   - Evaluate overall market sentiment
   - Identify potential trend changes
   - Flag risk factors
   - Project short-term price movement potential
   - Provide specific entry/exit levels

Provide a concise insight focusing on:
1. First sentence: State the largest flow with exact amount and timing (e.g., "$5.2M net call premium surge at 14:30 ET")
2. Second sentence: Compare to historical patterns and thresholds
3. Third sentence: Explain potential catalysts and provide clear trading recommendation"""
