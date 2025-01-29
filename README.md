# Neural Network Trading System

A sophisticated trading algorithm focused on NVDA stock analysis using multiple data sources and neural network predictions.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file with your API keys:
```
UNUSUAL_WHALES_API_KEY=your_key
POLYGON_API_KEY=your_key
ALPHA_VANTAGE_API_KEY=your_key
```

## Project Structure

- `src/config.py`: Configuration and environment variables
- `src/data_fetcher.py`: Data collection from various APIs
