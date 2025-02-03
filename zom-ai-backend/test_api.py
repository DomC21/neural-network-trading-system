import aiohttp
import asyncio
import json
import sys
import time
import traceback
from typing import Tuple, Optional, Dict, Any

BASE_URL = "http://localhost:8000"

async def test_endpoint(session: aiohttp.ClientSession, url: str, timeout: int = 10) -> Tuple[bool, Optional[Dict[str, Any]]]:
    start_time = time.time()
    print(f"\nTesting endpoint: {url}")
    
    try:
        headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
        
        client_timeout = aiohttp.ClientTimeout(
            total=timeout,
            connect=5,
            sock_read=5
        )
        
        print(f"Making request to {url} with timeout {timeout}s...")
        async with session.get(url, timeout=client_timeout, headers=headers) as response:
            elapsed = time.time() - start_time
            print(f"Response received in {elapsed:.2f} seconds")
            print(f"Status: {response.status}")
            
            try:
                response_text = await asyncio.wait_for(response.text(), timeout=5)
                print(f"Raw response: {response_text}")
                
                if response.status == 200:
                    try:
                        data = json.loads(response_text)
                        print("\nSuccess! Response:")
                        print(json.dumps(data, indent=2))
                        return True, data
                    except json.JSONDecodeError as e:
                        print(f"\nError decoding JSON: {str(e)}")
                        print(f"Response text: {response_text}")
                        return False, None
                else:
                    print(f"\nError (status {response.status}):")
                    print(response_text)
                    return False, None
            except asyncio.TimeoutError:
                print(f"\nTimeout while reading response after {elapsed:.2f} seconds")
                return False, None
                
    except asyncio.TimeoutError:
        print(f"\nRequest timeout after {timeout} seconds")
        return False, None
    except aiohttp.ClientError as e:
        print(f"\nClient error: {type(e).__name__} - {str(e)}")
        return False, None
    except Exception as e:
        print(f"\nUnexpected error: {type(e).__name__} - {str(e)}")
        print(f"Error traceback: {traceback.format_exc()}")
        return False, None

async def test_stock_api(symbol: str) -> None:
    print(f"\n=== Testing stock data for {symbol} ===")
    
    async with aiohttp.ClientSession() as session:
        # Test health endpoint first
        print("\nTesting health endpoint...")
        success, health_data = await test_endpoint(
            session,
            f"{BASE_URL}/healthz",
            timeout=5
        )
        
        if not success:
            print("Health check failed, skipping further tests")
            return
            
        # Test quote endpoint
        print("\nTesting stock endpoint...")
        success, quote_data = await test_endpoint(
            session,
            f"{BASE_URL}/api/stock/{symbol}",
            timeout=10
        )
        
        if success and quote_data:
            # Test analyze endpoint with RSI metric
            if quote_data.get("technical", {}).get("rsi"):
                print("\nTesting metric analysis...")
                analyze_url = f"{BASE_URL}/api/analyze-metric"
                data = {
                    "metric": "RSI",
                    "value": quote_data["technical"]["rsi"]
                }
                
                headers = {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
                
                try:
                    print("\nTesting metric analysis endpoint...")
                    print(f"Making request to {analyze_url} with data: {json.dumps(data, indent=2)}")
                    
                    async with session.post(
                        analyze_url,
                        json=data,
                        headers=headers,
                        timeout=aiohttp.ClientTimeout(total=30, connect=5)
                    ) as response:
                        response_text = await response.text()
                        print(f"Response status: {response.status}")
                        print(f"Raw response: {response_text}")
                        
                        if response.status == 200:
                            analysis = json.loads(response_text)
                            print("\nSuccess! Analysis response:")
                            print(json.dumps(analysis, indent=2))
                        else:
                            print(f"\nAnalysis failed with status {response.status}")
                            print(f"Error: {response_text}")
                except Exception as e:
                    print(f"\nAnalysis error: {str(e)}")
                    print(f"Error traceback: {traceback.format_exc()}")

async def main() -> None:
    symbols = ["AAPL"]  # Start with just one symbol for testing
    try:
        for symbol in symbols:
            await test_stock_api(symbol)
            print("\n" + "="*50)
    except KeyboardInterrupt:
        print("\nTest interrupted by user")
    except Exception as e:
        print(f"\nUnexpected error in main: {str(e)}")
        print(f"Error traceback: {traceback.format_exc()}")
    finally:
        print("\nTest run completed")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nTests stopped by user")
        sys.exit(1)
