from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import Optional, List, Dict
import io
import csv
import json
from datetime import datetime
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
from app.services.stock_analysis import analyze_stock

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

@app.get("/api/stock/analysis/{ticker}")
async def stock_analysis(
    ticker: str,
    period: Optional[str] = Query("6mo", description="Analysis period (1d,5d,1mo,3mo,6mo,1y,2y,5y,10y,ytd,max)"),
    export_format: Optional[str] = Query(None, description="Export format (csv or json)")
):
    """Get comprehensive stock analysis including technical, fundamental, and AI insights"""
    try:
        data = await analyze_stock(ticker, period)
        
        if export_format:
            if export_format.lower() == 'csv':
                output = io.StringIO()
                writer = csv.writer(output)
                
                # Write headers and data for technical analysis
                writer.writerow(['Technical Analysis'])
                for key, value in data['technical_analysis'].items():
                    if key != 'historical_data':
                        writer.writerow([key, value])
                        
                # Write headers and data for fundamental analysis
                writer.writerow([])  # Empty row for separation
                writer.writerow(['Fundamental Analysis'])
                for key, value in data['fundamental_analysis'].items():
                    writer.writerow([key, value])
                    
                # Write AI insight
                writer.writerow([])
                writer.writerow(['AI Insight'])
                writer.writerow([data['ai_insight']])
                
                output.seek(0)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                return StreamingResponse(
                    io.StringIO(output.getvalue()),
                    media_type="text/csv",
                    headers={
                        "Content-Disposition": f"attachment; filename={ticker}_analysis_{timestamp}.csv"
                    }
                )
            elif export_format.lower() == 'json':
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                return StreamingResponse(
                    io.StringIO(json.dumps(data, indent=2)),
                    media_type="application/json",
                    headers={
                        "Content-Disposition": f"attachment; filename={ticker}_analysis_{timestamp}.json"
                    }
                )
            else:
                raise HTTPException(status_code=400, detail="Invalid export format. Use 'csv' or 'json'")
        
        return data
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
