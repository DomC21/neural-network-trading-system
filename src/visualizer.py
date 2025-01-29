import matplotlib.pyplot as plt
import seaborn as sns
from analysis import StockAnalyzer
import pandas as pd

class StockVisualizer:
    def __init__(self):
        self.analyzer = StockAnalyzer()
        self.analyzer.prepare_data()
        
    def plot_technical_analysis(self, save_path='nvda_technical_analysis.png'):
        """Create a comprehensive technical analysis plot for NVDA"""
        data = self.analyzer.data
        
        # Create figure and subplots
        fig = plt.figure(figsize=(15, 12))
        gs = fig.add_gridspec(3, 1, height_ratios=[2, 1, 1])
        
        # Price and Moving Averages
        ax1 = fig.add_subplot(gs[0])
        ax1.plot(data.index, data['Close'], label='NVDA Price', color='blue')
        ax1.plot(data.index, data['SMA_20'], label='20-day SMA', color='orange')
        ax1.plot(data.index, data['SMA_50'], label='50-day SMA', color='red')
        ax1.plot(data.index, data['BB_upper'], label='Bollinger Upper', color='gray', linestyle='--')
        ax1.plot(data.index, data['BB_lower'], label='Bollinger Lower', color='gray', linestyle='--')
        ax1.fill_between(data.index, data['BB_upper'], data['BB_lower'], alpha=0.1, color='gray')
        ax1.set_title('NVDA Technical Analysis')
        ax1.set_ylabel('Price ($)')
        ax1.legend()
        ax1.grid(True)
        
        # RSI
        ax2 = fig.add_subplot(gs[1])
        ax2.plot(data.index, data['RSI'], label='RSI', color='purple')
        ax2.axhline(y=70, color='r', linestyle='--', alpha=0.5)
        ax2.axhline(y=30, color='g', linestyle='--', alpha=0.5)
        ax2.set_ylabel('RSI')
        ax2.legend()
        ax2.grid(True)
        
        # MACD
        ax3 = fig.add_subplot(gs[2])
        ax3.plot(data.index, data['MACD'], label='MACD', color='blue')
        ax3.plot(data.index, data['Signal_Line'], label='Signal Line', color='orange')
        ax3.bar(data.index, data['MACD'] - data['Signal_Line'], alpha=0.3, color='gray')
        ax3.set_ylabel('MACD')
        ax3.legend()
        ax3.grid(True)
        
        plt.tight_layout()
        plt.savefig(save_path)
        plt.close()
        
        return save_path
        
    def generate_analysis_report(self):
        """Generate a comprehensive analysis report for NVDA"""
        stats = self.analyzer.get_summary_statistics()
        signals = self.analyzer.get_current_signals()
        
        report = f"""NVDA Stock Analysis Report

Current Statistics:
------------------
Current Price: ${stats['current_price']:.2f}
Daily Return: {stats['daily_return']:.2f}%
Volatility (Daily): {stats['volatility']:.2f}%
Average Volume: {stats['avg_volume']:,.0f}
RSI: {stats['rsi']:.2f}
MACD: {stats['macd']:.2f}

Technical Signals:
-----------------
"""
        for signal in signals:
            report += f"- {signal}\n"
            
        return report
