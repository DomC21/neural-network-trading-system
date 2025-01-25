from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import random
import pytz
from app.services.unusual_whales import make_api_request

def get_historical_stats(data: List[Dict], lookback_days: int = 30) -> Dict:
    """Calculate historical statistics for market tide data"""
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
            "max_net_volume": 0,
            "min_net_volume": 0,
            "highest_volume_date": None
        }
    
    # Calculate statistics
    stats = {
        "max_call_premium": max([float(d["net_call_premium"]) for d in historical_data], default=0),
        "min_call_premium": min([float(d["net_call_premium"]) for d in historical_data], default=0),
        "max_put_premium": max([float(d["net_put_premium"]) for d in historical_data], default=0),
        "min_put_premium": min([float(d["net_put_premium"]) for d in historical_data], default=0),
        "max_net_volume": max([int(d["net_volume"]) for d in historical_data], default=0),
        "min_net_volume": min([int(d["net_volume"]) for d in historical_data], default=0),
        "highest_volume_date": max(historical_data, key=lambda x: abs(int(x["net_volume"])))["date"]
    }
    
    return stats

async def get_market_tide(
    date: Optional[str] = None,
    interval_5m: bool = False,
    lookback_days: int = 30,
    granularity: str = "minute"
) -> Dict:
    """Fetch market tide data from Unusual Whales API"""
    try:
        params = {
            **({"date": date} if date else {}),
            "interval_5m": str(interval_5m).lower()
        }
        response = await make_api_request("market/market-tide", params)
        data = response.get('data', [])
        
        # Calculate historical statistics
        historical_stats = get_historical_stats(data, lookback_days)
        
        # Add cumulative calculations and timezone
        cumulative_data = []
        call_sum = 0
        put_sum = 0
        
        for point in sorted(data, key=lambda x: x["timestamp"]):
            call_sum += float(point["net_call_premium"])
            put_sum += float(point["net_put_premium"])
            
            # Convert timestamp to NY timezone
            market_time = datetime.strptime(point["timestamp"], "%Y-%m-%dT%H:%M:%SZ").replace(
                tzinfo=pytz.UTC
            ).astimezone(pytz.timezone("America/New_York"))
            
            cumulative_data.append({
                **point,
                "cumulative_call_premium": call_sum,
                "cumulative_put_premium": put_sum,
                "net_premium": call_sum - put_sum,
                "market_time": market_time.strftime("%Y-%m-%d %H:%M:%S")
            })
        
        return {
            "data": cumulative_data,
            "historical_stats": historical_stats,
            "insight": generate_market_tide_insight(cumulative_data, granularity)
        }
    except Exception:
        # Fallback to mock data
        mock_data = generate_mock_market_tide(date, interval_5m, lookback_days, granularity)
        historical_stats = get_historical_stats(mock_data, lookback_days)
        return {
            "data": mock_data,
            "historical_stats": historical_stats,
            "insight": generate_market_tide_insight(mock_data, granularity)
        }

from .chatgpt import generate_insight, MARKET_TIDE_PROMPT

def generate_market_tide_insight(data: List[Dict], historical_stats: Dict = None, granularity: str = "minute") -> str:
    """Generate insights for market tide data using ChatGPT with historical context"""
    if not data:
        return "No recent market tide data to analyze."
    
    try:
        # Prepare historical context string
        historical_context = ""
        if historical_stats:
            historical_context = f"""
            Historical Metrics:
            - Max Net Volume: {historical_stats['max_net_volume']:,.0f}
            - Min Net Volume: {historical_stats['min_net_volume']:,.0f}
            - Highest Volume Date: {historical_stats['highest_volume_date']}
            """
        
        # Prepare context for ChatGPT
        context = {
            "data_type": "market_tide",
            "time_range": "intraday" if granularity == "minute" else "daily",
            "view_type": f"{granularity}-by-{granularity}",
            "historical_context": historical_context,
            "additional_context": MARKET_TIDE_PROMPT
        }
        return generate_insight(data, context)
    except Exception:
        # Fallback to basic insight generation
        total_call_premium = sum(float(d.get('net_call_premium', 0)) for d in data)
        total_put_premium = sum(float(d.get('net_put_premium', 0)) for d in data)
        net_premium = total_call_premium + total_put_premium
        
        if granularity == "minute":
            latest = data[-1] if data else None
            if latest:
                latest_call = float(latest['net_call_premium'])
                latest_put = float(latest['net_put_premium'])
                latest_net = latest_call + latest_put
                return (
                    f"{'Bullish' if net_premium > 0 else 'Bearish'} sentiment with "
                    f"net {'call' if net_premium > 0 else 'put'} premium flow of "
                    f"${abs(net_premium)/1000000:.1f}M. Latest flow: "
                    f"${abs(latest_net)/1000:.1f}K {'inflow' if latest_net > 0 else 'outflow'}"
                )
        
        return (
            f"{'Bullish' if net_premium > 0 else 'Bearish'} sentiment with "
            f"net {'call' if net_premium > 0 else 'put'} premium flow of "
            f"${abs(net_premium)/1000000:.1f}M"
        )

