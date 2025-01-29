import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from analysis import StockAnalyzer
from config import UNUSUAL_WHALES_API_KEY, SYMBOL

class TradingAlgorithm:
    def __init__(self):
        self.analyzer = StockAnalyzer()
        self.analyzer.prepare_data()
        self.unusual_whales_base_url = "https://api.unusualwhales.com/v2"
        
    def _get_options_flow(self):
        headers = {"Authorization": f"Bearer {UNUSUAL_WHALES_API_KEY}"}
        endpoint = f"{self.unusual_whales_base_url}/flow"
        params = {
            "ticker": SYMBOL,
            "limit": 100,
            "timeframe": "1d"
        }
        
        try:
            response = requests.get(endpoint, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            return data.get('data', [])
        except Exception as e:
            print(f"Error fetching options flow data: {e}")
            return None
            
    def generate_trading_signals(self):
        technical_signals = self._generate_technical_signals()
        options_signals = self._analyze_options_flow()
        
        return {
            'technical_signals': technical_signals,
            'options_signals': options_signals,
            'combined_recommendation': self._combine_signals(technical_signals, options_signals)
        }
        
    def _generate_technical_signals(self):
        data = self.analyzer.data
        if data is None or len(data) < 50:
            return {'signal': 'NEUTRAL', 'confidence': 0, 'reasons': ['Insufficient data']}
            
        latest = data.iloc[-1]
        signals = []
        confidence_factors = []
        
        # Trend Analysis (40% weight)
        trend_score = 0
        if latest['Close'] > latest['SMA_20']:
            trend_score += 20
            signals.append('Price above 20-day SMA')
        if latest['Close'] > latest['SMA_50']:
            trend_score += 20
            signals.append('Price above 50-day SMA')
        confidence_factors.append(trend_score * 0.4)
        
        # RSI Analysis (20% weight)
        rsi_score = 0
        if latest['RSI'] < 30:
            rsi_score = 100
            signals.append('RSI indicates oversold')
        elif latest['RSI'] > 70:
            rsi_score = 0
            signals.append('RSI indicates overbought')
        else:
            rsi_score = 50
        confidence_factors.append(rsi_score * 0.2)
        
        # MACD Analysis (20% weight)
        macd_score = 0
        if latest['MACD'] > latest['Signal_Line']:
            macd_score = 100
            signals.append('MACD above signal line')
        else:
            signals.append('MACD below signal line')
        confidence_factors.append(macd_score * 0.2)
        
        # Volume Analysis (20% weight)
        volume_score = 0
        if latest['Volume'] > latest['Volume_SMA_20']:
            volume_score = 100
            signals.append('Above average volume')
        confidence_factors.append(volume_score * 0.2)
        
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
        flow_data = self._get_options_flow()
        if not flow_data:
            return {'signal': 'NEUTRAL', 'confidence': 0, 'reasons': ['No options flow data available']}
            
        # Analyze call/put ratio and premium values
        calls = [trade for trade in flow_data if trade['type'] == 'call']
        puts = [trade for trade in flow_data if trade['type'] == 'put']
        
        call_premium = sum(trade['premium'] for trade in calls)
        put_premium = sum(trade['premium'] for trade in puts)
        
        signals = []
        confidence = 50  # Start neutral
        
        # Analyze call/put ratio
        if len(calls) + len(puts) > 0:
            call_ratio = len(calls) / (len(calls) + len(puts))
            if call_ratio > 0.6:
                confidence += 20
                signals.append('High call option activity')
            elif call_ratio < 0.4:
                confidence -= 20
                signals.append('High put option activity')
                
        # Analyze premium ratio
        if call_premium + put_premium > 0:
            premium_ratio = call_premium / (call_premium + put_premium)
            if premium_ratio > 0.6:
                confidence += 20
                signals.append('Large call option premiums')
            elif premium_ratio < 0.4:
                confidence -= 20
                signals.append('Large put option premiums')
                
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
        # Weight technical analysis 60% and options flow 40%
        technical_weight = 0.6
        options_weight = 0.4
        
        combined_confidence = (
            technical_signals['confidence'] * technical_weight +
            options_signals['confidence'] * options_weight
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
