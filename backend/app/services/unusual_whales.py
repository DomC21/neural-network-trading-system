from typing import Dict, List, Optional
import httpx
from fastapi import HTTPException
import os
from dotenv import load_dotenv
from app.services.mock_data import generate_mock_congress_trades
from app.services.insights import generate_congress_trades_insight

load_dotenv()

API_KEY = os.getenv("UNUSUAL_WHALES_API_KEY")
BASE_URL = "https://api.unusualwhales.com/api"

async def make_api_request(endpoint: str, params: Dict = None) -> Dict:
    """Make a request to the Unusual Whales API"""
    if not API_KEY:
        raise HTTPException(status_code=500, detail="API key not configured")
    
    headers = {
        'Accept': 'application/json, text/plain',
        'Authorization': f"Bearer {API_KEY}"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{BASE_URL}/{endpoint}",
                headers=headers,
                params=params or {}
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=f"API request failed: {str(e)}")

async def get_congress_trades(
    ticker: Optional[str] = None,
    congress_member: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
) -> Dict:
    """Fetch congress trades from Unusual Whales API with optional filters"""
    try:
        params = {
            **({"ticker": ticker} if ticker else {}),
            **({"congress_member": congress_member} if congress_member else {}),
            **({"start_date": start_date} if start_date else {}),
            **({"end_date": end_date} if end_date else {})
        }
        response = await make_api_request("congress/recent-trades", params)
        return {
            "data": response.get('data', []),
            "insight": generate_congress_trades_insight(response.get('data', []))
        }
    except Exception:
        # Fallback to mock data
        mock_data = generate_mock_congress_trades(ticker, congress_member, start_date, end_date)
        return {
            "data": mock_data,
            "insight": generate_congress_trades_insight(mock_data)
        }