def generate_mock_market_tide(
    date: Optional[str] = None,
    interval_5m: bool = False,
    lookback_days: int = 30,
    granularity: str = "minute"
) -> List[Dict]:
    """Generate mock market tide data for development"""
    base_date = datetime.now()
    if date:
        base_date = datetime.strptime(date, "%Y-%m-%d")
    
    data_points = []
    if granularity == "minute":
        interval = 5 if interval_5m else 1
        # Generate minute-by-minute data for trading day
        for minute in range(0, 390, interval):  # Trading day minutes (6.5 hours)
            timestamp = base_date.replace(hour=9, minute=30) + timedelta(minutes=minute)
            data_points.append({
                "date": timestamp.strftime("%Y-%m-%d"),
                "net_call_premium": str(random.uniform(-1000000, 1000000)),
                "net_put_premium": str(random.uniform(-1000000, 1000000)),
                "net_volume": str(random.randint(-10000, 10000)),
                "timestamp": timestamp.strftime("%Y-%m-%dT%H:%M:%SZ")
            })
    else:  # daily data
        # Generate daily data for lookback period
        for day in range(lookback_days):
            timestamp = base_date - timedelta(days=day)
            # Aggregate multiple data points for daily summary
            daily_call = sum(random.uniform(-1000000, 1000000) for _ in range(10))
            daily_put = sum(random.uniform(-1000000, 1000000) for _ in range(10))
            daily_volume = sum(random.randint(-10000, 10000) for _ in range(10))
            data_points.append({
                "date": timestamp.strftime("%Y-%m-%d"),
                "net_call_premium": str(daily_call),
                "net_put_premium": str(daily_put),
                "net_volume": str(daily_volume),
                "timestamp": timestamp.strftime("%Y-%m-%dT%H:%M:%SZ")
            })
        
        data_points.append({
            "date": timestamp.strftime("%Y-%m-%d"),
            "net_call_premium": str(random.uniform(-1000000, 1000000)),
            "net_put_premium": str(random.uniform(-1000000, 1000000)),
            "net_volume": str(random.randint(-10000, 10000)),
            "timestamp": timestamp.strftime("%Y-%m-%dT%H:%M:%SZ")
        })
    
    # Sort and add cumulative calculations
    sorted_data = sorted(data_points, key=lambda x: x["timestamp"])
    
    cumulative_data = []
    call_sum = 0
    put_sum = 0
    
    for point in sorted_data:
        call_sum += float(point["net_call_premium"])
        put_sum += float(point["net_put_premium"])
        
        # Convert timestamp to NY timezone
        market_time = datetime.strptime(point["timestamp"], "%Y-%m-%dT%H:%M:%SZ").replace(
            tzinfo=pytz.UTC
        ).astimezone(pytz.timezone("America/New_York"))
        
        cumulative_data.append({
            **point,
            "cumulative_call_premium": call_sum,
            "cumulative_put_premium": put_sum,
            "net_premium": call_sum - put_sum,
            "market_time": market_time.strftime("%Y-%m-%d %H:%M:%S")
        })
    
    return cumulative_data
