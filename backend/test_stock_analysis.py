import asyncio
from app.services.stock_analysis import analyze_stock

async def test_analysis():
    result = await analyze_stock('AAPL', '6mo')
    print("Technical Analysis:")
    print(result['technical_analysis'])
    print("\nFundamental Analysis:")
    print(result['fundamental_analysis'])
    print("\nAI Insight:")
    print(result['ai_insight'])

if __name__ == '__main__':
    asyncio.run(test_analysis())
