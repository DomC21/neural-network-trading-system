from fastapi import FastAPI, HTTPException, Response, Request
from fastapi.middleware.cors import CORSMiddleware
import os
import traceback
import logging
import time
import asyncio
from dotenv import load_dotenv
import openai
from app.services.stock_data import StockDataService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Zom AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600
)

stock_service = StockDataService()

@app.get("/")
async def read_root():
    return {"message": "Welcome to Zom AI API"}

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    try:
        response = await asyncio.wait_for(call_next(request), timeout=25.0)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        return response
    except asyncio.TimeoutError:
        logger.error(f"Request timeout after {time.time() - start_time} seconds")
        raise HTTPException(status_code=504, detail="Request timeout")
    except Exception as e:
        logger.error(f"Request failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/healthz")
async def healthz(response: Response):
    logger.info("Health check requested")
    response.headers["Cache-Control"] = "no-cache"
    return {"status": "ok", "message": "Service is healthy"}

@app.get("/api/stock/{symbol}")
async def get_stock(symbol: str, response: Response):
    response.headers["Cache-Control"] = "no-cache"
    try:
        print(f"Received request for stock symbol: {symbol}")
        alpha_vantage_key = os.getenv('ALPHA_VANTAGE_API_KEY', '')
        polygon_key = os.getenv('POLYGON_API_KEY', '')
        print(f"Using Alpha Vantage API key: {alpha_vantage_key[:5] if alpha_vantage_key else 'Not found'}...")
        print(f"Using Polygon API key: {polygon_key[:5] if polygon_key else 'Not found'}...")
        
        if not alpha_vantage_key or not polygon_key:
            raise HTTPException(status_code=500, detail="API keys not properly configured")
        
        try:
            quote = await stock_service.get_stock_quote(symbol)
            print(f"Retrieved quote data: {quote}")
        except Exception as e:
            print(f"Error getting stock quote: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to fetch stock quote: {str(e)}")
        
        try:
            technical = await stock_service.get_technical_indicators(symbol)
            print(f"Retrieved technical data: {technical}")
        except Exception as e:
            print(f"Error getting technical indicators: {str(e)}")
            technical = {}  # Use empty dict if technical indicators fail
        
        try:
            fundamental = await stock_service.get_fundamental_data(symbol)
            print(f"Retrieved fundamental data: {fundamental}")
        except Exception as e:
            print(f"Error getting fundamental data: {str(e)}")
            fundamental = {}  # Use empty dict if fundamental data fails
        
        # Generate analysis based on the data
        try:
            technical_analysis = f"Based on technical indicators, {symbol} shows RSI at {technical.get('rsi', 'N/A')}, indicating {'overbought conditions' if float(technical.get('rsi', '0')) > 70 else 'oversold conditions' if float(technical.get('rsi', '0')) < 30 else 'neutral momentum'}. MACD at {technical.get('macd', 'N/A')} suggests {'bullish' if float(technical.get('macd', '0')) > 0 else 'bearish'} momentum."
        except Exception as e:
            print(f"Error generating technical analysis: {str(e)}")
            technical_analysis = "Technical analysis currently unavailable"
        
        try:
            fundamental_analysis = f"{symbol} has a market cap of ${float(fundamental.get('MarketCapitalization', 0))/1e9:.2f}B with a P/E ratio of {fundamental.get('PERatio', 'N/A')}. The company shows a profit margin of {fundamental.get('ProfitMargin', 'N/A')} and EPS of {fundamental.get('EPS', 'N/A')}."
        except Exception as e:
            print(f"Error generating fundamental analysis: {str(e)}")
            fundamental_analysis = "Fundamental analysis currently unavailable"
        
        response_data = {
            "quote": quote,
            "technical": technical,
            "fundamental": fundamental,
            "analysis": {
                "technical": technical_analysis,
                "fundamental": fundamental_analysis
            }
        }
        print(f"Sending response: {response_data}")
        return response_data
        
    except Exception as e:
        print(f"Error processing request for {symbol}: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        print(f"Error traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch stock data: {str(e)}")

@app.post("/api/analyze-metric")
async def analyze_metric(request: dict):
    try:
        prompt = f"Analyze this stock metric: {request['metric']} with value {request['value']}. Explain what this means for the stock's performance in 2-3 sentences."
        
        if not os.getenv("OPENAI_API_KEY"):
            raise ValueError("OpenAI API key not found in environment")
            
        try:
            openai.api_key = os.getenv("OPENAI_API_KEY")
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a financial analyst providing brief, clear explanations of stock metrics."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=150,
                temperature=0.7
            )
            return {"analysis": response['choices'][0]['message']['content'].strip()}
        except Exception as api_error:
            print(f"OpenAI API error: {str(api_error)}")
            raise HTTPException(status_code=500, detail=f"OpenAI API error: {str(api_error)}")
            
    except ValueError as ve:
        print(f"Configuration error: {str(ve)}")
        raise HTTPException(status_code=500, detail=str(ve))
    except Exception as e:
        print(f"Error in analyze_metric: {str(e)}")
        print(f"Error traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))
