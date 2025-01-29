import pandas as pd
import numpy as np
from data_collector import DataCollector

class StockAnalyzer:
    def __init__(self):
        self.collector = DataCollector()
        self.data = None
        
    def prepare_data(self):
        """Fetch and prepare data for analysis"""
        raw_data = self.collector.collect_all_data()
        
        # Use YFinance as primary source due to data quality and consistency
        if 'yfinance' not in raw_data or raw_data['yfinance'] is None or len(raw_data['yfinance']) == 0:
            raise ValueError("Failed to fetch YFinance data")
            
        self.data = raw_data['yfinance']
        
        # Calculate technical indicators
        self.calculate_indicators()
        
    def calculate_indicators(self):
        """Calculate technical indicators for NVDA"""
        if self.data is None or len(self.data) == 0:
            raise ValueError("No data available for analysis. Please call prepare_data() first.")
            
        # Get price and volume data with column name flexibility
        try:
            close_series = self.data['Close'] if 'Close' in self.data.columns else self.data['close']
            volume_series = self.data['Volume'] if 'Volume' in self.data.columns else self.data['volume']
        except KeyError as e:
            raise ValueError(f"Required price data not found in DataFrame: {e}")
        
        # Simple Moving Averages
        self.data['SMA_20'] = close_series.rolling(window=20).mean()
        self.data['SMA_50'] = close_series.rolling(window=50).mean()
        
        # Relative Strength Index (14-day)
        delta = close_series.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        self.data['RSI'] = 100 - (100 / (1 + rs))
        
        # MACD (12,26,9)
        exp1 = close_series.ewm(span=12, adjust=False).mean()
        exp2 = close_series.ewm(span=26, adjust=False).mean()
        self.data['MACD'] = exp1 - exp2
        self.data['Signal_Line'] = self.data['MACD'].ewm(span=9, adjust=False).mean()
        self.data['MACD_Histogram'] = self.data['MACD'] - self.data['Signal_Line']
        
        # Bollinger Bands (20-day, 2 standard deviations)
        self.data['BB_middle'] = close_series.rolling(window=20).mean()
        std = close_series.rolling(window=20).std()
        self.data['BB_upper'] = self.data['BB_middle'] + (std * 2)
        self.data['BB_lower'] = self.data['BB_middle'] - (std * 2)
        
        # Volume Analysis
        self.data['Volume_SMA_20'] = volume_series.rolling(window=20).mean()
        
    def get_current_signals(self):
        """Generate trading signals based on technical indicators"""
        if self.data is None or len(self.data) < 50:
            return "Insufficient data for analysis"
            
        latest = self.data.iloc[-1]
        signals = []
        
        # Trend Analysis
        if latest['Close'] > latest['SMA_50']:
            signals.append("BULLISH: Price above 50-day SMA indicating uptrend")
        else:
            signals.append("BEARISH: Price below 50-day SMA indicating downtrend")
            
        # RSI Analysis
        if latest['RSI'] > 70:
            signals.append("OVERBOUGHT: RSI above 70 suggesting potential reversal")
        elif latest['RSI'] < 30:
            signals.append("OVERSOLD: RSI below 30 suggesting potential buying opportunity")
            
        # MACD Analysis
        if latest['MACD'] > latest['Signal_Line']:
            signals.append("BULLISH: MACD above signal line suggesting upward momentum")
        else:
            signals.append("BEARISH: MACD below signal line suggesting downward momentum")
            
        # Volume Analysis
        if latest['Volume'] > latest['Volume_SMA_20']:
            signals.append("HIGH VOLUME: Above average volume indicating strong price action")
            
        return signals
        
    def get_summary_statistics(self):
        """Generate summary statistics for NVDA"""
        if self.data is None:
            return "No data available"
            
        return {
            'current_price': self.data['Close'].iloc[-1],
            'daily_return': self.data['Close'].pct_change().iloc[-1] * 100,
            'volatility': self.data['Close'].pct_change().std() * 100,
            'avg_volume': self.data['Volume'].mean(),
            'rsi': self.data['RSI'].iloc[-1],
            'macd': self.data['MACD'].iloc[-1]
        }
