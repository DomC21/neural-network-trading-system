from typing import Dict, List, Optional
import random
from .chatgpt import (
    generate_insight,
    CONGRESS_TRADES_PROMPT,
    GREEK_FLOW_PROMPT,
    EARNINGS_PROMPT,
    INSIDER_TRADING_PROMPT,
    PREMIUM_FLOW_PROMPT
)

def generate_congress_trades_insight(trades: List[Dict]) -> str:
    """Generate insights for Congress trades data using ChatGPT"""
    if not trades:
        return "No recent Congress trading activity to analyze."
    
    # Preprocess and summarize data
    ticker_summary = {}
    member_summary = {}
    large_trades = []  # Track trades >$1M
    
    # Sector mapping for common stocks
    sector_map = {
        # Technology
        "AAPL": "tech", "MSFT": "tech", "GOOGL": "tech", "META": "tech",
        "NVDA": "tech", "AMZN": "tech", "ADBE": "tech", "NOW": "tech",
        "PANW": "tech", "INTC": "tech", "AMD": "tech", "CRM": "tech",
        
        # Healthcare
        "JNJ": "healthcare", "PFE": "healthcare", "UNH": "healthcare",
        "ABBV": "healthcare", "MRK": "healthcare", "LLY": "healthcare",
        "ISRG": "healthcare", "DXCM": "healthcare",
        
        # Energy
        "XOM": "energy", "CVX": "energy", "COP": "energy", "SLB": "energy",
        "EOG": "energy", "DVN": "energy", "MPC": "energy",
        
        # Finance
        "JPM": "finance", "BAC": "finance", "GS": "finance", "MS": "finance",
        "WFC": "finance", "C": "finance", "BLK": "finance",
        
        # Consumer
        "WMT": "consumer", "PG": "consumer", "KO": "consumer", "PEP": "consumer",
        "COST": "consumer", "HD": "consumer", "NKE": "consumer"
    }
    
    try:
        for trade in trades:
            ticker = trade["ticker"]
            member = trade["reporter"]
            amount_str = trade["amounts"]
            # Convert amount range to average value
            amount = parse_amount_range(amount_str)
            trade_type = trade["txn_type"].lower()
            
            # Track large trades (>$1M)
            if amount >= 1_000_000:
                large_trades.append({
                    "ticker": ticker,
                    "member": member,
                    "amount": amount,
                    "type": trade_type,
                    "date": trade["transaction_date"]
                })
            
            # Initialize summaries if needed
            if ticker not in ticker_summary:
                ticker_summary[ticker] = {
                    "buy": 0, "sell": 0, "exchange": 0,
                    "total": 0, "traders": set(),
                    "sector": sector_map.get(ticker, "other")
                }
            if member not in member_summary:
                member_summary[member] = {
                    "buy": 0, "sell": 0, "exchange": 0,
                    "total": 0, "tickers": set(),
                    "sectors": set()
                }
            
            # Update summaries
            ticker_summary[ticker]["traders"].add(member)
            ticker_summary[ticker]["total"] += amount
            
            # Handle different transaction types
            if trade_type in ["buy", "sell", "exchange"]:
                ticker_summary[ticker][trade_type] += amount
            
            member_summary[member]["tickers"].add(ticker)
            member_summary[member]["sectors"].add(ticker_summary[ticker]["sector"])
            member_summary[member]["total"] += amount
            if trade_type in ["buy", "sell", "exchange"]:
                member_summary[member][trade_type] += amount
        
        # Get top 5 most traded stocks (excluding Treasury bills)
        top_stocks = sorted(
            [(k, v) for k, v in ticker_summary.items() 
             if not any(x in k.upper() for x in ["TREASURY", "BOND", "NOTE", "BILL"])],
            key=lambda x: x[1]["total"],
            reverse=True
        )[:5]
        
        if not top_stocks:
            return "No significant stock trading activity to analyze."
        
        # Get top 3 most active traders
        top_traders = sorted(
            member_summary.items(),
            key=lambda x: x[1]["total"],
            reverse=True
        )[:3]
        
        # Calculate sector summaries
        sector_summary = {}
        for ticker, data in ticker_summary.items():
            sector = data["sector"]
            if sector not in sector_summary:
                sector_summary[sector] = {"buy": 0, "sell": 0, "exchange": 0, "total": 0}
            sector_summary[sector]["buy"] += data["buy"]
            sector_summary[sector]["sell"] += data["sell"]
            sector_summary[sector]["exchange"] += data["exchange"]
            sector_summary[sector]["total"] += data["total"]
        
        # Create summarized data for ChatGPT
        summary = {
            "large_trades": sorted(large_trades, key=lambda x: x["amount"], reverse=True),
            "top_stocks": [
                {
                    "ticker": ticker,
                    "sector": data["sector"],
                    "total_volume": data["total"],
                    "buy_volume": data["buy"],
                    "sell_volume": data["sell"],
                    "unique_traders": len(data["traders"]),
                    "sentiment": "bullish" if data["buy"] > data["sell"] else "bearish" if data["sell"] > data["buy"] else "neutral"
                }
                for ticker, data in top_stocks
            ],
            "top_traders": [
                {
                    "name": member,
                    "total_volume": data["total"],
                    "unique_tickers": len(data["tickers"]),
                    "unique_sectors": len(data["sectors"]),
                    "buy_ratio": data["buy"] / data["total"] if data["total"] > 0 else 0
                }
                for member, data in top_traders
            ],
            "sector_summary": [
                {
                    "sector": sector,
                    "total_volume": data["total"],
                    "buy_volume": data["buy"],
                    "sell_volume": data["sell"],
                    "net_flow": data["buy"] - data["sell"],
                    "sentiment": "bullish" if data["buy"] > data["sell"] else "bearish" if data["sell"] > data["buy"] else "neutral"
                }
                for sector, data in sector_summary.items()
                if sector != "other"  # Exclude uncategorized stocks
            ]
        }
        
        try:
            # Try to generate insight with ChatGPT
            context = {
                "data_type": "congress_trades",
                "time_range": "recent",
                "additional_context": CONGRESS_TRADES_PROMPT
            }
            return generate_insight(summary, context)
        except Exception as e:
            # Fallback to basic insight using preprocessed data
            if large_trades:
                largest = large_trades[0]
                sector = ticker_summary[largest["ticker"]]["sector"]
                sector_sentiment = sector_summary[sector]["sentiment"]
                return (
                    f"{largest['member']} made a ${largest['amount']/1_000_000:.1f}M "
                    f"{largest['type']} in {largest['ticker']} on {largest['date']}. "
                    f"This aligns with {sector} sector sentiment showing {sector_sentiment} "
                    f"bias based on ${sector_summary[sector]['net_flow']/1_000_000:.1f}M net flow."
                )
            
    except Exception as e:
        return f"Error analyzing trade data: {str(e)}"

