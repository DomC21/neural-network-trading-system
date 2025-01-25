from typing import List, Dict
from datetime import datetime, timedelta
import random

def generate_mock_congress_trades(
    ticker: str = None,
    congress_member: str = None,
    start_date: str = None,
    end_date: str = None
) -> List[Dict]:
    """Generate mock congress trade data for development"""
    tickers = ["AAPL", "TSLA", "GOOGL", "MSFT", "AMZN"]
    members = ["John Smith", "Jane Doe", "Robert Johnson", "Mary Williams"]
    trade_types = ["Buy", "Sell"]
    
    if ticker:
        tickers = [ticker]
    if congress_member:
        members = [congress_member]
        
    base_date = datetime.now() - timedelta(days=30)
    trades = []
    
    for _ in range(20):  # Generate 20 mock trades
        trade_date = (base_date + timedelta(days=random.randint(0, 30))).strftime("%Y-%m-%d")
        
        if start_date and trade_date < start_date:
            continue
        if end_date and trade_date > end_date:
            continue
            
        trades.append({
            "ticker": random.choice(tickers),
            "congress_member": random.choice(members),
            "trade_type": random.choice(trade_types),
            "amount": random.randint(10000, 1000000),
            "trade_date": trade_date,
            "disclosure_date": (datetime.strptime(trade_date, "%Y-%m-%d") + timedelta(days=random.randint(1, 10))).strftime("%Y-%m-%d")
        })
    
    return sorted(trades, key=lambda x: x["trade_date"], reverse=True)
