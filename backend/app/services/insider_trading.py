from typing import Dict, List, Optional
from datetime import datetime, timedelta
import random

def generate_mock_insider_data(
    insider_role: Optional[str] = None,
    trade_type: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
) -> List[Dict]:
    """Generate mock insider trading data for development"""
    sectors = ["tech", "healthcare", "energy", "finance", "consumer", "industrial"]
    roles = ["CEO", "CFO", "CTO", "Director", "VP"]
    trade_types = ["buy", "sell"]
    companies = {
        "tech": ["AAPL", "MSFT", "GOOGL", "META", "NVDA"],
        "healthcare": ["JNJ", "PFE", "UNH", "ABBV", "MRK"],
        "energy": ["XOM", "CVX", "COP", "SLB", "EOG"],
        "finance": ["JPM", "BAC", "GS", "MS", "WFC"],
        "consumer": ["AMZN", "WMT", "PG", "KO", "PEP"],
        "industrial": ["GE", "BA", "CAT", "HON", "MMM"]
    }
    
    if insider_role:
        roles = [insider_role]
    if trade_type:
        trade_types = [trade_type]
        
    base_date = datetime.now() - timedelta(days=30)
    data_points = []
    
    for sector in sectors:
        sector_volume = 0
        for _ in range(random.randint(5, 15)):  # 5-15 trades per sector
            trade_date = (base_date + timedelta(days=random.randint(0, 30))).strftime("%Y-%m-%d")
            
            if start_date and trade_date < start_date:
                continue
            if end_date and trade_date > end_date:
                continue
                
            amount = random.randint(100000, 5000000)
            sector_volume += amount
            
            data_points.append({
                "sector": sector,
                "ticker": random.choice(companies[sector]),
                "insider_role": random.choice(roles),
                "trade_type": random.choice(trade_types),
                "amount": amount,
                "trade_date": trade_date,
                "sector_volume": sector_volume
            })
    
    return sorted(data_points, key=lambda x: x["trade_date"], reverse=True)