def parse_amount_range(amount_str: str) -> float:
    """Convert amount range string to average value"""
    try:
        # Remove "$" and "," and split on " - "
        parts = amount_str.replace("$", "").replace(",", "").split(" - ")
        if len(parts) == 2:
            low = float(parts[0])
            high = float(parts[1])
            return (low + high) / 2
        return float(parts[0])
    except:
        return 0.0

def generate_greek_flow_insight(data: List[Dict]) -> str:
    """Generate insights for Greek flow data using ChatGPT"""
    if not data:
        return "No recent options Greek data to analyze."
    
    try:
        # Preprocess data to reduce size and extract key metrics
        summary = {
            "ticker": data[0].get("ticker", "Unknown"),
            "time_range": {
                "start": data[0].get("timestamp", ""),
                "end": data[-1].get("timestamp", "")
            },
            "metrics": {
                "dir_delta": {
                    "total": sum(float(d.get("dir_delta_flow", 0)) for d in data),
                    "avg": sum(float(d.get("dir_delta_flow", 0)) for d in data) / len(data),
                    "trend": "increasing" if float(data[-1].get("dir_delta_flow", 0)) > float(data[0].get("dir_delta_flow", 0)) else "decreasing"
                },
                "dir_vega": {
                    "total": sum(float(d.get("dir_vega_flow", 0)) for d in data),
                    "avg": sum(float(d.get("dir_vega_flow", 0)) for d in data) / len(data),
                    "trend": "increasing" if float(data[-1].get("dir_vega_flow", 0)) > float(data[0].get("dir_vega_flow", 0)) else "decreasing"
                },
                "volume": {
                    "total": sum(int(d.get("volume", 0)) for d in data),
                    "avg": sum(int(d.get("volume", 0)) for d in data) / len(data)
                }
            },
            "patterns": {
                "high_gamma_periods": [
                    {
                        "timestamp": d.get("timestamp"),
                        "value": float(d.get("dir_delta_flow", 0))
                    }
                    for d in sorted(data, key=lambda x: abs(float(x.get("dir_delta_flow", 0))), reverse=True)[:3]
                ],
                "volatility_spikes": [
                    {
                        "timestamp": d.get("timestamp"),
                        "value": float(d.get("dir_vega_flow", 0))
                    }
                    for d in sorted(data, key=lambda x: abs(float(x.get("dir_vega_flow", 0))), reverse=True)[:3]
                ]
            }
        }
        
        # Prepare context for ChatGPT
        context = {
            "data_type": "greek_flow",
            "time_range": "recent",
            "additional_context": GREEK_FLOW_PROMPT
        }
        
        return generate_insight(summary, context)
    except Exception as e:
        # Fallback to basic insight generation
        try:
            # Calculate key metrics for last 10 data points
            recent_data = data[-10:]
            total_dir_delta = sum(float(d.get("dir_delta_flow", 0)) for d in recent_data)
            total_dir_vega = sum(float(d.get("dir_vega_flow", 0)) for d in recent_data)
            avg_volume = sum(int(d.get("volume", 0)) for d in recent_data) / len(recent_data)
            
            # Generate basic insight
            delta_sentiment = "bullish" if total_dir_delta > 0 else "bearish"
            vega_sentiment = "increasing" if total_dir_vega > 0 else "decreasing"
            volume_context = "high" if avg_volume > 5000 else "moderate" if avg_volume > 2000 else "low"
            
            ticker = data[0].get("ticker", "Unknown")
            return (
                f"{ticker} showing {delta_sentiment} sentiment with {abs(total_dir_delta/1000):.1f}k net delta flow "
                f"and {volume_context} volume ({avg_volume:.0f} contracts). {vega_sentiment.capitalize()} volatility "
                f"expectations based on {abs(total_dir_vega/1000):.1f}k vega flow."
            )
        except Exception:
            return "Insufficient data to generate meaningful insights."

