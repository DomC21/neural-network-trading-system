from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import random
import pytz

def get_historical_stats(data: List[Dict], lookback_days: int = 30) -> Dict:
    """Calculate historical statistics for premium flow data"""
    # Convert lookback_days to date threshold
    threshold_date = (datetime.now() - timedelta(days=lookback_days)).strftime("%Y-%m-%d")
    
    # Filter data within lookback period
    historical_data = [d for d in data if d["date"] >= threshold_date]
    
    if not historical_data:
        return {
            "max_call_premium": 0,
            "min_call_premium": 0,
            "max_put_premium": 0,
            "min_put_premium": 0,
            "avg_daily_volume": 0,
            "highest_volume_date": None
        }
    
    # Calculate statistics
    call_data = [d for d in historical_data if d["option_type"] == "call"]
    put_data = [d for d in historical_data if d["option_type"] == "put"]
    
    stats = {
        "max_call_premium": max([d["premium"] for d in call_data], default=0),
        "min_call_premium": min([d["premium"] for d in call_data], default=0),
        "max_put_premium": max([d["premium"] for d in put_data], default=0),
        "min_put_premium": min([d["premium"] for d in put_data], default=0),
        "avg_daily_volume": sum(d["volume"] for d in historical_data) / len(set(d["date"] for d in historical_data)),
        "highest_volume_date": max(historical_data, key=lambda x: x["volume"])["date"]
    }
    
    return stats

def generate_mock_premium_flow(
    option_type: Optional[str] = None,
    sector: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    lookback_days: int = 30,
    is_intraday: bool = False
) -> Tuple[List[Dict], Dict]:
    """Generate mock premium flow data for development"""
    sectors = ["tech", "healthcare", "energy", "finance", "consumer", "industrial"]
    option_types = ["call", "put"]
    
    if sector:
        sectors = [sector]
    if option_type:
        option_types = [option_type]
        
    # Set base date based on input parameters or default to 30 days ago
    if start_date:
        base_date = datetime.strptime(start_date, "%Y-%m-%d")
    else:
        base_date = datetime.now() - timedelta(days=30)
    
    data_points = []
    
    # Generate historical data for each sector
    for current_sector in sectors:
        base_premium = random.randint(1000000, 5000000)  # Base premium for the sector
        
        if is_intraday:
            # Generate minute-by-minute data for trading day
            for minute in range(0, 390, 1):  # Trading day minutes (6.5 hours)
                timestamp = base_date.replace(hour=9, minute=30) + timedelta(minutes=minute)
                date = timestamp.strftime("%Y-%m-%d")
                
                # Filter dates based on range
                if start_date and date < start_date:
                    continue
                if end_date and date > end_date:
                    continue
                
                # Add some randomness to premiums with intraday patterns
                for current_type in option_types:
                    # Add some intraday patterns (higher volume at open/close)
                    time_factor = 1.0
                    if minute < 30:  # First 30 minutes
                        time_factor = 1.5
                    elif minute > 360:  # Last 30 minutes
                        time_factor = 1.3
                    
                    premium = base_premium * time_factor * (1 + random.uniform(-0.2, 0.2))
                    volume = int(random.randint(1000, 10000) * time_factor)
                    
                    # Convert to NY timezone for market time
                    market_time = timestamp.astimezone(pytz.timezone("America/New_York"))
                    data_points.append({
                        "sector": current_sector,
                        "option_type": current_type,
                        "premium": premium,
                        "volume": volume,
                        "date": date,
                        "timestamp": timestamp.strftime("%Y-%m-%dT%H:%M:%SZ"),
                        "market_time": market_time.strftime("%Y-%m-%d %H:%M:%S ET"),
                        "avg_strike": random.randint(50, 500),
                        "avg_expiry_days": random.randint(7, 90)
                    })
        else:
            # Generate daily data
            for day in range(30):  # 30 days of data
                date = (base_date + timedelta(days=day)).strftime("%Y-%m-%d")
                
                # Filter dates based on range
                if start_date and date < start_date:
                    continue
                if end_date and date > end_date:
                    continue
                    
                # Add some randomness to premiums
                for current_type in option_types:
                    premium = base_premium * (1 + random.uniform(-0.2, 0.2))  # ±20% variation
                    volume = random.randint(1000, 10000)
                    
                    data_points.append({
                        "sector": current_sector,
                        "option_type": current_type,
                        "premium": premium,
                        "volume": volume,
                        "date": date,
                        "avg_strike": random.randint(50, 500),
                        "avg_expiry_days": random.randint(7, 90)
                    })
            
            # Randomly adjust base premium for next day
            base_premium *= (1 + random.uniform(-0.05, 0.05))  # ±5% daily change
    
    # Sort data points by date and time if available
    sorted_data = sorted(data_points, key=lambda x: (x["date"], x.get("time", "00:00:00")))
    
    # Calculate historical statistics
    historical_stats = get_historical_stats(sorted_data, lookback_days)
    
    # Add cumulative calculations
    cumulative_data = []
    call_sum = 0
    put_sum = 0
    
    for point in sorted_data:
        if point["option_type"] == "call":
            call_sum += point["premium"]
            cumulative_call = call_sum
            cumulative_put = put_sum
        else:
            put_sum += point["premium"]
            cumulative_call = call_sum
            cumulative_put = put_sum
            
        # Create market_time based on whether data is intraday
        if "time" in point:
            market_time = datetime.strptime(f"{point['date']} {point['time']}", "%Y-%m-%d %H:%M:%S")
        else:
            market_time = datetime.strptime(point["date"], "%Y-%m-%d")
        
        # Convert to NY timezone
        market_time = market_time.replace(tzinfo=pytz.UTC).astimezone(pytz.timezone("America/New_York"))
        
        # Calculate net premium and volume metrics
        net_premium = cumulative_call - cumulative_put
        net_volume = point["volume"] if point["option_type"] == "call" else -point["volume"]
        
        cumulative_data.append({
            **point,
            "cumulative_call_premium": cumulative_call,
            "cumulative_put_premium": cumulative_put,
            "net_premium": net_premium,
            "net_volume": net_volume,
            "market_time": market_time.strftime("%Y-%m-%d %H:%M:%S ET")
        })
    
    return cumulative_data, historical_stats

def get_sector_descriptions() -> Dict[str, str]:
    """Get descriptions of sectors for tooltips"""
    return {
        "tech": "Technology sector including software, hardware, and semiconductor companies",
        "healthcare": "Healthcare sector including pharmaceuticals, biotech, and medical devices",
        "energy": "Energy sector including oil & gas, renewable energy, and utilities",
        "finance": "Financial sector including banks, insurance, and investment firms",
        "consumer": "Consumer sector including retail, food & beverage, and personal goods",
        "industrial": "Industrial sector including manufacturing, aerospace, and defense"
    }
