import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from analysis import StockAnalyzer
from config import UNUSUAL_WHALES_API_KEY, SYMBOL

class TradingAlgorithm:
    """Trading algorithm for NVDA stock analysis combining technical indicators and options flow data.
    
    Technical Indicators:
    - Moving Averages (20/50-day): Trend identification and support/resistance levels
    - RSI (14-day): Momentum indicator identifying overbought (>70) or oversold (<30) conditions
    - MACD: Trend and momentum indicator using (12,26,9) day EMAs
    - Bollinger Bands: Volatility-based indicator using 20-day SMA ±2 standard deviations
    - Volume Analysis: Confirms price movements with trading volume strength
    """
    
    def __init__(self):
        self.analyzer = StockAnalyzer()
        self.analyzer.prepare_data()
        self.unusual_whales_base_url = "https://api.unusualwhales.com/v2"
        self.technical_weight = 0.6  # Weight for technical analysis
        self.options_weight = 0.4    # Weight for options flow
        
    def _get_options_flow(self):
        """Fetches options flow data from Unusual Whales API.
        
        Returns:
            list: Options trades with premium values and trade types.
            Empty list if API call fails or no data available.
        """
        headers = {"Authorization": f"Bearer {UNUSUAL_WHALES_API_KEY}"}
        endpoint = f"{self.unusual_whales_base_url}/flow"
        params = {
            "ticker": SYMBOL,
            "limit": 100,
            "timeframe": "1d"
        }
        
        try:
            response = requests.get(endpoint, headers=headers, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            return data.get('data', [])
        except requests.exceptions.Timeout:
            print("Timeout while fetching options flow data")
            return []
        except requests.exceptions.RequestException as e:
            print(f"Error fetching options flow data: {e}")
            return []
        except Exception as e:
            print(f"Error fetching options flow data: {e}")
            return None
            
    def generate_trading_signals(self):
        """Generates comprehensive trading signals for NVDA stock.
        
        Returns:
            dict: Contains three components:
                - technical_signals: Based on price action and indicators
                - options_signals: From institutional trading activity
                - combined_recommendation: Final signal with confidence level
        
        Signal confidence levels:
            - High (>70%): Strong conviction in the signal
            - Medium (30-70%): Mixed signals, moderate conviction
            - Low (<30%): Weak conviction, potentially conflicting signals
        """
        technical_signals = self._generate_technical_signals()
        options_signals = self._analyze_options_flow()
        
        return {
            'technical_signals': technical_signals,
            'options_signals': options_signals,
            'combined_recommendation': self._combine_signals(technical_signals, options_signals)
        }
        
    def _generate_technical_signals(self):
        """Analyzes technical indicators to generate trading signals.
        
        Analyzes multiple technical indicators with weighted importance:
        - Trend Analysis (40%): Moving averages for trend direction
        - RSI Analysis (20%): Momentum and overbought/oversold conditions
        - MACD Analysis (20%): Trend strength and momentum shifts
        - Volume Analysis (20%): Price movement confirmation
        
        Returns:
            dict: Contains signal type, confidence score, and detailed reasons
        """
        data = self.analyzer.data
        if data is None or len(data) < 50:
            return {'signal': 'NEUTRAL', 'confidence': 0, 'reasons': ['Insufficient data']}
            
        latest = data.iloc[-1]
        prev = data.iloc[-2]  # Previous day's data
        signals = []
        confidence_factors = []
        
        # Trend Analysis (40% weight)
        trend_score = 0
        if latest['Close'] > latest['SMA_20']:
            trend_score += 20
            signals.append('Bullish: Price above 20-day SMA indicating short-term uptrend')
        if latest['Close'] > latest['SMA_50']:
            trend_score += 20
            signals.append('Bullish: Price above 50-day SMA indicating medium-term uptrend')
        if latest['SMA_20'] > latest['SMA_50']:
            trend_score += 10
            signals.append('Bullish: Golden Cross pattern forming (20-day above 50-day)')
        confidence_factors.append(trend_score * 0.4)
        
        # RSI Analysis (20% weight)
        rsi_score = 0
        if latest['RSI'] < 30:
            rsi_score = 100
            signals.append('Bullish: RSI below 30 indicates oversold conditions')
        elif latest['RSI'] > 70:
            rsi_score = 0
            signals.append('Bearish: RSI above 70 indicates overbought conditions')
        else:
            rsi_score = 50
            if latest['RSI'] > prev['RSI']:
                signals.append('Neutral-Bullish: RSI showing increasing momentum')
            else:
                signals.append('Neutral-Bearish: RSI showing decreasing momentum')
        confidence_factors.append(rsi_score * 0.2)
        
        # MACD Analysis (20% weight)
        macd_score = 0
        if latest['MACD'] > latest['Signal_Line']:
            macd_score = 100
            signals.append('Bullish: MACD above signal line indicating upward momentum')
            if latest['MACD_Histogram'] > 0 and latest['MACD_Histogram'] > prev['MACD_Histogram']:
                signals.append('Bullish: MACD histogram increasing, strong momentum')
        else:
            signals.append('Bearish: MACD below signal line indicating downward momentum')
            if latest['MACD_Histogram'] < 0 and latest['MACD_Histogram'] < prev['MACD_Histogram']:
                signals.append('Bearish: MACD histogram decreasing, strong downward momentum')
        confidence_factors.append(macd_score * 0.2)
        
        # Volume Analysis (10% weight)
        volume_score = 0
        if latest['Volume'] > latest['Volume_SMA_20']:
            volume_score = 100
            if latest['Close'] > prev['Close']:
                signals.append('Bullish: Above average volume on price increase')
            else:
                signals.append('Bearish: Above average volume on price decrease')
        confidence_factors.append(volume_score * 0.1)
        
        # Bollinger Bands Analysis (10% weight)
        bb_score = 0
        if latest['Close'] > latest['BB_upper']:
            bb_score = 0
            signals.append('Bearish: Price above upper Bollinger Band indicating overbought')
        elif latest['Close'] < latest['BB_lower']:
            bb_score = 100
            signals.append('Bullish: Price below lower Bollinger Band indicating oversold')
        else:
            bb_score = 50
            if latest['Close'] > latest['BB_middle']:
                signals.append('Neutral-Bullish: Price above middle Bollinger Band')
            else:
                signals.append('Neutral-Bearish: Price below middle Bollinger Band')
        confidence_factors.append(bb_score * 0.1)
        
        total_confidence = sum(confidence_factors)
        signal = 'NEUTRAL'
        if total_confidence >= 70:
            signal = 'BUY'
        elif total_confidence <= 30:
            signal = 'SELL'
            
        return {
            'signal': signal,
            'confidence': total_confidence,
            'reasons': signals
        }
        
    def _analyze_options_flow(self):
        """Analyzes options flow data to gauge institutional sentiment.
        
        Analyzes two key metrics:
        1. Call/Put Ratio: Volume-based sentiment indicator
           - Ratio > 0.6: Bullish sentiment (more calls than puts)
           - Ratio < 0.4: Bearish sentiment (more puts than calls)
           
        2. Premium Analysis: Dollar-weighted sentiment
           - Premium Ratio > 0.6: Strong bullish conviction
           - Premium Ratio < 0.4: Strong bearish conviction
        
        Returns:
            dict: Contains signal type, confidence score, and detailed reasons
        """
        flow_data = self._get_options_flow()
        if not flow_data:
            return {'signal': 'NEUTRAL', 'confidence': 50, 'reasons': ['No options flow data available']}
            
        # Analyze call/put ratio and premium values
        calls = [trade for trade in flow_data if trade['type'] == 'call']
        puts = [trade for trade in flow_data if trade['type'] == 'put']
        
        call_premium = sum(trade.get('premium', 0) for trade in calls)
        put_premium = sum(trade.get('premium', 0) for trade in puts)
        
        signals = []
        confidence = 50  # Start neutral
        
        # Analyze call/put ratio
        total_contracts = len(calls) + len(puts)
        if total_contracts > 0:
            call_ratio = len(calls) / total_contracts
            if call_ratio > 0.6:
                confidence += 20
                signals.append('Bullish: High call option volume indicating institutional buying')
            elif call_ratio < 0.4:
                confidence -= 20
                signals.append('Bearish: High put option volume indicating institutional hedging')
            else:
                signals.append('Neutral: Balanced call/put ratio suggesting mixed sentiment')
                
        # Analyze premium ratio
        total_premium = call_premium + put_premium
        if total_premium > 0:
            premium_ratio = call_premium / total_premium
            if premium_ratio > 0.6:
                confidence += 20
                signals.append('Bullish: Large capital flow into call options')
            elif premium_ratio < 0.4:
                confidence -= 20
                signals.append('Bearish: Large capital flow into put options')
            else:
                signals.append('Neutral: Balanced premium distribution between calls and puts')
                
        signal = 'NEUTRAL'
        if confidence >= 70:
            signal = 'BUY'
        elif confidence <= 30:
            signal = 'SELL'
            
        return {
            'signal': signal,
            'confidence': confidence,
            'reasons': signals
        }
        
    def _combine_signals(self, technical_signals, options_signals):
        """Combines technical and options analysis signals into a final recommendation.
        
        Signal Interpretation:
        - BUY: Combined confidence >= 70%
        - SELL: Combined confidence <= 30%
        - NEUTRAL: Combined confidence between 30-70%
        """
        combined_confidence = (
            technical_signals['confidence'] * self.technical_weight +
            options_signals['confidence'] * self.options_weight
        )
        
        signal = 'NEUTRAL'
        if combined_confidence >= 70:
            signal = 'BUY'
        elif combined_confidence <= 30:
            signal = 'SELL'
            
        return {
            'signal': signal,
            'confidence': combined_confidence,
            'technical_reasons': technical_signals['reasons'],
            'options_reasons': options_signals['reasons']
        }