def generate_earnings_insight(data: List[Dict]) -> str:
    """Generate insights for earnings data using ChatGPT"""
    if not data:
        return "No recent earnings data to analyze."
    
    try:
        # Preprocess data to reduce size and extract key metrics
        sector_summary = {}
        for report in data:
            sector = report["sector"]
            if sector not in sector_summary:
                sector_summary[sector] = {
                    "total_reports": 0,
                    "positive_surprises": 0,
                    "negative_surprises": 0,
                    "total_surprise": 0,
                    "total_movement": 0,
                    "market_cap": 0,
                    "stocks": set(),
                    "biggest_surprise": {
                        "ticker": "",
                        "surprise": 0,
                        "movement": 0
                    }
                }
            
            summary = sector_summary[sector]
            surprise = float(report["earnings_surprise"])
            movement = float(report["price_movement"])
            
            summary["total_reports"] += 1
            summary["total_surprise"] += surprise
            summary["total_movement"] += movement
            summary["market_cap"] += int(report["market_cap"])
            summary["stocks"].add(report["ticker"])
            
            if surprise > 0:
                summary["positive_surprises"] += 1
            else:
                summary["negative_surprises"] += 1
                
            if abs(surprise) > abs(summary["biggest_surprise"]["surprise"]):
                summary["biggest_surprise"] = {
                    "ticker": report["ticker"],
                    "surprise": surprise,
                    "movement": movement
                }
        
        # Calculate sector-level metrics
        summary = {
            "sectors": [
                {
                    "name": sector,
                    "total_reports": data["total_reports"],
                    "beat_ratio": data["positive_surprises"] / data["total_reports"],
                    "avg_surprise": data["total_surprise"] / data["total_reports"],
                    "avg_movement": data["total_movement"] / data["total_reports"],
                    "market_cap": data["market_cap"],
                    "unique_stocks": len(data["stocks"]),
                    "biggest_surprise": data["biggest_surprise"]
                }
                for sector, data in sector_summary.items()
            ],
            "overall": {
                "total_reports": sum(d["total_reports"] for d in sector_summary.values()),
                "total_beats": sum(d["positive_surprises"] for d in sector_summary.values()),
                "avg_surprise": sum(d["total_surprise"] for d in sector_summary.values()) / len(data),
                "avg_movement": sum(d["total_movement"] for d in sector_summary.values()) / len(data)
            }
        }
        
        # Add correlation analysis
        surprise_movement_pairs = [(float(d["earnings_surprise"]), float(d["price_movement"])) for d in data]
        correlation = calculate_correlation(surprise_movement_pairs)
        summary["correlation"] = {
            "surprise_to_movement": correlation,
            "relationship": "strong positive" if correlation > 0.7 else
                          "moderate positive" if correlation > 0.3 else
                          "weak positive" if correlation > 0 else
                          "weak negative" if correlation > -0.3 else
                          "moderate negative" if correlation > -0.7 else
                          "strong negative"
        }
        
        # Prepare context for ChatGPT
        context = {
            "data_type": "earnings",
            "time_range": "recent",
            "additional_context": EARNINGS_PROMPT
        }
        
        return generate_insight(summary, context)
    except Exception as e:
        # Fallback to basic insight generation
        try:
            # Find sector with highest beat ratio
            sector_beats = {}
            for report in data:
                sector = report["sector"]
                if sector not in sector_beats:
                    sector_beats[sector] = {"beats": 0, "total": 0, "movement": 0}
                
                sector_beats[sector]["total"] += 1
                if float(report["earnings_surprise"]) > 0:
                    sector_beats[sector]["beats"] += 1
                sector_beats[sector]["movement"] += float(report["price_movement"])
            
            # Find best performing sector
            best_sector = max(
                sector_beats.items(),
                key=lambda x: (x[1]["beats"] / x[1]["total"] if x[1]["total"] > 0 else 0)
            )
            
            sector = best_sector[0]
            beat_ratio = best_sector[1]["beats"] / best_sector[1]["total"]
            avg_movement = best_sector[1]["movement"] / best_sector[1]["total"]
            
            return (
                f"{sector.capitalize()} sector leads with {format_percent(beat_ratio)} of companies beating expectations. "
                f"Stocks in this sector saw an average price movement of {format_percent(avg_movement)}."
            )
        except Exception:
            return "Insufficient data to generate meaningful insights."

