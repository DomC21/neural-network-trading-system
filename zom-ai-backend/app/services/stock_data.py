from typing import Dict, Union, Any
import aiohttp
import asyncio
from fastapi import HTTPException
import os
from dotenv import load_dotenv
from datetime import datetime
from polygon import RESTClient, exceptions as polygon_exceptions

load_dotenv()

class StockDataService:
    def __init__(self):
        self.alpha_vantage_key = os.getenv("ALPHA_VANTAGE_API_KEY")
        self.polygon_key = os.getenv("POLYGON_API_KEY")
        self.alpha_vantage_url = "https://www.alphavantage.co/query"
        self.polygon_url = "https://api.polygon.io/v3"
        self.timeout = aiohttp.ClientTimeout(total=10, connect=5)
        
        if not self.polygon_key:
            raise ValueError("Polygon API key not configured")
        if not self.alpha_vantage_key:
            raise ValueError("Alpha Vantage API key not configured")
            
        self.polygon_client = RESTClient(self.polygon_key, connect_timeout=5, read_timeout=5)
        self.session = None
        
        print(f"StockDataService initialized with Polygon key: {self.polygon_key[:5]}... and Alpha Vantage key: {self.alpha_vantage_key[:5]}...")
        
    async def __aenter__(self):
        if not self.session or self.session.closed:
            self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        try:
            if self.session and not self.session.closed:
                await self.session.close()
        except Exception as e:
            print(f"Error closing session: {str(e)}")
        finally:
            self.session = None
            return None

    async def get_stock_quote(self, symbol: str) -> Dict[str, str]:
        print(f"Fetching stock quote for {symbol}")
        default_response = {
            "symbol": symbol,
            "price": "N/A",
            "change": "0.00",
            "changePercent": "0.00",
            "volume": "0"
        }
        
        if not self.session or self.session.closed:
            self.session = aiohttp.ClientSession()
            
            if not symbol or not isinstance(symbol, str):
                print("Invalid symbol provided")
                return default_response
            
            if not self.polygon_key:
                print("Error: Polygon API key not configured")
                return default_response

            print(f"Making request to Polygon API for {symbol}...")
            try:
                trade = await asyncio.wait_for(
                    asyncio.to_thread(self.polygon_client.get_last_trade, symbol),
                    timeout=5.0
                )
                
                if trade:
                    params = {
                        "function": "GLOBAL_QUOTE",
                        "symbol": symbol,
                        "apikey": self.alpha_vantage_key
                    }
                    
                    try:
                        async with self.session.get(self.alpha_vantage_url, params=params, timeout=self.timeout) as response:
                            if response.status == 200:
                                av_data = await response.json()
                                if "Global Quote" in av_data:
                                    quote_data = av_data["Global Quote"]
                                    return {
                                        "symbol": symbol,
                                        "price": f"{trade.price:.2f}",
                                        "change": quote_data.get("09. change", "0.00"),
                                        "changePercent": quote_data.get("10. change percent", "0.00%").rstrip('%'),
                                        "volume": str(trade.size)
                                    }
                    except Exception as av_error:
                        print(f"Alpha Vantage error: {str(av_error)}, using Polygon data only")
                        
                    return {
                        "symbol": symbol,
                        "price": f"{trade.price:.2f}",
                        "change": "0.00",
                        "changePercent": "0.00",
                        "volume": str(trade.size)
                    }
                    
            except Exception as e:
                print(f"Polygon API error: {str(e)}, trying Alpha Vantage...")
                
                params = {
                    "function": "GLOBAL_QUOTE",
                    "symbol": symbol,
                    "apikey": self.alpha_vantage_key
                }
                
                try:
                    async with self.session.get(self.alpha_vantage_url, params=params, timeout=self.timeout) as response:
                        if response.status == 200:
                            data = await response.json()
                            if "Global Quote" in data:
                                quote = data["Global Quote"]
                                if quote:
                                    return {
                                        "symbol": symbol,
                                        "price": str(quote.get("05. price", "N/A")),
                                        "change": str(quote.get("09. change", "0.00")),
                                        "changePercent": str(quote.get("10. change percent", "0.00%")).rstrip('%'),
                                        "volume": str(quote.get("06. volume", "0"))
                                    }
                except Exception as alpha_error:
                    print(f"Alpha Vantage API error: {str(alpha_error)}")
                    
            except Exception as e:
                print(f"Unexpected error while fetching quote for {symbol}: {str(e)}")
                
            return default_response

    async def get_technical_indicators(self, symbol: str) -> Dict[str, str]:
        print(f"Fetching technical indicators for {symbol}")
        indicators = {
            "sma_10": "N/A",
            "sma_50": "N/A",
            "sma_200": "N/A",
            "bollinger_upper": "N/A",
            "bollinger_middle": "N/A",
            "bollinger_lower": "N/A",
            "support": "N/A",
            "resistance": "N/A",
            "fib_236": "N/A",
            "fib_382": "N/A",
            "fib_500": "N/A",
            "fib_618": "N/A",
            "rsi": "N/A",
            "macd": "N/A",
            "macd_signal": "N/A",
            "macd_hist": "N/A"
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                # Get historical data for calculations
                url = f"https://api.polygon.io/v2/aggs/ticker/{symbol}/range/1/day/2023-01-01/{datetime.now().strftime('%Y-%m-%d')}"
                if not self.polygon_key:
                    print("Error: Polygon API key not configured")
                    raise HTTPException(status_code=500, detail="Polygon API key not configured")
                params: Dict[str, str] = {
                    "apiKey": self.polygon_key,
                    "adjusted": "true",
                    "limit": "200"
                }
                print(f"Making request to {url}")
                timeout = aiohttp.ClientTimeout(total=10)
                async with session.get(url, params=params, timeout=timeout) as response:
                    print(f"Received response with status {response.status}")
                    if response.status != 200:
                        error_text = await response.text()
                        print(f"Error response: {error_text}")
                        raise HTTPException(status_code=response.status, detail=error_text)
                    
                    data = await response.json()
                    print(f"Received historical data for {symbol}")
                    if isinstance(data.get("results"), list):
                        print(f"Processing historical data for {symbol}")
                        closes = []
                        highs = []
                        lows = []
                        for result in data["results"]:
                            if isinstance(result, dict):
                                closes.append(result.get("c", 0))
                                highs.append(result.get("h", 0))
                                lows.append(result.get("l", 0))
                        
                        # Calculate SMAs
                        print("Calculating Moving Averages")
                        closes.reverse()  # Most recent data first
                        for period in [10, 50, 200]:
                            if len(closes) >= period:
                                sma = sum(closes[:period]) / period
                                indicators[f"sma_{period}"] = str(round(sma, 2))
                            else:
                                indicators[f"sma_{period}"] = str(round(sum(closes) / len(closes), 2))
                        
                        # Calculate Bollinger Bands (20-day)
                        print("Calculating Bollinger Bands")
                        if len(closes) >= 20:
                            period_closes = closes[:20]
                            sma_20 = sum(period_closes) / 20
                            std_dev = (sum((x - sma_20) ** 2 for x in period_closes) / 20) ** 0.5
                            indicators["bollinger_upper"] = str(round(sma_20 + (2 * std_dev), 2))
                            indicators["bollinger_middle"] = str(round(sma_20, 2))
                            indicators["bollinger_lower"] = str(round(sma_20 - (2 * std_dev), 2))
                        else:
                            sma = sum(closes) / len(closes)
                            std_dev = (sum((x - sma) ** 2 for x in closes) / len(closes)) ** 0.5
                            indicators["bollinger_upper"] = str(round(sma + (2 * std_dev), 2))
                            indicators["bollinger_middle"] = str(round(sma, 2))
                            indicators["bollinger_lower"] = str(round(sma - (2 * std_dev), 2))
                        
                        # Calculate Support and Resistance
                        print("Calculating Support and Resistance")
                        if len(closes) >= 20:
                            recent_lows = sorted(lows[:20])
                            recent_highs = sorted(highs[:20])
                            indicators["support"] = str(round(recent_lows[int(len(recent_lows) * 0.2)], 2))
                            indicators["resistance"] = str(round(recent_highs[int(len(recent_highs) * 0.8)], 2))
                        else:
                            recent_lows = sorted(lows)
                            recent_highs = sorted(highs)
                            indicators["support"] = str(round(recent_lows[0], 2))
                            indicators["resistance"] = str(round(recent_highs[-1], 2))
                        
                        # Calculate Fibonacci Retracements
                        print("Calculating Fibonacci Retracements")
                        if len(closes) >= 2:
                            high = max(highs)
                            low = min(lows)
                            diff = high - low
                            indicators["fib_236"] = str(round(high - (diff * 0.236), 2))
                            indicators["fib_382"] = str(round(high - (diff * 0.382), 2))
                            indicators["fib_500"] = str(round(high - (diff * 0.5), 2))
                            indicators["fib_618"] = str(round(high - (diff * 0.618), 2))
                        else:
                            indicators["fib_236"] = "N/A"
                            indicators["fib_382"] = "N/A"
                            indicators["fib_500"] = "N/A"
                            indicators["fib_618"] = "N/A"
                        print("Technical indicators calculation completed")
                    else:
                        print("No historical data available")
                        # Set default N/A values for all indicators
                        for indicator in ["sma_10", "sma_50", "sma_200", "bollinger_upper", "bollinger_middle", 
                                        "bollinger_lower", "support", "resistance", "fib_236", "fib_382", 
                                        "fib_500", "fib_618"]:
                            indicators[indicator] = "N/A"

                # RSI and MACD from Alpha Vantage
                if not self.alpha_vantage_key:
                    print("Error: Alpha Vantage API key not configured")
                    return indicators

                timeout = aiohttp.ClientTimeout(total=10)
                
                # RSI
                rsi_params: Dict[str, str] = {
                    "function": "RSI",
                    "symbol": symbol,
                    "interval": "daily",
                    "time_period": "14",
                    "series_type": "close",
                    "apikey": self.alpha_vantage_key
                }
                async with session.get(self.alpha_vantage_url, params=rsi_params, timeout=timeout) as response:
                    print(f"RSI API response status: {response.status}")
                    if response.status == 200:
                        data = await response.json()
                        rsi_data = data.get("Technical Analysis: RSI", {})
                        if rsi_data:
                            latest_date = list(rsi_data.keys())[0]
                            indicators["rsi"] = str(round(float(rsi_data[latest_date]["RSI"]), 2))
                            print(f"RSI calculated: {indicators['rsi']}")
                        else:
                            print("No RSI data available")
                            indicators["rsi"] = "N/A"
                    else:
                        error_text = await response.text()
                        print(f"RSI API error: {error_text}")
                        indicators["rsi"] = "N/A"

                # MACD
                print("Fetching MACD from Alpha Vantage")
                macd_params: Dict[str, str] = {
                    "function": "MACD",
                    "symbol": symbol,
                    "interval": "daily",
                    "series_type": "close",
                    "apikey": self.alpha_vantage_key
                }
                async with session.get(self.alpha_vantage_url, params=macd_params, timeout=timeout) as response:
                    print(f"MACD API response status: {response.status}")
                    if response.status == 200:
                        data = await response.json()
                        macd_data = data.get("Technical Analysis: MACD", {})
                        if macd_data:
                            latest_date = list(macd_data.keys())[0]
                            indicators["macd"] = str(round(float(macd_data[latest_date]["MACD"]), 2))
                            indicators["macd_signal"] = str(round(float(macd_data[latest_date]["MACD_Signal"]), 2))
                            indicators["macd_hist"] = str(round(float(macd_data[latest_date]["MACD_Hist"]), 2))
                            print(f"MACD values calculated: {indicators['macd']}, {indicators['macd_signal']}, {indicators['macd_hist']}")
                        else:
                            print("No MACD data available")
                            indicators["macd"] = "N/A"
                            indicators["macd_signal"] = "N/A"
                            indicators["macd_hist"] = "N/A"
                    else:
                        error_text = await response.text()
                        print(f"MACD API error: {error_text}")
                        indicators["macd"] = "N/A"
                        indicators["macd_signal"] = "N/A"
                        indicators["macd_hist"] = "N/A"

                return indicators
                
        except asyncio.TimeoutError:
            print("Timeout while fetching data")
            raise HTTPException(status_code=504, detail="Request timed out")
        except Exception as e:
            print(f"Error in get_technical_indicators: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    async def get_fundamental_data(self, symbol: str) -> Dict:
        print(f"Fetching fundamental data for {symbol}")
        fundamental_data = {
            "MarketCapitalization": "N/A",
            "PERatio": "N/A",
            "EPS": "N/A",
            "DividendYield": "N/A",
            "ProfitMargin": "N/A",
            "DebtToEquityRatio": "N/A",
            "Beta": "N/A"
        }
        
        try:
            if not self.session:
                self.session = aiohttp.ClientSession()
                
            # Get company details from Polygon.io
            if self.polygon_key:
                details_url = f"https://api.polygon.io/v3/reference/tickers/{symbol}"
                params = {"apiKey": self.polygon_key}
                
                try:
                    async with self.session.get(details_url, params=params, timeout=self.timeout) as response:
                        print(f"Company details API response status: {response.status}")
                        if response.status == 200:
                            data = await response.json()
                            results = data.get("results", {})
                            if results.get("market_cap"):
                                fundamental_data["MarketCapitalization"] = str(results["market_cap"])
                            if results.get("beta"):
                                fundamental_data["Beta"] = str(results["beta"])
                        else:
                            error_text = await response.text()
                            print(f"Company details API error: {error_text}")
                except Exception as e:
                    print(f"Error fetching company details: {str(e)}")
            else:
                print("Polygon API key not configured")
            
            # Get financial ratios from Alpha Vantage
            if self.alpha_vantage_key:
                overview_params = {
                    "function": "OVERVIEW",
                    "symbol": symbol,
                    "apikey": self.alpha_vantage_key
                }
                
                try:
                    async with self.session.get(self.alpha_vantage_url, params=overview_params, timeout=self.timeout) as response:
                        print(f"Financial ratios API response status: {response.status}")
                        if response.status == 200:
                            data = await response.json()
                            ratios = {
                                "PERatio": data.get("PERatio"),
                                "EPS": data.get("EPS"),
                                "DividendYield": data.get("DividendYield"),
                                "ProfitMargin": data.get("ProfitMargin"),
                                "DebtToEquityRatio": data.get("DebtToEquityRatio")
                            }
                            for key, value in ratios.items():
                                if value and value != "None":
                                    fundamental_data[key] = str(value)
                        else:
                            error_text = await response.text()
                            print(f"Financial ratios API error: {error_text}")
                except Exception as e:
                    print(f"Error fetching financial ratios: {str(e)}")
            else:
                print("Alpha Vantage API key not configured")
                
            return fundamental_data
                
        except asyncio.TimeoutError:
            print("Timeout while fetching fundamental data")
            raise HTTPException(status_code=504, detail="Request timed out")
        except Exception as e:
            print(f"Error in get_fundamental_data: {str(e)}")
            if all(value == "N/A" for value in fundamental_data.values()):
                raise HTTPException(status_code=404, detail="No fundamental data available for this symbol")
            return fundamental_data
