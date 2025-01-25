from typing import Dict, List, Optional
from datetime import datetime, timedelta
import random

def generate_mock_earnings_data(
    sector: Optional[str] = None,
    surprise_type: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
) -> List[Dict]:
    """Generate mock earnings data for development"""
    companies = {
        "tech": ["AAPL", "MSFT", "GOOGL", "META", "NVDA"],
        "healthcare": ["JNJ", "PFE", "UNH", "ABBV", "MRK"],
        "energy": ["XOM", "CVX", "COP", "SLB", "EOG"],
        "finance": ["JPM", "BAC", "GS", "MS", "WFC"]
    }
    
    base_date = datetime.now() - timedelta(days=30)
    data_points = []
    
    sectors = [sector] if sector else list(companies.keys())
    
    for _ in range(50):  # Generate 50 earnings reports
        current_sector = random.choice(sectors)
        ticker = random.choice(companies[current_sector])
        earnings_surprise = round(random.uniform(-0.5, 0.5), 2)  # -50% to +50%
        price_movement = round(random.uniform(-0.15, 0.15), 2)  # -15% to +15%
        
        if surprise_type == "positive" and earnings_surprise < 0:
            continue
        if surprise_type == "negative" and earnings_surprise > 0:
            continue
            
        report_date = (base_date + timedelta(days=random.randint(0, 30))).strftime("%Y-%m-%d")
        
        if start_date and report_date < start_date:
            continue
        if end_date and report_date > end_date:
            continue
            
        data_points.append({
            "ticker": ticker,
            "sector": current_sector,
            "earnings_surprise": earnings_surprise,
            "price_movement": price_movement,
            "report_date": report_date,
            "market_cap": random.randint(1000000000, 2000000000000)  # $1B to $2T
        })
    
    return sorted(data_points, key=lambda x: x["report_date"], reverse=True)