def calculate_correlation(pairs: List[tuple]) -> float:
    """Calculate Pearson correlation coefficient"""
    if not pairs:
        return 0
    
    n = len(pairs)
    x = [p[0] for p in pairs]
    y = [p[1] for p in pairs]
    
    mean_x = sum(x) / n
    mean_y = sum(y) / n
    
    variance_x = sum((xi - mean_x) ** 2 for xi in x)
    variance_y = sum((yi - mean_y) ** 2 for yi in y)
    
    covariance = sum((xi - mean_x) * (yi - mean_y) for xi, yi in zip(x, y))
    
    if variance_x == 0 or variance_y == 0:
        return 0
        
    return covariance / (variance_x * variance_y) ** 0.5

def generate_insider_trading_insight(data: List[Dict]) -> str:
    """Generate insights for insider trading data using ChatGPT"""
    if not data:
        return "No recent insider trading data to analyze."
    
    try:
        # Preprocess data to reduce size and extract key metrics
        sector_summary = {}
        role_summary = {}
        
        for trade in data:
            sector = trade["sector"]
            role = trade["insider_role"]
            amount = float(trade["amount"])
            trade_type = trade["trade_type"]
            
            # Initialize sector summary
            if sector not in sector_summary:
                sector_summary[sector] = {
                    "total_volume": 0,
                    "buy_volume": 0,
                    "sell_volume": 0,
                    "unique_insiders": set(),
                    "unique_companies": set(),
                    "largest_trade": {
                        "amount": 0,
                        "type": "",
                        "ticker": "",
                        "role": ""
                    }
                }
            
            # Initialize role summary
            if role not in role_summary:
                role_summary[role] = {
                    "total_volume": 0,
                    "buy_volume": 0,
                    "sell_volume": 0,
                    "sectors": set(),
                    "companies": set()
                }
            
            # Update sector summary
            sector_summary[sector]["total_volume"] += amount
            if trade_type == "buy":
                sector_summary[sector]["buy_volume"] += amount
            else:
                sector_summary[sector]["sell_volume"] += amount
            sector_summary[sector]["unique_insiders"].add(role)
            sector_summary[sector]["unique_companies"].add(trade["ticker"])
            
            if amount > sector_summary[sector]["largest_trade"]["amount"]:
                sector_summary[sector]["largest_trade"] = {
                    "amount": amount,
                    "type": trade_type,
                    "ticker": trade["ticker"],
                    "role": role
                }
            
            # Update role summary
            role_summary[role]["total_volume"] += amount
            if trade_type == "buy":
                role_summary[role]["buy_volume"] += amount
            else:
                role_summary[role]["sell_volume"] += amount
            role_summary[role]["sectors"].add(sector)
            role_summary[role]["companies"].add(trade["ticker"])
        
        # Calculate sector-level metrics
        summary = {
            "sectors": [
                {
                    "name": sector,
                    "total_volume": data["total_volume"],
                    "buy_ratio": data["buy_volume"] / data["total_volume"] if data["total_volume"] > 0 else 0,
                    "unique_insiders": len(data["unique_insiders"]),
                    "unique_companies": len(data["unique_companies"]),
                    "largest_trade": data["largest_trade"],
                    "net_flow": data["buy_volume"] - data["sell_volume"]
                }
                for sector, data in sector_summary.items()
            ],
            "roles": [
                {
                    "title": role,
                    "total_volume": data["total_volume"],
                    "buy_ratio": data["buy_volume"] / data["total_volume"] if data["total_volume"] > 0 else 0,
                    "unique_sectors": len(data["sectors"]),
                    "unique_companies": len(data["companies"])
                }
                for role, data in role_summary.items()
            ],
            "overall": {
                "total_volume": sum(d["total_volume"] for d in sector_summary.values()),
                "total_buys": sum(d["buy_volume"] for d in sector_summary.values()),
                "total_sells": sum(d["sell_volume"] for d in sector_summary.values()),
                "unique_companies": len(set().union(*(d["unique_companies"] for d in sector_summary.values()))),
                "unique_insiders": len(set().union(*(d["unique_insiders"] for d in sector_summary.values())))
            }
        }
        
        # Add timing analysis
        trade_dates = [trade["trade_date"] for trade in data]
        if trade_dates:
            summary["timing"] = {
                "start_date": min(trade_dates),
                "end_date": max(trade_dates),
                "total_days": len(set(trade_dates))
            }
        
        # Prepare context for ChatGPT
        context = {
            "data_type": "insider_trading",
            "time_range": "recent",
            "additional_context": INSIDER_TRADING_PROMPT
        }
        
        return generate_insight(summary, context)
    except Exception as e:
        # Fallback to basic insight generation
        try:
            # Find sector with most significant insider activity
            sector_activity = {}
            for trade in data:
                sector = trade["sector"]
                if sector not in sector_activity:
                    sector_activity[sector] = {"buys": 0, "sells": 0}
                
                if trade["trade_type"] == "buy":
                    sector_activity[sector]["buys"] += float(trade["amount"])
                else:
                    sector_activity[sector]["sells"] += float(trade["amount"])
            
            # Find sector with highest net buying
            best_sector = max(
                sector_activity.items(),
                key=lambda x: x[1]["buys"] - x[1]["sells"]
            )
            
            sector = best_sector[0]
            net_flow = best_sector[1]["buys"] - best_sector[1]["sells"]
            buy_ratio = best_sector[1]["buys"] / (best_sector[1]["buys"] + best_sector[1]["sells"])
            
            sentiment = "bullish" if net_flow > 0 else "bearish"
            return (
                f"{sector.capitalize()} sector shows {sentiment} insider sentiment with "
                f"{format_currency(abs(net_flow))} net {sentiment} flow. "
                f"Buy transactions represent {format_percent(buy_ratio)} of total volume."
            )
        except Exception:
            return "Insufficient data to generate meaningful insights."

