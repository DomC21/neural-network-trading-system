from typing import Dict, List, Optional
from datetime import datetime, timedelta
import random
from app.services.unusual_whales import make_api_request

async def get_greek_flow(
    ticker: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
) -> Dict:
    """Fetch Greek flow data from Unusual Whales API"""
    try:
        params = {"date": start_date} if start_date else {}
        response = await make_api_request(f"stock/{ticker}/greek-flow", params)
        data = response.get('data', [])
        
        # Filter by date range if provided
        if end_date:
            data = [d for d in data if d['date'] <= end_date]
            
        return {
            "data": data,
            "insight": generate_greek_flow_insight(data)
        }
    except Exception:
        # Fallback to mock data
        return {
            "data": generate_mock_greek_flow(ticker, start_date, end_date),
            "insight": "Using mock data for development"
        }

from .chatgpt import generate_insight, GREEK_FLOW_PROMPT

def generate_greek_flow_insight(data: List[Dict]) -> str:
    """Generate insights for Greek flow data using ChatGPT"""
    if not data:
        return "No recent options Greek data to analyze."
    
    try:
        # Prepare context for ChatGPT
        context = {
            "data_type": "greek_flow",
            "time_range": "recent",
            "additional_context": GREEK_FLOW_PROMPT
        }
        return generate_insight(data, context)
    except Exception:
        # Fallback to basic insight generation
        high_delta_data = sorted(data, key=lambda x: float(x.get('dir_delta_flow', 0)), reverse=True)
        if high_delta_data:
            top_flow = high_delta_data[0]
            flow_value = float(top_flow['dir_delta_flow'])/1000
            sentiment = "bullish" if flow_value > 0 else "bearish"
            return f"High directional delta flow of {abs(flow_value):.1f}k indicates {sentiment} sentiment with potential for sharp price movements."
        
        return "Insufficient data to generate meaningful insights."

def generate_mock_greek_flow(
    ticker: str = None,
    start_date: str = None,
    end_date: str = None
) -> List[Dict]:
    """Generate mock Greek flow data for development"""
    tickers = ["AAPL", "TSLA", "GOOGL", "MSFT", "AMZN"]
    
    if ticker:
        tickers = [ticker]
        
    base_date = datetime.now() - timedelta(days=30)
    data_points = []
    
    for _ in range(30):  # Generate 30 days of data
        current_date = (base_date + timedelta(days=_)).strftime("%Y-%m-%d")
        
        if start_date and current_date < start_date:
            continue
        if end_date and current_date > end_date:
            continue
            
        for ticker in tickers:
            data_points.append({
                "ticker": ticker,
                "date": current_date,
                "dir_delta_flow": str(random.uniform(-100000, 100000)),
                "dir_vega_flow": str(random.uniform(-50000, 50000)),
                "otm_dir_delta_flow": str(random.uniform(-75000, 75000)),
                "otm_dir_vega_flow": str(random.uniform(-25000, 25000)),
                "volume": random.randint(1000, 10000)
            })
    
    return sorted(data_points, key=lambda x: (x["ticker"], x["date"]))

def get_greek_descriptions() -> Dict[str, str]:
    """Get descriptions of Greek metrics for tooltips"""
    return {
        "dir_delta_flow": "Measures the net directional exposure from options trading. Positive values indicate bullish sentiment (calls bought/puts sold), negative values indicate bearish sentiment.",
        "dir_vega_flow": "Measures the net volatility exposure. Positive values indicate expectations of increased volatility, negative values suggest decreased volatility.",
        "otm_dir_delta_flow": "Similar to dir_delta_flow but only considers out-of-the-money options, which can indicate more speculative trading.",
        "otm_dir_vega_flow": "Volatility exposure from out-of-the-money options only, often used to gauge speculative volatility trading."
    }
