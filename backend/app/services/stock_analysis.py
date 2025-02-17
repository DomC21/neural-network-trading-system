from typing import Dict
import yfinance as yf
import pandas as pd
import numpy as np
from .chatgpt import generate_insight


def validate_ticker(ticker: str) -> bool:
    """Validate if a stock ticker exists"""
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        return 'regularMarketPrice' in info
    except Exception:
        return False


def get_technical_analysis(ticker: str, period: str = "6mo") -> Dict:
    """Get technical analysis indicators for a stock"""
    stock = yf.Ticker(ticker)
    hist = stock.history(period=period)

    # Calculate technical indicators
    close = hist['Close'].values
    high = hist['High'].values
    low = hist['Low'].values

    # Calculate RSI
    delta = np.diff(close)
    gain = (delta > 0) * delta
    loss = (delta < 0) * -delta
    avg_gain = np.concatenate(
        ([np.nan], np.convolve(gain, np.ones(14)/14, mode='valid'))
    )
    avg_loss = np.concatenate(
        ([np.nan], np.convolve(loss, np.ones(14)/14, mode='valid'))
    )
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))

    # Calculate Moving Averages
    sma_20 = np.convolve(close, np.ones(20)/20, mode='valid')
    sma_50 = np.convolve(close, np.ones(50)/50, mode='valid')
    sma_200 = np.convolve(close, np.ones(200)/200, mode='valid')

    # Calculate MACD
    ema_12 = pd.Series(close).ewm(span=12, adjust=False).mean()
    ema_26 = pd.Series(close).ewm(span=26, adjust=False).mean()
    macd = ema_12 - ema_26
    signal = macd.ewm(span=9, adjust=False).mean()

    # Calculate Support and Resistance using Pivot Points
    pivot_point = (high[-1] + low[-1] + close[-1]) / 3
    r1 = 2 * pivot_point - low[-1]
    s1 = 2 * pivot_point - high[-1]

    latest = hist.iloc[-1]
    return {
        "price": latest["Close"],
        "volume": latest["Volume"],
        "rsi": rsi[-1],
        "macd": macd.iloc[-1],
        "macd_signal": signal.iloc[-1],
        "sma_20": sma_20[-1] if len(sma_20) > 0 else None,
        "sma_50": sma_50[-1] if len(sma_50) > 0 else None,
        "sma_200": sma_200[-1] if len(sma_200) > 0 else None,
        "support": s1,
        "resistance": r1,
        "historical_data": hist.tail(30).to_dict(orient="records")
    }


def get_fundamental_analysis(ticker: str) -> Dict:
    """Get fundamental analysis data for a stock"""
    stock = yf.Ticker(ticker)
    info = stock.info

    return {
        "company_name": info.get("longName"),
        "sector": info.get("sector"),
        "industry": info.get("industry"),
        "market_cap": info.get("marketCap"),
        "pe_ratio": info.get("trailingPE"),
        "forward_pe": info.get("forwardPE"),
        "peg_ratio": info.get("pegRatio"),
        "price_to_book": info.get("priceToBook"),
        "debt_to_equity": info.get("debtToEquity"),
        "profit_margins": info.get("profitMargins"),
        "revenue_growth": info.get("revenueGrowth"),
        "earnings_growth": info.get("earningsGrowth"),
        "recommendation": info.get("recommendationKey"),
        "target_price": info.get("targetMeanPrice")
    }


async def analyze_stock(ticker: str, period: str = "6mo") -> Dict:
    """Generate comprehensive stock analysis"""
    # Validate ticker
    if not validate_ticker(ticker):
        raise ValueError(f"Invalid ticker symbol: {ticker}")

    # Get technical and fundamental analysis
    technical = get_technical_analysis(ticker, period)
    fundamental = get_fundamental_analysis(ticker)

    # Prepare context for ChatGPT analysis
    context = {
        "data_type": "stock analysis",
        "time_range": period,
        "view_type": "comprehensive",
        "historical_context": f"Analysis based on {period} of historical data",
        "required_phrases": {
            "historical_high": (
                f"52-week High: "
                f"${technical['historical_data'][-1]['High']:.2f}"
            ),
            "current_metrics": (
                f"Current Price: ${technical['price']:.2f}, "
                f"RSI: {technical['rsi']:.1f}"
            ),
            "sector_lead": (
                f"Sector: {fundamental['sector']}, "
                f"Industry: {fundamental['industry']}"
            ),
            "net_premium": (
                f"Market Cap: ${fundamental['market_cap']/1e9:.1f}B, "
                f"P/E: {fundamental['pe_ratio']:.1f}"
            )
        }
    }

    # Generate AI insight
    insight = generate_insight({
        "technical": technical,
        "fundamental": fundamental
    }, context)

    return {
        "technical_analysis": technical,
        "fundamental_analysis": fundamental,
        "ai_insight": insight
    }