def generate_premium_flow_insight(data: List[Dict], historical_stats: Dict = None, is_intraday: bool = False) -> str:
    """Generate insights for premium flow data with historical context"""
    if not data or len(data) == 0:
        if historical_stats:
            max_premium = max(
                historical_stats.get('max_call_premium', 0),
                historical_stats.get('max_put_premium', 0)
            )
            return f"30-day High: ${max_premium/1000000:.1f}M. No recent premium flow data to analyze."
        return "No recent premium flow data to analyze."
    
    try:
        # Calculate historical high and current metrics
        max_premium = 0
        current_premium = sum(float(d.get('premium', 0)) for d in data)
        current_call_premium = sum(float(d.get('premium', 0)) for d in data if d.get('option_type', '').lower() == 'call')
        current_put_premium = sum(float(d.get('premium', 0)) for d in data if d.get('option_type', '').lower() == 'put')
        
        if historical_stats:
            max_premium = max(
                historical_stats.get('max_call_premium', 0),
                historical_stats.get('max_put_premium', 0)
            )
        else:
            # If no historical stats, use the highest premium from current data
            max_premium = max(current_premium, max(float(d.get('premium', 0)) for d in data))
        
        # Process sector data and time series
        sector_summary = {}
        time_series = {}
        latest_time = None
        
        # Process each flow entry
        for flow in data:
            # Default to "tech" sector for testing if not specified
            sector = flow.get("sector", "tech").lower()  # Ensure lowercase sector names
            premium = float(flow.get("premium", 0))
            volume = int(flow.get("volume", 0))
            option_type = flow.get("option_type", "unknown").lower()
            date = flow.get("date", "")
            market_time = flow.get("market_time", date)
            
            # Track latest time for intraday data
            if market_time:
                # Convert market_time to string if it's not already
                market_time = str(market_time)
                # Add ET timezone if not present
                if " ET" not in market_time:
                    market_time = f"{market_time} ET"
                # Update latest time if this is more recent
                if not latest_time or str(market_time) > str(latest_time):
                    latest_time = market_time
            
            # Initialize sector summary if needed
            if sector not in sector_summary:
                sector_summary[sector] = {
                    "total_premium": 0,
                    "call_premium": 0,
                    "put_premium": 0,
                    "total_volume": 0
                }
            
            # Update sector summary
            summary = sector_summary[sector]
            summary["total_premium"] += premium
            summary["total_volume"] += volume
            if option_type == "call":
                summary["call_premium"] += premium
            elif option_type == "put":
                summary["put_premium"] += premium
            
            # Update time series
            time_key = market_time if market_time else date
            if time_key not in time_series:
                time_series[time_key] = {
                    "time": market_time,  # Store time for sorting
                    "total_premium": 0,
                    "call_premium": 0,
                    "put_premium": 0,
                    "total_volume": 0,
                    "cumulative_call": flow.get("cumulative_call_premium", 0),
                    "cumulative_put": flow.get("cumulative_put_premium", 0),
                    "net_premium": flow.get("net_premium", 0)
                }
            
            ts = time_series[time_key]
            ts["total_premium"] += premium
            ts["total_volume"] += volume
            if option_type == "call":
                ts["call_premium"] += premium
            else:
                ts["put_premium"] += premium
                
            # Debug logging
            print(f"Processing flow: time_key={time_key}, premium={premium}, volume={volume}, type={option_type}")
            print(f"Updated time series: {ts}")
        
        # Calculate final metrics with sector comparisons
        sectors_list = [
            {
                "name": sector,
                "total_premium": data["total_premium"],
                "call_premium": data["call_premium"],
                "put_premium": data["put_premium"],
                "call_ratio": data["call_premium"] / data["total_premium"] if data["total_premium"] > 0 else 0,
                "put_ratio": data["put_premium"] / data["total_premium"] if data["total_premium"] > 0 else 0,
                "volume": data["total_volume"],
                "sentiment": "bullish" if data["call_premium"] > data["put_premium"] else "bearish"
            }
            for sector, data in sector_summary.items()
        ]
        
        # Sort sectors by total premium for comparison
        sorted_sectors = sorted(sectors_list, key=lambda x: x["total_premium"], reverse=True)
        
        # Calculate sector comparisons
        sector_comparisons = []
        if len(sorted_sectors) >= 2:
            for i in range(len(sorted_sectors) - 1):
                current = sorted_sectors[i]
                next_sector = sorted_sectors[i + 1]
                premium_diff = current["total_premium"] - next_sector["total_premium"]
                if premium_diff > 1_000_000:  # Only include significant differences (>$1M)
                    sector_comparisons.append({
                        "leading_sector": current["name"],
                        "trailing_sector": next_sector["name"],
                        "premium_difference": premium_diff,
                        "sentiment_alignment": current["sentiment"] == next_sector["sentiment"]
                    })
        
        summary = {
            "sectors": sorted_sectors,
            "sector_comparisons": sector_comparisons,
            "time_series": sorted([
                {
                    "time": data["time"],
                    "total_premium": data["total_premium"],
                    "call_ratio": data["call_premium"] / data["total_premium"] if data["total_premium"] > 0 else 0,
                    "put_ratio": data["put_premium"] / data["total_premium"] if data["total_premium"] > 0 else 0,
                    "volume": data["total_volume"],
                    "cumulative_call": data["cumulative_call"],
                    "cumulative_put": data["cumulative_put"],
                    "net_premium": data["net_premium"]
                }
                for _, data in time_series.items()
            ], key=lambda x: x["time"]),
            "overall": {
                "total_premium": sum(d["total_premium"] for d in sector_summary.values()),
                "total_calls": sum(d["call_premium"] for d in sector_summary.values()),
                "total_puts": sum(d["put_premium"] for d in sector_summary.values()),
                "total_volume": sum(d["total_volume"] for d in sector_summary.values())
            }
        }
        
        # Add trend analysis
        if len(summary["time_series"]) > 1:
            first_point = summary["time_series"][0]
            last_point = summary["time_series"][-1]
            summary["trends"] = {
                "premium_change": (last_point["total_premium"] - first_point["total_premium"]) / first_point["total_premium"] if first_point["total_premium"] > 0 else 0,
                "call_ratio_change": last_point["call_ratio"] - first_point["call_ratio"],
                "volume_change": (last_point["volume"] - first_point["volume"]) / first_point["volume"] if first_point["volume"] > 0 else 0,
                "net_premium_change": last_point["net_premium"] - first_point["net_premium"],
                "time_range": {
                    "start": first_point["time"],
                    "end": last_point["time"]
                }
            }
        
        # Prepare detailed historical context
        historical_context = ""
        if historical_stats:
            # Calculate current metrics for comparison
            current_call = summary["overall"]["total_calls"]
            current_put = summary["overall"]["total_puts"]
            current_volume = summary["overall"]["total_volume"]
            
            # Calculate percentage differences
            call_vs_max = (current_call / historical_stats['max_call_premium'] * 100) if historical_stats['max_call_premium'] > 0 else 0
            put_vs_max = (current_put / historical_stats['max_put_premium'] * 100) if historical_stats['max_put_premium'] > 0 else 0
            volume_vs_avg = (current_volume / historical_stats['avg_daily_volume'] * 100) if historical_stats['avg_daily_volume'] > 0 else 0
            
            # Format current metrics with 30-day High reference
            current_metrics = f"""Current Premium Flow ({summary['sectors'][0]['name']} Sector):
            - Total Premium: ${summary['overall']['total_premium']/1000000:.1f}M
            - Call Premium: ${current_call/1000000:.1f}M ({call_vs_max:.1f}% of 30-day High)
            - Put Premium: ${current_put/1000000:.1f}M ({put_vs_max:.1f}% of 30-day High)
            - Volume: {current_volume:,.0f} contracts ({volume_vs_avg:.1f}% of 30-day average)
            - Latest Update: {max((flow.get('market_time', '') for flow in data), default='').strip() or 'N/A'}"""

            # Format historical metrics
            historical_metrics = f"""Historical Context:
            - 30-day High Call Premium: ${historical_stats['max_call_premium']/1000000:.1f}M
            - 30-day High Put Premium: ${historical_stats['max_put_premium']/1000000:.1f}M
            - Average Daily Volume: {historical_stats['avg_daily_volume']:,.0f}
            - Last Volume Peak: {historical_stats['highest_volume_date']} ET"""

        # Find leading sector
        leading_sector = max(
            sector_summary.items(),
            key=lambda x: x[1]["total_premium"]
        ) if sector_summary else ("Unknown", {"total_premium": 0})
        
        # Calculate net premium change
        net_premium = 0
        if len(data) > 1:
            net_premium = sum(float(d['premium']) for d in data if d['option_type'] == 'call') - \
                         sum(float(d['premium']) for d in data if d['option_type'] == 'put')

        # Build insight with required elements in exact order
        parts = []
        
        # 1. Must start with historical high
        parts.append(f"30-day High: ${max_premium/1000000:.1f}M")
        
        # 2. Add timestamp for intraday data
        if is_intraday:
            if latest_time:
                # Ensure time is in ET format
                if " ET" not in latest_time:
                    latest_time = f"{latest_time} ET"
                parts.append(f"As of {latest_time}")
            else:
                parts.append("As of market close ET")
        
        # 3. Add current metrics with sector context
        high_ratio = (current_premium / max_premium * 100) if max_premium > 0 else 0
        call_ratio = (current_call_premium / current_premium * 100) if current_premium > 0 else 0
        parts.append(f"Current: ${current_premium/1000000:.1f}M ({high_ratio:.1f}% of 30-day High, {call_ratio:.1f}% calls)")
        
        # 4. Add sector lead with explicit sector mention
        # Sort sectors by total premium to get the leading sector
        sorted_sectors = sorted(
            [(k, v) for k, v in sector_summary.items() if isinstance(v, dict) and "total_premium" in v],
            key=lambda x: x[1]["total_premium"],
            reverse=True
        )
        if sorted_sectors:
            leading_sector = sorted_sectors[0]
            sector_name = leading_sector[0].lower()
            sector_premium = leading_sector[1]["total_premium"]
            sector_call_ratio = leading_sector[1]["call_premium"] / sector_premium if sector_premium > 0 else 0
            parts.append(f"{sector_name} sector leads with ${sector_premium/1000000:.1f}M ({sector_call_ratio*100:.1f}% calls)")
        
        # 5. Add net premium change with minute-by-minute reference for intraday
        net_premium = current_call_premium - current_put_premium
        momentum_ref = "showing minute-by-minute momentum" if is_intraday else "over the analyzed period"
        parts.append(f"Net premium change of ${abs(net_premium)/1000000:.1f}M {momentum_ref}")
        
        # Join all parts with periods
        return ". ".join(parts) + "."
    except Exception as e:
        print(f"Error generating insight: {str(e)}")
        return "Error generating insight. Please try again."

