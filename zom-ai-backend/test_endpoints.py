import requests
import json
import time

BASE_URL = "https://zom-ai-backend-eyvrtzpz.fly.dev"

def test_health():
    print("\nTesting health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/healthz", timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {str(e)}")
        return False

def test_stock_data():
    print("\nTesting stock data endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/stock/AAPL", timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Stock data check failed: {str(e)}")
        return False

def test_metric_analysis():
    print("\nTesting metric analysis endpoint...")
    try:
        data = {
            "metric": "RSI",
            "value": "65"
        }
        response = requests.post(
            f"{BASE_URL}/api/analyze-metric",
            json=data,
            timeout=10
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Metric analysis check failed: {str(e)}")
        return False

def main():
    print("Starting API tests...")
    time.sleep(2)  # Give the server a moment to fully start
    
    health_ok = test_health()
    if not health_ok:
        print("Health check failed, skipping other tests")
        return
    
    stock_ok = test_stock_data()
    if not stock_ok:
        print("Stock data test failed, skipping metric analysis")
        return
    
    metric_ok = test_metric_analysis()
    
    print("\nTest Summary:")
    print(f"Health Check: {'✓' if health_ok else '✗'}")
    print(f"Stock Data: {'✓' if stock_ok else '✗'}")
    print(f"Metric Analysis: {'✓' if metric_ok else '✗'}")

if __name__ == "__main__":
    main()
