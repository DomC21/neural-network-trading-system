from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict
from app.services.unusual_whales import get_congress_trades
from app.services.greek_flow import get_greek_flow, get_greek_descriptions
from app.services.market_tide import get_market_tide
from app.services.earnings import generate_mock_earnings_data
from app.services.insider_trading import generate_mock_insider_data
from app.services.premium_flow import generate_mock_premium_flow, get_sector_descriptions
from app.services.insights import (
    generate_congress_trades_insight,
    generate_greek_flow_insight,
    generate_earnings_insight,
    generate_insider_trading_insight,
    generate_premium_flow_insight
)

app = FastAPI()

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.get("/api/congress/trades")
async def congress_trades(
    ticker: Optional[str] = Query(None, description="Filter by stock ticker"),
    congress_member: Optional[str] = Query(None, description="Filter by congress member name"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
) -> Dict:
    """Get recent congress trades with optional filtering"""
    try:
        return await get_congress_trades(ticker, congress_member, start_date, end_date)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/greek-flow/data")
async def greek_flow_data(
    ticker: str = Query(..., description="Stock ticker (required)"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
) -> Dict:
    """Get Greek flow data with optional filtering"""
    try:
        return await get_greek_flow(ticker, start_date, end_date)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/greek-flow/descriptions")
async def greek_descriptions() -> Dict[str, str]:
    """Get descriptions of Greek metrics for tooltips"""
    return get_greek_descriptions()

@app.get("/api/earnings/data")
async def earnings_data(
    sector: Optional[str] = Query(None, description="Filter by sector"),
    surprise_type: Optional[str] = Query(None, description="Filter by surprise type (positive/negative)"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
) -> Dict:
    """Get earnings data with optional filtering"""
    try:
        data = generate_mock_earnings_data(sector, surprise_type, start_date, end_date)
        return {
            "data": data,
            "insight": generate_earnings_insight(data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/insider-trading/data")
async def insider_trading_data(
    insider_role: Optional[str] = Query(None, description="Filter by insider role (e.g., CEO, CFO)"),
    trade_type: Optional[str] = Query(None, description="Filter by trade type (buy/sell)"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
) -> Dict:
    """Get insider trading data with optional filtering"""
    try:
        data = generate_mock_insider_data(insider_role, trade_type, start_date, end_date)
        return {
            "data": data,
            "insight": generate_insider_trading_insight(data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/premium-flow/data")
async def premium_flow_data(
    option_type: Optional[str] = Query(None, description="Filter by option type (call/put)"),
    sector: Optional[str] = Query(None, description="Filter by sector"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    lookback_days: int = Query(30, description="Number of days to look back for historical comparison"),
    is_intraday: bool = Query(False, description="Use intraday granularity")
) -> Dict:
    """Get premium flow data with optional filtering and historical context"""
    try:
        data, historical_stats = generate_mock_premium_flow(
            option_type, sector, start_date, end_date, lookback_days, is_intraday
        )
        return {
            "data": data,
            "historical_stats": historical_stats,
            "insight": generate_premium_flow_insight(data, historical_stats, is_intraday)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/market-tide/data")
async def market_tide_data(
    date: Optional[str] = Query(None, description="Target date (YYYY-MM-DD)"),
    interval_5m: bool = Query(False, description="Use 5-minute intervals instead of 1-minute"),
    lookback_days: int = Query(30, description="Number of days to look back for historical comparison"),
    granularity: str = Query("minute", description="Data granularity: 'minute' or 'daily'")
) -> Dict:
    """Get market-wide options flow data with historical context"""
    try:
        return await get_market_tide(date, interval_5m, lookback_days, granularity)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/premium-flow/sectors")
async def sector_descriptions() -> Dict[str, str]:
    """Get descriptions of sectors for tooltips"""
    return get_sector_descriptions()