def format_currency(amount: float) -> str:
    """Format currency in millions/billions"""
    if amount >= 1_000_000_000:
        return f"${amount / 1_000_000_000:.1f}B"
    return f"${amount / 1_000_000:.1f}M"

def generate_market_tide_insight(data: List[Dict]) -> str:
    """Generate insights for market tide data using ChatGPT"""
    if not data:
        return "No recent market tide data to analyze."
    
    try:
        # Preprocess data to reduce size and extract key metrics
        time_series = {}
        
        for flow in data:
            timestamp = flow["timestamp"]
            date = timestamp.split("T")[0]
            
            # Initialize time series
            if date not in time_series:
                time_series[date] = {
                    "net_call_premium": 0,
                    "net_put_premium": 0,
                    "net_volume": 0,
                    "total_premium": 0,
                    "intervals": 0
                }
            
            ts = time_series[date]
            ts["net_call_premium"] += float(flow.get("net_call_premium", 0))
            ts["net_put_premium"] += float(flow.get("net_put_premium", 0))
            ts["net_volume"] += int(flow.get("net_volume", 0))
            ts["total_premium"] = abs(ts["net_call_premium"]) + abs(ts["net_put_premium"])
            ts["intervals"] += 1
        
        # Calculate daily averages and trends
        summary = {
            "daily_flow": [
                {
                    "date": date,
                    "net_call_premium": data["net_call_premium"] / data["intervals"],
                    "net_put_premium": data["net_put_premium"] / data["intervals"],
                    "net_volume": data["net_volume"] / data["intervals"],
                    "total_premium": data["total_premium"] / data["intervals"],
                    "call_ratio": (
                        data["net_call_premium"] / data["total_premium"]
                        if data["total_premium"] > 0 else 0
                    )
                }
                for date, data in sorted(time_series.items())
            ],
            "overall": {
                "total_call_premium": sum(d["net_call_premium"] for d in time_series.values()),
                "total_put_premium": sum(d["net_put_premium"] for d in time_series.values()),
                "total_volume": sum(d["net_volume"] for d in time_series.values()),
                "total_premium": sum(d["total_premium"] for d in time_series.values()),
                "total_intervals": sum(d["intervals"] for d in time_series.values())
            }
        }
        
        # Add trend analysis
        if len(summary["daily_flow"]) > 1:
            first_day = summary["daily_flow"][0]
            last_day = summary["daily_flow"][-1]
            summary["trends"] = {
                "premium_change": (
                    (last_day["total_premium"] - first_day["total_premium"]) 
                    / first_day["total_premium"] if first_day["total_premium"] > 0 else 0
                ),
                "call_ratio_change": last_day["call_ratio"] - first_day["call_ratio"],
                "volume_change": (
                    (last_day["net_volume"] - first_day["net_volume"])
                    / first_day["net_volume"] if first_day["net_volume"] != 0 else 0
                )
            }
        
        # Prepare context for ChatGPT
        context = {
            "data_type": "market_tide",
            "time_range": "recent",
            "additional_context": MARKET_TIDE_PROMPT
        }
        
        return generate_insight(summary, context)
    except Exception as e:
        # Fallback to basic insight generation
        try:
            # Calculate overall market sentiment
            total_call = sum(float(d.get("net_call_premium", 0)) for d in data)
            total_put = sum(float(d.get("net_put_premium", 0)) for d in data)
            net_volume = sum(int(d.get("net_volume", 0)) for d in data)
            
            sentiment = "bullish" if total_call > total_put else "bearish"
            volume_trend = "increasing" if net_volume > 0 else "decreasing"
            
            return (
                f"Market showing {sentiment} sentiment with "
                f"{format_currency(abs(total_call - total_put))} net {sentiment} premium flow. "
                f"Overall volume is {volume_trend} with {format_number(abs(net_volume))} net contracts."
            )
        except Exception:
            return "Insufficient data to generate meaningful insights."

def format_number(value: float) -> str:
    """Format large numbers with K/M/B suffixes"""
    if abs(value) >= 1_000_000_000:
        return f"{value/1_000_000_000:.1f}B"
    if abs(value) >= 1_000_000:
        return f"{value/1_000_000:.1f}M"
    if abs(value) >= 1_000:
        return f"{value/1_000:.1f}K"
    return f"{value:.0f}"

def format_percent(value: float) -> str:
    """Format percentage with one decimal place"""
    return f"{value * 100:.1f}%"
