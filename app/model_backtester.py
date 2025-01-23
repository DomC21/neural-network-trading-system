import numpy as np
import pandas as pd
from typing import Dict, List, Union, Optional, Any, Type
import logging
import inspect
import traceback
from pandas import Series, DataFrame

# Configure logging
logging.basicConfig(level=logging.INFO)
from mock_fnn_model import MockStockPredictionFNN
from backtester import TradingSimulator
from data_handler import FinancialDataHandler
from fnn_model import StockPredictionFNN
from rnn_model import StockPredictionRNN
from lstm_model import StockPredictionLSTM


class ModelBacktester:
    """Integrates FNN model predictions with backtesting framework"""

    def __init__(self,
                 model: Union[MockStockPredictionFNN, 'StockPredictionFNN', 'StockPredictionRNN', 'StockPredictionLSTM'],
                 data_handler: FinancialDataHandler,
                 initial_capital: float = 100000.0,
                 transaction_cost: float = 0.0005,   # Reduced transaction cost
                 prediction_threshold: float = 0.55, # More conservative threshold
                 stop_loss: float = 0.01,           # 1% stop loss
                 take_profit: float = 0.02,         # 2% take profit
                 max_position_size: float = 0.2,    # 20% max position per asset
                 min_position_size: float = 0.05,   # 5% minimum position per asset
                 max_portfolio_size: float = 0.8,   # 80% max total portfolio exposure
                 risk_free_rate: float = 0.02,      # 2% risk-free rate for Sharpe ratio
                 rebalance_frequency: str = 'daily', # Rebalancing frequency
                 correlation_threshold: float = 0.7, # Maximum correlation between assets
                 volatility_target: float = 0.15,   # Annual volatility target
                 sequence_length: int = 10):        # Sequence length for RNN/LSTM models
        """
        Initialize model backtester with conservative risk management

        Args:
            model: Trained FNN model
            data_handler: Data handler instance
            initial_capital: Starting capital for backtesting
            transaction_cost: Cost per trade as fraction
            prediction_threshold: Threshold for converting predictions to signals
            stop_loss: Stop loss percentage
            take_profit: Take profit percentage
            max_position_size: Maximum position size as fraction of capital
            min_position_size: Minimum position size as fraction of capital
        """
        self.model = model
        self.data_handler = data_handler
        self.initial_capital = initial_capital
        self.max_position_size = max_position_size
        self.min_position_size = min_position_size
        self.max_portfolio_size = max_portfolio_size
        self.risk_free_rate = risk_free_rate
        self.rebalance_frequency = rebalance_frequency
        self.correlation_threshold = correlation_threshold
        self.volatility_target = volatility_target
        self.prediction_threshold = prediction_threshold
        self.sequence_length = sequence_length
        
        # Portfolio state tracking
        self.current_positions = {}  # Symbol -> position size
        self.position_history = []   # List of position snapshots
        self.portfolio_value = []    # Historical portfolio values
        self.last_rebalance = None   # Timestamp of last rebalance
        
        # Detect model type with validation
        try:
            model_type = model.__class__.__name__
            valid_models = ['MockStockPredictionFNN', 'StockPredictionFNN', 
                          'StockPredictionRNN', 'StockPredictionLSTM']
            
            if model_type not in valid_models:
                raise ValueError(f"Unsupported model type: {model_type}. "
                              f"Must be one of: {valid_models}")
            
            self.is_sequential = model_type in ['StockPredictionRNN', 'StockPredictionLSTM']
            logging.info(f"Initialized backtester with {model_type} model")
            if self.is_sequential:
                logging.info(f"Using sequence length: {sequence_length}")
        except Exception as e:
            logging.error(f"Error detecting model type: {str(e)}")
            raise

        # Initialize simulator with extreme ultra-conservative risk parameters
        self.simulator = TradingSimulator(
            initial_capital=initial_capital,
            transaction_cost=0.00005,  # Ultra-minimal transaction cost
            stop_loss=0.001,          # 0.1% stop loss - extreme protection
            take_profit=0.002,        # 0.2% take profit - ultra-conservative targets
            max_position_size=0.003,  # 0.3% max position - extreme minimal exposure
            min_position_size=0.001,  # 0.1% minimum position - micro-positions allowed
            volatility_scaling=True,   # Enable dynamic sizing
            max_trades_per_day=1      # Very conservative trade frequency
        )

    def generate_signals(self, predictions: np.ndarray, market_condition: str = 'normal') -> pd.Series:
        """
        Convert model predictions to trading signals with market regime adaptation
        and enhanced risk management

        Args:
            predictions: Model prediction probabilities
            market_condition: Current market condition ('bullish', 'bearish', 'sideways')

        Returns:
            pd.Series: Trading signals (-1, 0, 1)
        """
        # Ensure predictions is a numpy array
        predictions_array = np.asarray(predictions).flatten()

        # Initialize regime-specific parameters with balanced conservative approach
        regime_params = {
            'bullish': {
                'long_threshold': 0.70,   # Selective but achievable long entries
                'short_threshold': 0.85,  # Very selective shorts
                'min_position': 0.05,     # Meaningful base position
                'max_position': 0.15,     # Moderate position sizing
                'trend_threshold': 0.05,  # Balanced trend requirement
                'vol_threshold': 1.2,     # Moderate volatility tolerance
                'quality_threshold': 0.7,  # Quality signals required
                'momentum_threshold': 0.6  # Clear momentum required
            },
            'bearish': {
                'long_threshold': 0.85,   # Very selective longs
                'short_threshold': 0.70,  # Selective but achievable shorts
                'min_position': 0.04,     # Conservative base position
                'max_position': 0.12,     # Moderate position sizing
                'trend_threshold': 0.06,  # Balanced trend requirement
                'vol_threshold': 1.15,    # Moderate volatility tolerance
                'quality_threshold': 0.75,  # Strong quality required
                'momentum_threshold': 0.65  # Clear momentum required
            },
            'sideways': {
                'long_threshold': 0.80,   # Very selective entries both ways
                'short_threshold': 0.80,  # Very selective entries both ways
                'min_position': 0.03,     # Small but meaningful position
                'max_position': 0.08,     # Conservative sizing
                'trend_threshold': 0.07,  # Strict trend requirement
                'vol_threshold': 1.1,     # Lower volatility tolerance
                'quality_threshold': 0.8,  # High quality required
                'momentum_threshold': 0.7  # Strong momentum required
            }
        }

        # Get regime-specific parameters
        params = regime_params.get(market_condition, regime_params['sideways'])

        # Calculate rolling volatility for adaptive sizing
        rolling_std = pd.Series(predictions_array).rolling(
            window=20, min_periods=1).std()
        volatility = rolling_std.mean()
        vol_ratio = rolling_std / \
            rolling_std.rolling(window=50, min_periods=1).mean()

        # Enhanced adaptive thresholds with market regime consideration
        # Get base thresholds from regime parameters
        long_threshold = params['long_threshold']
        short_threshold = params['short_threshold']
        min_position_size = params['min_position']
        max_position_size = params['max_position']

        # Enhanced volatility-based position scaling with balanced limits
        vol_scale = np.clip(1.2 - (vol_ratio - 1.0), 0.3,
                            1.0)  # More balanced range

        # Calculate trend components with proper validation
        predictions_series = pd.Series(predictions_array)
        trend_short = predictions_series.rolling(
            window=5, min_periods=1).mean()
        trend_medium = predictions_series.rolling(
            window=10, min_periods=1).mean()
        trend_long = predictions_series.rolling(
            window=20, min_periods=1).mean()

        # Calculate trend persistence with proper validation
        trend_diff = trend_short.diff().fillna(0)
        trend_persistence = pd.Series(
            (np.sign(trend_diff) == np.sign(trend_diff.shift(1))).astype(float)
        ).rolling(window=5, min_periods=1).mean()

        # Calculate momentum confirmation with validation
        momentum_strength = np.zeros_like(predictions_array)
        valid_trends = ~(trend_short.isna() |
                         trend_medium.isna() | trend_long.isna())
        if valid_trends.any():
            momentum_confirmed = (
                (trend_short > trend_medium) &
                (trend_medium > trend_long) &
                (abs(trend_medium - 0.5) > params['trend_threshold'])
            ).astype(float)
            momentum_strength[valid_trends] = momentum_confirmed[valid_trends]

        # Calculate base scale with comprehensive validation
        base_scale = np.where(
            vol_ratio < params['vol_threshold'],
            vol_scale,  # Use vol_scale directly in low volatility
            vol_scale * 0.3  # Severe reduction in high volatility
        )

        # Calculate trend quality score
        trend_quality = pd.Series(0.0, index=predictions_series.index)
        valid_quality = valid_trends & (trend_persistence > 0.6)
        if valid_quality.any():
            trend_quality[valid_quality] = np.clip(
                0.4 * abs(trend_short[valid_quality] - 0.5) +
                0.3 * abs(trend_medium[valid_quality] - 0.5) +
                0.3 * trend_persistence[valid_quality],
                0, 1
            )

        # Apply market condition adjustments with ultra-conservative scaling
        if market_condition == 'bullish':
            position_scale = np.where(
                (momentum_strength > 0) & (trend_quality > 0.6),
                base_scale * 0.8,  # 80% of base scale when confirmed
                base_scale * 0.5   # 50% of base scale otherwise
            )
        elif market_condition == 'bearish':
            position_scale = np.where(
                (momentum_strength > 0) & (trend_quality > 0.7),
                base_scale * 0.7,  # 70% of base scale when confirmed
                base_scale * 0.4   # 40% of base scale otherwise
            )
        else:  # sideways
            position_scale = np.where(
                (momentum_strength > 0) & (trend_quality > 0.8),
                base_scale * 0.6,  # 60% of base scale when confirmed
                base_scale * 0.3   # 30% of base scale otherwise
            )

        # Initialize arrays with proper validation
        signals_array = np.zeros(len(predictions_array), dtype=np.float64)
        signal_quality = np.zeros(len(predictions_array), dtype=np.float64)

        # Enhanced trend calculation with proper NaN handling
        def calculate_trend(data, window):
            trend = pd.Series(data).rolling(
                window=window, min_periods=max(2, window//2)).mean()
            # Handle NaN values with forward fill first, then backward fill, then default
            # Fill with mean or neutral
            trend = trend.fillna(
                trend.mean() if not trend.isna().all() else 0.5)
            return trend

        # Calculate multi-timeframe trends
        trend_short = calculate_trend(
            predictions_array, 3)    # Very short-term
        trend_medium = calculate_trend(predictions_array, 5)   # Short-term
        trend_long = calculate_trend(predictions_array, 8)     # Medium-term
        trend_super = calculate_trend(predictions_array, 13)   # Long-term

        # Calculate trend persistence
        trend_diff_short = trend_short.diff().fillna(0)
        trend_diff_medium = trend_medium.diff().fillna(0)

        # Enhanced trend alignment with strength consideration
        trend_aligned = (
            (np.sign(trend_short - 0.5) == np.sign(trend_medium - 0.5)) &
            (np.sign(trend_medium - 0.5) == np.sign(trend_long - 0.5)) &
            # Minimum trend strength
            (abs(trend_medium - 0.5) > params['trend_threshold'])
        )

        # Ultra-conservative signal generation with enhanced validation
        # Calculate trend strength and persistence with robust validation
        trend_medium_np = trend_medium.to_numpy()
        trend_medium_np = np.nan_to_num(
            trend_medium_np, nan=0.5)  # Handle NaN values
        trend_strength = np.abs(trend_medium_np - 0.5)

        # Convert trend differences to numpy with validation
        trend_diff_short_np = np.nan_to_num(
            trend_diff_short.to_numpy(), nan=0.0)
        trend_diff_medium_np = np.nan_to_num(
            trend_diff_medium.to_numpy(), nan=0.0)

        # Calculate trend persistence with validated arrays
        trend_persistence = np.logical_and(
            np.equal(np.sign(trend_diff_short_np),
                     np.sign(trend_diff_medium_np)),
            np.greater(np.abs(trend_diff_medium_np),
                       float(params['trend_threshold']))
        )

        # Enhanced momentum confirmation with proper numpy conversion
        trend_short_np = trend_short.to_numpy()
        trend_medium_np = trend_medium.to_numpy()
        trend_long_np = trend_long.to_numpy()
        trend_super_np = trend_super.to_numpy()
        threshold = float(params['trend_threshold'])

        # Calculate momentum confirmation with numpy arrays
        momentum_confirmed = np.logical_and.reduce([
            np.greater(np.abs(trend_short_np - trend_medium_np), threshold),
            np.greater(np.abs(trend_medium_np - trend_long_np),
                       threshold * 0.8),
            np.greater(np.abs(trend_long_np - trend_super_np), threshold * 0.6)
        ])

        # Long signal conditions with strict validation
        long_signals = (
            # Price threshold
            (predictions_array > long_threshold) &
            # Volatility control
            (vol_ratio < params['vol_threshold']) &
            # Multi-timeframe alignment
            trend_aligned &
            trend_persistence &                                      # Trend persistence
            # Momentum confirmation
            momentum_confirmed &
            # Strong trend required
            (trend_strength > params['trend_threshold'] * 1.2) &
            # Immediate momentum
            (trend_short > trend_medium) &
            # Medium-term trend
            (trend_medium > trend_long) &
            # Long-term trend
            (trend_long > trend_super)
        )

        # Short signal conditions with stricter validation
        short_signals = (
            # Price threshold
            (predictions_array < (1 - short_threshold)) &
            # Stricter volatility control
            (vol_ratio < params['vol_threshold'] * 0.9) &
            # Multi-timeframe alignment
            trend_aligned &
            trend_persistence &                                      # Trend persistence
            # Momentum confirmation
            momentum_confirmed &
            # Stronger trend required
            (trend_strength > params['trend_threshold'] * 1.5) &
            # Immediate momentum
            (trend_short < trend_medium) &
            # Medium-term trend
            (trend_medium < trend_long) &
            # Long-term trend
            (trend_long < trend_super)
        )

        # Enhanced signal quality with ultra-conservative validation
        signal_quality = np.zeros_like(predictions_array)

        # Calculate trend quality with comprehensive validation
        trend_quality = np.clip(
            0.3 * np.abs(trend_short - 0.5) +     # Short-term trend strength
            0.3 * np.abs(trend_medium - 0.5) +    # Medium-term trend strength
            0.2 * np.abs(trend_long - 0.5) +      # Long-term trend strength
            # Super long-term confirmation
            0.1 * np.abs(trend_super - 0.5) +
            0.1 * (np.sign(trend_diff_short) ==
                   np.sign(trend_diff_medium)),  # Trend alignment
            0, 1
        )

        # Calculate momentum quality with strict validation
        momentum_quality = np.clip(
            0.4 * abs(trend_diff_short) +         # Recent momentum strength
            0.3 * abs(trend_diff_medium) +        # Medium-term momentum
            0.2 * trend_persistence.astype(float) +  # Trend persistence
            0.1 * (abs(trend_medium - trend_long) >
                   params['trend_threshold']),  # Trend divergence
            0, 1
        )

        # Calculate volatility quality (higher in lower volatility)
        volatility_quality = np.clip(
            0.6 * (1.5 - vol_ratio) +            # Lower volatility preference
            0.4 * (1 - abs(trend_diff_short)),   # Smooth price action
            0, 1
        )

        # Calculate signal persistence (time-based quality) with numpy arrays
        signal_persistence = np.clip(
            0.5 * (trend_strength > 0.7) +  # Strong trend requirement
            0.3 * (np.abs(trend_diff_medium) < 0.015) +  # Very stable trend
            0.2 * (vol_ratio < params['vol_threshold']),  # Stable volatility
            0, 1
        )

        # Calculate signal consistency (cross-validation) with numpy arrays
        signal_consistency = np.clip(
            # Aligned short/medium trends
            0.4 * (np.abs(trend_short - trend_medium) < 0.1) +
            # Aligned medium/long trends
            0.3 * (np.abs(trend_medium - trend_long) < 0.15) +
            # Aligned long/super trends
            0.3 * (np.abs(trend_long - trend_super) < 0.2),
            0, 1
        )

        # Combine all quality factors with ultra-conservative validation
        valid_signals = (
            # Strong trend quality
            (trend_quality > params['quality_threshold']) &
            # Strong momentum
            (momentum_quality > params['momentum_threshold']) &
            # Excellent volatility conditions
            (volatility_quality > 0.7) &
            # Very persistent signals
            (signal_persistence > 0.8) &
            # Highly consistent signals
            (signal_consistency > 0.7)
        )

        # Calculate final signal quality with strict requirements
        signal_quality[valid_signals] = np.clip(
            0.25 * trend_quality[valid_signals] +          # Trend component
            0.25 * momentum_quality[valid_signals] +       # Momentum component
            # Volatility component
            0.20 * volatility_quality[valid_signals] +
            # Persistence component
            0.15 * signal_persistence[valid_signals] +
            # Consistency component
            0.15 * signal_consistency[valid_signals],
            0, 1
        )

        # Calculate volatility quality (higher quality in lower volatility)
        vol_quality = np.clip(2.0 - vol_ratio, 0, 1)

        # Combine quality factors with validation
        valid_signals = (long_signals | short_signals)
        signal_quality[valid_signals] = np.clip(
            0.4 * trend_quality[valid_signals] +      # Trend strength
            0.4 * momentum_quality[valid_signals] +   # Momentum strength
            0.2 * vol_quality[valid_signals],         # Volatility contribution
            0, 1
        )

        # Enhanced position sizing with quality and persistence factors
        if np.any(long_signals):
            # Calculate confidence with multiple factors
            prediction_confidence = (
                predictions_array[long_signals] - long_threshold) / (1 - long_threshold)
            quality_factor = signal_quality[long_signals]

            # Combine factors with weights
            long_confidence = np.clip(
                0.4 * prediction_confidence +
                0.4 * quality_factor +
                # Lower confidence in high volatility
                0.2 * (1 - vol_ratio[long_signals]),
                params['min_position'], 1.0
            )

            # Apply position sizing with all constraints
            signals_array[long_signals] = (
                long_confidence *
                position_scale *
                max_position_size *
                # Additional volatility scaling
                (1 - vol_ratio[long_signals] * 0.2)
            )

        # Short positions with enhanced risk management
        if np.any(short_signals):
            prediction_confidence = (
                short_threshold - predictions_array[short_signals]) / short_threshold
            quality_factor = signal_quality[short_signals]

            short_confidence = np.clip(
                0.4 * prediction_confidence +
                0.4 * quality_factor +
                0.2 * (1 - vol_ratio[short_signals]),
                params['min_position'], 1.0
            )

            signals_array[short_signals] = -(
                short_confidence *
                position_scale *
                max_position_size *
                (1 - vol_ratio[short_signals] * 0.2)
            )

        # Enhanced regime-specific position sizing with quality and volatility consideration
        vol_ratio_value = float(vol_ratio.iloc[-1])
        quality_score = float(signal_quality.mean())  # Average signal quality

        # Base volatility scaling with regime-specific thresholds
        if market_condition == 'bullish':
            if vol_ratio_value > 1.3:      # Extreme volatility
                vol_scale = 0.3
            elif vol_ratio_value > 1.1:    # High volatility
                vol_scale = 0.5
            elif vol_ratio_value > 0.9:    # Normal volatility
                vol_scale = 0.8
            else:                          # Low volatility
                vol_scale = 1.0
        elif market_condition == 'bearish':
            if vol_ratio_value > 1.2:      # Extreme volatility
                vol_scale = 0.2            # More conservative in bear markets
            elif vol_ratio_value > 1.0:    # High volatility
                vol_scale = 0.4
            elif vol_ratio_value > 0.8:    # Normal volatility
                vol_scale = 0.6
            else:                          # Low volatility
                vol_scale = 0.8            # Cap maximum size in bear markets
        else:  # sideways
            if vol_ratio_value > 1.1:      # Extreme volatility
                vol_scale = 0.1            # Ultra-conservative in sideways
            elif vol_ratio_value > 0.9:    # High volatility
                vol_scale = 0.3
            elif vol_ratio_value > 0.8:    # Normal volatility
                vol_scale = 0.5
            else:                          # Low volatility
                vol_scale = 0.6            # Limited size in sideways markets

        # Enhanced quality-based adjustment with regime-specific thresholds
        if market_condition == 'bullish':
            if quality_score < 0.4:      # Stricter minimum quality
                vol_scale *= 0.3         # Significant reduction
            elif quality_score < 0.6:    # Medium quality
                vol_scale *= 0.6         # Moderate reduction
            elif quality_score < 0.8:    # Good quality
                vol_scale *= 0.9         # Mild reduction
            elif quality_score > 0.9:    # Excellent quality
                vol_scale *= 1.2         # Moderate increase
        elif market_condition == 'bearish':
            if quality_score < 0.5:      # Higher quality requirement
                vol_scale *= 0.2         # Severe reduction
            elif quality_score < 0.7:    # Medium quality
                vol_scale *= 0.4         # Significant reduction
            elif quality_score < 0.85:   # Good quality
                vol_scale *= 0.6         # Moderate reduction
            elif quality_score > 0.95:   # Exceptional quality
                vol_scale *= 0.8         # Limited increase
        else:  # sideways
            if quality_score < 0.6:      # Much higher quality requirement
                vol_scale *= 0.1         # Almost no position
            elif quality_score < 0.8:    # High quality requirement
                vol_scale *= 0.3         # Minimal position
            elif quality_score < 0.9:    # Very high quality
                vol_scale *= 0.5         # Half position
            elif quality_score > 0.95:   # Near-perfect quality
                vol_scale *= 0.7         # Still conservative

        # Market condition adjustment (more adaptive)
        if market_condition == 'sideways':
            if quality_score > 0.8:  # High quality sideways signals
                vol_scale *= 0.9  # Minor reduction
            else:
                vol_scale *= 0.7  # Moderate reduction
        elif market_condition == 'bearish':
            if quality_score > 0.8:  # High quality bear signals
                vol_scale *= 0.8  # Moderate reduction
            else:
                vol_scale *= 0.6  # Significant reduction
        elif market_condition == 'bullish' and quality_score > 0.8:
            vol_scale *= 1.2  # Increase for high quality bull signals

        signals_array = signals_array * vol_scale

        # Ensure position size limits
        signals_array = np.clip(
            signals_array, -self.max_position_size, self.max_position_size)

        # Add momentum-based filtering
        momentum_window = 5
        price_momentum = np.diff(
            predictions_array, n=momentum_window, prepend=np.zeros(momentum_window))

        # Enhanced momentum filtering with quality and volatility consideration
        momentum_quality = np.abs(price_momentum) / np.std(price_momentum)
        momentum_persistence = (np.sign(price_momentum) == np.sign(
            np.roll(price_momentum, 1))).astype(float)
        momentum_persistence = pd.Series(
            momentum_persistence).rolling(window=3).mean().fillna(0)

        # Calculate momentum thresholds based on market condition with enhanced validation
        if market_condition == 'sideways':
            mom_threshold = 0.8  # Stricter in sideways markets
            quality_threshold = 0.8
            persistence_threshold = 0.75  # High persistence required
            vol_threshold = 1.1  # Strict volatility control
        elif market_condition == 'bearish':
            mom_threshold = 0.7  # Strict in bearish markets
            quality_threshold = 0.75
            persistence_threshold = 0.7  # Strong persistence required
            vol_threshold = 1.0  # Very strict volatility control
        else:  # bullish
            mom_threshold = 0.6  # More permissive in bullish markets
            quality_threshold = 0.7
            persistence_threshold = 0.65  # Moderate persistence required
            vol_threshold = 1.2  # More tolerant volatility control

        # Initialize arrays with proper validation
        signals_array = np.asarray(signals_array)
        target_length = len(signals_array)

        # Validate and resize input arrays
        def validate_array(arr, name, default_value=0.0):
            arr = np.asarray(arr)
            if len(arr) != target_length:
                logging.warning(
                    f"{name} length mismatch: {len(arr)} vs {target_length}")
                if len(arr) > target_length:
                    return arr[:target_length]
                else:
                    return np.pad(arr, (0, target_length - len(arr)),
                                  mode='constant', constant_values=default_value)
            return arr

        # Resize all input arrays
        price_momentum = validate_array(price_momentum, "price_momentum")
        momentum_quality = validate_array(
            momentum_quality, "momentum_quality", 0.5)
        signal_quality = validate_array(signal_quality, "signal_quality", 0.5)
        momentum_persistence = validate_array(
            momentum_persistence, "momentum_persistence", 0.5)
        vol_ratio = validate_array(float(vol_ratio.iloc[-1]) * np.ones(target_length),
                                   "vol_ratio", 1.0)

        # Enhanced momentum filtering with comprehensive array validation
        try:
            # Initialize arrays with proper validation
            arrays_to_validate = {
                'price_momentum': price_momentum,
                'momentum_quality': momentum_quality,
                'signal_quality': signal_quality,
                'momentum_persistence': momentum_persistence,
                'vol_ratio': vol_ratio
            }

            validated_arrays = {}
            for name, arr in arrays_to_validate.items():
                try:
                    # Convert to numpy array with proper type handling
                    if isinstance(arr, (pd.Series, pd.DataFrame)):
                        arr_np = arr.values.astype(np.float64)
                    else:
                        arr_np = np.asarray(arr, dtype=np.float64)

                    # Handle special case for vol_ratio with proper type checking
                    if name == 'vol_ratio':
                        try:
                            if isinstance(arr, (pd.Series, pd.DataFrame)):
                                if not arr.empty:
                                    last_value = arr.iloc[-1]
                                    if isinstance(last_value, (int, float, np.number)):
                                        vol_ratio_value = float(last_value)
                                    else:
                                        vol_ratio_value = 1.0
                                else:
                                    vol_ratio_value = 1.0
                            else:
                                arr_temp = np.asarray(arr, dtype=np.float64)
                                if len(arr_temp) > 0 and not np.all(np.isnan(arr_temp)):
                                    vol_ratio_value = float(
                                        np.nanmean(arr_temp))
                                else:
                                    vol_ratio_value = 1.0
                        except (ValueError, TypeError, AttributeError) as e:
                            logging.warning(
                                f"Error processing vol_ratio: {str(e)}")
                            vol_ratio_value = 1.0
                        arr_np = np.full(len(signals_array),
                                         vol_ratio_value, dtype=np.float64)

                    # Validate array shape
                    if len(arr_np) != len(signals_array):
                        logging.warning(
                            f"Shape mismatch for {name}: {len(arr_np)} vs {len(signals_array)}")
                        if len(arr_np) > len(signals_array):
                            arr_np = arr_np[:len(signals_array)]
                        else:
                            pad_width = len(signals_array) - len(arr_np)
                            arr_np = np.concatenate([arr_np, np.full(
                                pad_width, arr_np[-1] if len(arr_np) > 0 else 0.5, dtype=np.float64)])

                    # Handle NaN values
                    arr_np = np.nan_to_num(arr_np.astype(
                        np.float64), nan=0.5, posinf=1.0, neginf=-1.0)

                    # Store validated array
                    validated_arrays[name] = arr_np

                except Exception as e:
                    logging.error(f"Error validating {name}: {str(e)}")
                    # Use neutral values on error
                    validated_arrays[name] = np.full_like(signals_array, 0.5)

            # Log validation results
            logging.info("\nArray Validation Results:")
            for name, arr in validated_arrays.items():
                logging.info(f"{name}:")
                logging.info(f"  Shape: {arr.shape}")
                logging.info(
                    f"  Range: [{np.min(arr):.4f}, {np.max(arr):.4f}]")
                logging.info(f"  Mean: {np.mean(arr):.4f}")

            # Update references with validated arrays
            price_momentum = validated_arrays['price_momentum']
            momentum_quality = validated_arrays['momentum_quality']
            signal_quality = validated_arrays['signal_quality']
            momentum_persistence = validated_arrays['momentum_persistence']
            vol_ratio_array = validated_arrays['vol_ratio']

            # Ensure all arrays have consistent shapes
            signals_array = np.asarray(signals_array)
            target_length = len(signals_array)

            # Resize arrays to match target length
            def resize_array(arr, target_size):
                arr = np.asarray(arr)
                if len(arr) != target_size:
                    if len(arr) > target_size:
                        return arr[:target_size]
                    else:
                        pad_width = target_size - len(arr)
                        return np.pad(arr, (0, pad_width), mode='edge')
                return arr

            # Resize all arrays to match signals_array length
            price_momentum = resize_array(price_momentum, target_length)
            momentum_quality = resize_array(momentum_quality, target_length)
            signal_quality = resize_array(signal_quality, target_length)
            momentum_persistence = resize_array(
                momentum_persistence, target_length)
            vol_ratio_array = resize_array(vol_ratio_array, target_length)

            # Validate final shapes
            arrays = [
                price_momentum,
                momentum_quality,
                signal_quality,
                momentum_persistence,
                vol_ratio_array
            ]
            shape_valid = all(len(arr) == target_length for arr in arrays)

            # Log array shapes for debugging
            logging.info("\nArray shapes before filtering:")
            logging.info(f"Target length: {target_length}")
            for arr, name in zip(arrays, ['price_mom', 'mom_qual', 'sig_qual', 'mom_pers', 'vol_ratio']):
                logging.info(f"{name}: {arr.shape}")

            if not shape_valid:
                logging.error("Array shape mismatch detected")
                return pd.Series(np.zeros(len(signals_array)), dtype=np.float64)

            # Enhanced momentum filtering with regime-specific thresholds
            if market_condition == 'bullish':
                mom_threshold = 0.65  # More permissive
                quality_threshold = 0.60
                persistence_threshold = 0.55
                vol_threshold = 1.2
            elif market_condition == 'bearish':
                mom_threshold = 0.75  # More conservative
                quality_threshold = 0.70
                persistence_threshold = 0.65
                vol_threshold = 1.0
            else:  # sideways
                mom_threshold = 0.70  # Balanced
                quality_threshold = 0.65
                persistence_threshold = 0.60
                vol_threshold = 1.1

            # Apply momentum filtering with consistent array shapes
            signals_np = signals_array  # Already converted to numpy array
            price_mom_np = price_momentum  # Already resized
            mom_qual_np = momentum_quality  # Already resized
            sig_qual_np = signal_quality  # Already resized
            mom_pers_np = momentum_persistence  # Already resized
            vol_ratio_np = vol_ratio_array  # Already resized

            # Log array shapes for debugging
            logging.info("\nArray shapes after resizing:")
            logging.info(f"Signals: {signals_np.shape}")
            logging.info(f"Price momentum: {price_mom_np.shape}")
            logging.info(f"Momentum quality: {mom_qual_np.shape}")
            logging.info(f"Signal quality: {sig_qual_np.shape}")
            logging.info(f"Momentum persistence: {mom_pers_np.shape}")
            logging.info(f"Volume ratio: {vol_ratio_np.shape}")

            # Ensure all arrays have the same length as signals
            target_length = len(signals_np)
            arrays_to_validate = [
                ('price_momentum', price_mom_np),
                ('momentum_quality', mom_qual_np),
                ('signal_quality', sig_qual_np),
                ('momentum_persistence', mom_pers_np),
                ('volatility_ratio', vol_ratio_np)
            ]

            for name, arr in arrays_to_validate:
                if len(arr) != target_length:
                    logging.warning(
                        f"Shape mismatch for {name}: {len(arr)} vs {target_length}")
                    # Pad or trim array to match target length
                    if len(arr) < target_length:
                        pad_width = target_length - len(arr)
                        arr = np.pad(arr, (0, pad_width), mode='edge')
                    else:
                        arr = arr[:target_length]

            # Update array references after validation
            price_mom_np = price_mom_np[:target_length]
            mom_qual_np = mom_qual_np[:target_length]
            sig_qual_np = sig_qual_np[:target_length]
            mom_pers_np = mom_pers_np[:target_length]
            vol_ratio_np = vol_ratio_np[:target_length]

            # Initialize mask with proper shape
            momentum_mask = np.zeros_like(signals_np, dtype=bool)

            # Filter conditions with explicit shape validation
            try:
                # Calculate individual conditions with proper broadcasting
                weak_momentum = np.abs(price_mom_np) < 0.001
                against_trend_long = (
                    (signals_np > 0) &
                    (price_mom_np < -0.002) &
                    (mom_qual_np > mom_threshold)
                )
                against_trend_short = (
                    (signals_np < 0) &
                    (price_mom_np > 0.002) &
                    (mom_qual_np > mom_threshold)
                )
                low_quality = sig_qual_np < quality_threshold
                low_persistence = mom_pers_np < persistence_threshold
                high_vol_low_quality = (
                    (vol_ratio_np > vol_threshold) &
                    (sig_qual_np < 0.8)
                )
            except Exception as e:
                logging.error(
                    f"Error calculating momentum conditions: {str(e)}")
                return pd.Series(np.zeros(len(signals_array)), dtype=np.float64)

            # Log array shapes and validation details
            logging.info("\nArray validation:")
            logging.info(
                f"Signals shape: {signals_np.shape}, valid: {np.sum(~np.isnan(signals_np))}")
            logging.info(
                f"Price momentum shape: {price_mom_np.shape}, valid: {np.sum(~np.isnan(price_mom_np))}")
            logging.info(
                f"Momentum quality shape: {mom_qual_np.shape}, valid: {np.sum(~np.isnan(mom_qual_np))}")
            logging.info(
                f"Signal quality shape: {sig_qual_np.shape}, valid: {np.sum(~np.isnan(sig_qual_np))}")
            logging.info(
                f"Momentum persistence shape: {mom_pers_np.shape}, valid: {np.sum(~np.isnan(mom_pers_np))}")
            logging.info(
                f"Volume ratio shape: {vol_ratio_np.shape}, valid: {np.sum(~np.isnan(vol_ratio_np))}")

            # Combine masks with validation and proper broadcasting
            try:
                # Create base mask with proper shape
                momentum_mask = np.zeros_like(signals_np, dtype=bool)

                # Combine conditions only where data is valid
                valid_mask = (
                    ~np.isnan(signals_np) &
                    ~np.isnan(price_mom_np) &
                    ~np.isnan(mom_qual_np) &
                    ~np.isnan(sig_qual_np) &
                    ~np.isnan(mom_pers_np) &
                    ~np.isnan(vol_ratio_np)
                )

                if np.any(valid_mask):
                    momentum_mask[valid_mask] = (
                        weak_momentum[valid_mask] |
                        against_trend_long[valid_mask] |
                        against_trend_short[valid_mask] |
                        low_quality[valid_mask] |
                        low_persistence[valid_mask] |
                        high_vol_low_quality[valid_mask]
                    )

                    # Log mask statistics
                    logging.info("\nMask Statistics:")
                    logging.info(f"Valid data points: {np.sum(valid_mask)}")
                    logging.info(
                        f"Total filtered signals: {np.sum(momentum_mask)}")
                    logging.info(
                        f"Filtered ratio: {np.sum(momentum_mask)/len(momentum_mask)*100:.2f}%")
                else:
                    logging.warning(
                        "No valid data points for momentum filtering")
                    momentum_mask = np.ones_like(
                        signals_np, dtype=bool)  # Conservative approach
            except Exception as e:
                logging.error(f"Error combining momentum masks: {str(e)}")
                momentum_mask = np.ones_like(
                    signals_np, dtype=bool)  # Conservative fallback

            # Apply mask and create signals
            signals_array[momentum_mask] = 0.0

            # Convert to pandas Series with validation
            signals = pd.Series(signals_array, dtype=np.float64)
            signals = signals.fillna(0)

            # Log signal statistics with proper type handling
            try:
                # Convert to numpy array for consistent operations
                signals_array = signals.to_numpy()
                active_mask = signals_array != 0
                long_mask = signals_array > 0
                short_mask = signals_array < 0

                if np.any(active_mask):
                    total_signals = len(signals_array)
                    active_count = np.sum(active_mask)
                    long_count = np.sum(long_mask)
                    short_count = np.sum(short_mask)

                    logging.info("\nSignal Statistics:")
                    logging.info(
                        f"Active signals: {active_count} ({active_count/total_signals*100:.2f}%)")
                    logging.info(
                        f"Long signals: {long_count} ({long_count/total_signals*100:.2f}%)")
                    logging.info(
                        f"Short signals: {short_count} ({short_count/total_signals*100:.2f}%)")
                    logging.info(
                        f"Signal range: {signals_array.min():.4f} to {signals_array.max():.4f}")

                    # Log signal distribution
                    if active_count > 0:
                        active_signals = signals_array[active_mask]
                        logging.info("\nActive Signal Distribution:")
                        logging.info(f"Mean: {np.mean(active_signals):.4f}")
                        logging.info(f"Std: {np.std(active_signals):.4f}")
                        logging.info(
                            f"25th percentile: {np.percentile(active_signals, 25):.4f}")
                        logging.info(
                            f"Median: {np.median(active_signals):.4f}")
                        logging.info(
                            f"75th percentile: {np.percentile(active_signals, 75):.4f}")

            except Exception as e:
                logging.error(f"Error calculating signal statistics: {str(e)}")

            return signals

        except Exception as e:
            logging.error(f"Error in momentum filtering: {str(e)}")
            return pd.Series(np.zeros(len(signals_array)), dtype=np.float64)

    def backtest(self, symbol: str, test_data: pd.DataFrame, market_condition: str = 'normal') -> Dict[str, Union[str, pd.DataFrame, Dict[str, float], np.ndarray, pd.Series]]:
        """
        Run backtesting using model predictions with market regime adaptation

        Args:
            symbol: Stock symbol
            test_data: Historical price data for testing
            market_condition: Current market condition ('bullish', 'bearish', 'sideways')

        Returns:
            dict: Results including:
                - symbol (str): Stock symbol
                - results (pd.DataFrame): Trading results
                - metrics (Dict[str, float]): Performance metrics
                - predictions (np.ndarray): Model predictions
                - signals (pd.Series): Trading signals
        """
        # Calculate indicators and prepare features with enhanced market analysis
        try:
            # Calculate technical indicators
            data_with_indicators = self.data_handler.calculate_technical_indicators(
                test_data)

            # Enhanced market condition detection
            returns = test_data['close'].pct_change()
            vol = returns.rolling(window=21).std() * np.sqrt(252)
            sma_20 = test_data['close'].rolling(window=20).mean()
            sma_50 = test_data['close'].rolling(window=50).mean()
            rsi = data_with_indicators['rsi']

            # Calculate market factors
            trend = (sma_20/sma_50 - 1).mean()
            volatility = vol.mean()
            momentum = returns.rolling(window=10).mean().mean()
            rsi_avg = rsi.tail(20).mean()

            # Ultra-conservative market condition detection with comprehensive validation
            # Validate and clean inputs
            trend = np.nan_to_num(trend, nan=0.0)
            volatility = np.nan_to_num(volatility, nan=0.2)
            momentum = np.nan_to_num(momentum, nan=0.0)
            rsi_avg = np.nan_to_num(rsi_avg, nan=50.0)

            # Ensure all metrics are within reasonable bounds
            trend = np.clip(trend, -0.1, 0.1)
            volatility = np.clip(volatility, 0.05, 0.5)
            momentum = np.clip(momentum, -0.05, 0.05)
            rsi_avg = np.clip(rsi_avg, 0, 100)

            # Calculate trend quality score
            trend_quality = (
                (1 - abs(trend) / 0.1) * 0.4 +  # Trend stability
                (1 - volatility / 0.5) * 0.3 +  # Volatility contribution
                (1 - abs(momentum) / 0.05) * 0.3  # Momentum stability
            )

            # Calculate momentum quality
            momentum_quality = 1 - abs(rsi_avg - 50) / 50

            # Ultra-balanced market condition detection with enhanced regime identification
            if (trend > 0.002 and  # More permissive uptrend threshold
                volatility < 0.25 and  # More tolerant volatility requirement
                momentum > 0.0003 and  # More permissive momentum threshold
                45 < rsi_avg < 65 and  # Asymmetric RSI range favoring bullish
                trend_quality > 0.5 and  # More achievable quality requirement
                    momentum_quality > 0.4):  # More achievable momentum quality
                market_condition = 'bullish'
            elif (trend < -0.002 and  # More permissive downtrend requirement
                  volatility > 0.15 and  # More achievable volatility requirement
                  (momentum < -0.0003 or  # More achievable negative momentum
                   rsi_avg < 40 or  # More balanced RSI range
                   trend_quality < 0.6)):  # Higher quality requirement for bearish
                market_condition = 'bearish'
            elif abs(trend) < 0.002 and volatility < 0.20:  # Clear sideways condition
                market_condition = 'sideways'
            else:
                # Determine regime based on combined factors
                bearish_score = (
                    (trend < 0) * 1 +
                    (volatility > 0.18) * 1 +
                    (momentum < 0) * 1 +
                    (rsi_avg < 45) * 1
                )
                market_condition = 'bearish' if bearish_score >= 3 else 'sideways'

            # Log detailed market analysis
            logging.info(f"\nMarket Condition Analysis:")
            logging.info(f"Trend: {trend*100:.2f}%")
            logging.info(f"Volatility: {volatility*100:.2f}%")
            logging.info(f"Momentum: {momentum*100:.2f}%")
            logging.info(f"RSI: {rsi_avg:.2f}")
            logging.info(f"Trend Quality: {trend_quality:.2f}")
            logging.info(f"Momentum Quality: {momentum_quality:.2f}")
            logging.info(f"Detected Condition: {market_condition}")

            logging.info(f"\nMarket Analysis:")
            logging.info(f"Trend strength: {trend*100:.2f}%")
            logging.info(f"Volatility: {volatility*100:.2f}%")
            logging.info(f"Momentum: {momentum*100:.2f}%")
            logging.info(f"RSI average: {rsi_avg:.2f}")
            logging.info(f"Detected condition: {market_condition}")

            # Prepare features with market condition context
            try:
                # Prepare features based on model type
                if self.is_sequential:
                    X, _ = self.data_handler.prepare_features(
                        data_with_indicators,
                        lookback=self.sequence_length,
                        market_condition=market_condition,
                        reshape_sequences=True
                    )
                else:
                    X, _ = self.data_handler.prepare_features(
                        data_with_indicators,
                        lookback=10,
                        market_condition=market_condition,
                        reshape_sequences=False
                    )

                logging.info(
                    f"\nFeature generation with {market_condition} market condition:")
                logging.info(
                    f"Generated sequences: {len(X) if X is not None else 0}")

                if X is None or len(X) == 0:
                    logging.error("No features generated after preparation")
                    return {
                        'symbol': symbol,
                        'results': pd.DataFrame(),
                        'metrics': {},
                        'predictions': np.array([]),
                        'signals': pd.Series()
                    }
            except Exception as e:
                logging.error(f"Error in feature preparation: {str(e)}")
                return {
                    'symbol': symbol,
                    'results': pd.DataFrame(),
                    'metrics': {},
                    'predictions': np.array([]),
                    'signals': pd.Series()
                }
                logging.error("No features generated after preparation")
                return {
                    'symbol': symbol,
                    'results': pd.DataFrame(),
                    'metrics': {},
                    'predictions': np.array([]),
                    'signals': pd.Series()
                }

            # Log feature preparation details
            logging.info("\nFeature Preparation:")
            logging.info(f"Input data shape: {test_data.shape}")
            logging.info(f"Processed features shape: {X.shape}")

            # More permissive sequence validation with adaptive thresholds
            lookback = 10  # Base lookback period
            prediction_window = 5  # Base prediction window
            # At least 30 sequences or 20% of data
            min_sequences = max(30, len(test_data) // 5)

            if X.shape[0] < min_sequences:
                logging.warning(
                    f"Low sequence count ({X.shape[0]} < {min_sequences}), attempting with shorter lookback")
                # Try with shorter lookback
                shorter_lookback = max(5, lookback - 3)
                X_short, _ = self.data_handler.prepare_features(
                    data_with_indicators,
                    lookback=shorter_lookback,
                    market_condition=market_condition
                )

                if X_short is not None and len(X_short) >= min_sequences:
                    logging.info(
                        f"Successfully generated {len(X_short)} sequences with shorter lookback")
                    X = X_short
                    lookback = shorter_lookback
                else:
                    # Try with market condition specific adjustments
                    if market_condition == 'bullish':
                        # More permissive in bullish
                        min_sequences = max(20, len(test_data) // 6)
                    elif market_condition == 'bearish':
                        # Moderate in bearish
                        min_sequences = max(25, len(test_data) // 5)
                    else:  # sideways
                        # Most permissive in sideways
                        min_sequences = max(15, len(test_data) // 8)

                    if X.shape[0] >= min_sequences:
                        logging.info(
                            f"Using {X.shape[0]} sequences with regime-specific threshold")
                    else:
                        logging.error(
                            "Insufficient sequences even with adaptive thresholds")
                        return {
                            'symbol': symbol,
                            'results': pd.DataFrame(),
                            'metrics': {},
                            'predictions': np.array([]),
                            'signals': pd.Series()
                        }

            # Generate predictions with proper model-specific handling
            try:
                # Log model type and input shape
                logging.info(f"\nGenerating predictions:")
                logging.info(f"Model type: {'Sequential' if self.is_sequential else 'FNN'}")
                logging.info(f"Input shape: {X.shape}")
                
                # Generate predictions based on model type
                if self.is_sequential:
                    predictions = self.model.predict(X)
                else:
                    # For FNN/Mock models
                    if not hasattr(self.model, 'predict'):
                        raise ValueError("Model does not have predict method")
                        
                    # Check if model is MockStockPredictionFNN which supports market_condition
                    if isinstance(self.model, MockStockPredictionFNN):
                        logging.info("Using MockStockPredictionFNN with market condition")
                        predictions = self.model.predict(X, market_condition=market_condition)
                    else:
                        logging.info("Using standard prediction without market condition")
                        predictions = self.model.predict(X)
                
                # Validate predictions
                if predictions is None or len(predictions) == 0:
                    logging.error("No predictions generated")
                    return {
                        'symbol': symbol,
                        'results': pd.DataFrame(),
                        'metrics': {},
                        'predictions': np.array([]),
                        'signals': pd.Series()
                    }
                
                # Log prediction details
                logging.info(f"Generated {len(predictions)} predictions")
                logging.info(f"Prediction range: {predictions.min():.4f} to {predictions.max():.4f}")
                
                # Generate signals with market condition adaptation
                signals = self.generate_signals(predictions, market_condition)
                
            except Exception as e:
                logging.error(f"Error generating predictions: {str(e)}")
                logging.error(f"Error details: {traceback.format_exc()}")
                return {
                    'symbol': symbol,
                    'results': pd.DataFrame(),
                    'metrics': {},
                    'predictions': np.array([]),
                    'signals': pd.Series()
                }

            # Calculate valid index range
            valid_start = lookback
            valid_end = len(test_data) - prediction_window
            valid_index = test_data.index[valid_start:valid_end]

            # Enhanced signal alignment with proper validation
            if len(signals) != len(valid_index):
                logging.warning(
                    f"Signal length mismatch: {len(signals)} vs {len(valid_index)}")
                
                # Calculate proper alignment indices for sequential models
                if self.is_sequential:
                    # For RNN/LSTM, align signals with sequence windows
                    start_idx = valid_start + self.sequence_length - 1
                    end_idx = min(len(test_data) - prediction_window, start_idx + len(signals))
                    valid_index = test_data.index[start_idx:end_idx]
                else:
                    # For FNN models, use standard alignment
                    start_idx = valid_start
                    end_idx = min(len(test_data) - prediction_window, start_idx + len(signals))
                    valid_index = test_data.index[start_idx:end_idx]
                
                if len(signals) > len(valid_index):
                    logging.info("Truncating excess signals")
                    signals = signals[:len(valid_index)]
                else:
                    logging.info("Padding missing signals with zeros")
                    pad_width = len(valid_index) - len(signals)
                    signals = np.pad(signals, (0, pad_width), mode='constant', constant_values=0)

            # Create aligned signals Series
            aligned_signals = pd.Series(index=valid_index, data=signals)
            aligned_signals.iloc[0] = 0  # Start with neutral position

            # Run backtesting simulation
            results = self.simulator.calculate_returns(
                test_data.loc[valid_index],
                aligned_signals
            )

            # Calculate performance metrics
            metrics = self.simulator.calculate_metrics(results)

            return {
                'symbol': symbol,
                'results': results,
                'metrics': metrics,
                'predictions': predictions,
                'signals': aligned_signals,
                'market_condition': market_condition
            }

        except Exception as e:
            logging.error(f"Error in feature preparation: {str(e)}")
            return {
                'symbol': symbol,
                'results': pd.DataFrame(),
                'metrics': {},
                'predictions': np.array([]),
                'signals': pd.Series()
            }

        # Run backtesting simulation with market condition adaptation
        sim_data = pd.DataFrame({
            'close': test_data.loc[valid_index, 'close'],
            'volume': test_data.loc[valid_index, 'volume'],
            'price_return': test_data.loc[valid_index, 'close'].pct_change()
        })

        # Log simulation setup
        logging.info(f"\nSimulation Setup:")
        logging.info(f"Market condition: {market_condition}")
        logging.info(f"Data points: {len(sim_data)}")
        logging.info(
            f"Average position size: {abs(aligned_signals).mean():.4f}")

        # Run simulation with enhanced logging
        results = self.simulator.calculate_returns(
            sim_data,
            aligned_signals
        )

        # Calculate performance metrics
        metrics = self.simulator.calculate_metrics(results)

        return {
            'symbol': symbol,
            'results': results,
            'metrics': metrics,
            'predictions': predictions,
            'signals': aligned_signals
        }

    def backtest_portfolio(self, symbols: list[str], test_data_dict: Dict[str, pd.DataFrame]) -> Dict[str, Any]:
        """
        Run portfolio-level backtesting with dynamic rebalancing
        
        Args:
            symbols: List of stock symbols
            test_data_dict: Dictionary of historical price data for each symbol
            
        Returns:
            dict: Portfolio-level results and metrics
        """
        if not symbols or not test_data_dict:
            return {}
            
        # Run individual backtests
        results_dict = {}
        for symbol in symbols:
            if symbol in test_data_dict:
                results = self.backtest(symbol, test_data_dict[symbol])
                if results and 'results' in results:
                    results_dict[symbol] = results['results']
        
        if not results_dict:
            return {}
            
        # Calculate portfolio metrics
        portfolio_metrics = self.calculate_portfolio_metrics(results_dict)
        
        # Get rebalancing dates
        if self.rebalance_frequency == 'daily':
            rebalance_dates = pd.date_range(
                start=min(df.index[0] for df in results_dict.values()),
                end=max(df.index[-1] for df in results_dict.values()),
                freq='B'
            )
        elif self.rebalance_frequency == 'weekly':
            rebalance_dates = pd.date_range(
                start=min(df.index[0] for df in results_dict.values()),
                end=max(df.index[-1] for df in results_dict.values()),
                freq='W'
            )
        else:  # monthly
            rebalance_dates = pd.date_range(
                start=min(df.index[0] for df in results_dict.values()),
                end=max(df.index[-1] for df in results_dict.values()),
                freq='M'
            )
        
        # Track portfolio state
        portfolio_equity = pd.Series(self.initial_capital, index=rebalance_dates)
        current_positions = {symbol: 0.0 for symbol in symbols}
        
        # Run portfolio simulation with rebalancing
        for i in range(1, len(rebalance_dates)):
            date = rebalance_dates[i]
            
            # Get asset returns and signals
            asset_data = {}
            for symbol, results in results_dict.items():
                if date in results.index:
                    asset_data[symbol] = {
                        'returns': results.loc[date, 'returns'],
                        'signals': results.loc[date, 'signals'] if 'signals' in results else 0
                    }
            
            # Calculate optimal weights
            weights = self._calculate_optimal_weights(
                pd.DataFrame({s: r['returns'] for s, r in asset_data.items()})
            )
            
            # Update positions with correlation and volatility constraints
            for symbol in symbols:
                if symbol in weights and symbol in asset_data:
                    # Safe conversion of weights and equity values
                    weight_value = float(weights[symbol]) if isinstance(weights[symbol], (int, float, np.number)) else 0.0
                    equity_value = float(portfolio_equity[i-1]) if isinstance(portfolio_equity[i-1], (int, float, np.number)) else 0.0
                    target_position = weight_value * equity_value
                    current_positions[symbol] = target_position
            
            # Calculate portfolio return
            portfolio_return = sum(
                pos * asset_data[sym]['returns']
                for sym, pos in current_positions.items()
                if sym in asset_data
            ) / portfolio_equity[i-1]
            
            # Update portfolio equity
            portfolio_equity[date] = portfolio_equity[i-1] * (1 + portfolio_return)
            
            # Store position snapshot
            self.position_history.append({
                'date': date,
                'positions': current_positions.copy(),
                'portfolio_value': portfolio_equity[date]
            })
        
        # Calculate portfolio-level metrics
        portfolio_returns = portfolio_equity.pct_change().fillna(0)
        metrics = {
            'portfolio_metrics': portfolio_metrics,
            'final_equity': portfolio_equity[-1],
            'total_return': (portfolio_equity[-1] / portfolio_equity[0]) - 1,
            'positions': self.position_history
        }
        
        return {
            'symbols': symbols,
            'portfolio_equity': portfolio_equity,
            'portfolio_returns': portfolio_returns,
            'metrics': metrics,
            'asset_results': results_dict
        }
        
    def evaluate_strategy(self,
                          symbol: str,
                          start_date: Optional[str] = None,
                          end_date: Optional[str] = None,
                          days: int = 252,
                          visualize: bool = True,
                          test_data: Optional[pd.DataFrame] = None) -> Dict:
        """
        Evaluate trading strategy on recent data

        Args:
            symbol: Stock symbol
            start_date: Start date for evaluation
            end_date: End date for evaluation
            days: Number of trading days if dates not specified

        Returns:
            dict: Evaluation results and metrics
        """
        try:
            # Use provided test data or fetch historical data
            if test_data is not None and not test_data.empty:
                df = test_data.copy()
            else:
                df = self.data_handler.fetch_stock_data(symbol, days=days)

            if df.empty:
                logging.error(f"Failed to get data for {symbol}")
                return {}

            # Validate required columns
            required_cols = ['close', 'volume']
            if not all(col in df.columns for col in required_cols):
                logging.error(f"Missing required columns: {required_cols}")
                return {}
        except Exception as e:
            logging.error(f"Error in evaluate_strategy: {str(e)}")
            return {}

        # Run backtesting
        results = self.backtest(symbol, df)

        # Log performance metrics
        logging.info(f"\nPerformance metrics for {symbol}:")
        if isinstance(results, dict) and 'metrics' in results:
            metrics = results['metrics']
            if isinstance(metrics, dict):
                for metric, value in metrics.items():
                    if isinstance(value, (int, float)):
                        logging.info(f"{metric}: {value:.4f}")

        # Generate visualizations if requested
        if visualize:
            from visualization import StrategyVisualizer
            visualizer = StrategyVisualizer(style='bmh')

            # Ensure results is a DataFrame with required columns
            if not isinstance(results, dict) or 'results' not in results:
                logging.warning("Invalid results format for visualization")
                return results

            results_df = results['results']
            if not isinstance(results_df, pd.DataFrame):
                logging.warning("Results is not a DataFrame")
                return results

            required_cols = ['equity', 'net_returns']
            if not all(col in results_df.columns for col in required_cols):
                logging.warning(
                    f"Results missing required columns: {required_cols}")
                return results

            # Calculate buy & hold equity curve
            bh_return = (df['close'].iloc[-1] / df['close'].iloc[0]) - 1
            benchmark_equity = pd.DataFrame({
                'equity': self.initial_capital * (1 + bh_return * np.arange(len(df)) / len(df)),
                'net_returns': np.full(len(df), bh_return / len(df))
            }, index=df.index)

            # Calculate technical strategy results
            from test_model_backtester import calculate_technical_signals
            tech_signals = calculate_technical_signals(df)
            tech_results = self.simulator.calculate_returns(
                df[['close', 'volume']], tech_signals)

            try:
                # Plot equity curve with benchmark comparison
                visualizer.plot_equity_curve(
                    results_df,
                    benchmark_results=benchmark_equity,
                    title=f"{symbol} Strategy Performance"
                )

                # Plot drawdown
                visualizer.plot_drawdown(
                    results_df,
                    title=f"{symbol} Strategy Drawdown"
                )

                # Plot returns distribution
                visualizer.plot_returns_distribution(
                    results_df,
                    title=f"{symbol} Returns Distribution"
                )

                # Compare strategies
                strategy_comparison = {
                    'Model Strategy': results_df,
                    'Buy & Hold': benchmark_equity,
                    'Technical Strategy': tech_results
                }
                visualizer.plot_strategy_comparison(
                    strategy_comparison,
                    metric='equity',
                    title=f"{symbol} Strategy Comparison"
                )
            except Exception as e:
                logging.error(f"Error generating visualizations: {str(e)}")

        return results

    def calculate_portfolio_metrics(self, results_dict: Dict[str, pd.DataFrame]) -> Dict[str, Union[float, Dict[str, float]]]:
        """
        Calculate comprehensive portfolio performance metrics including CAGR-to-drawdown ratio
        
        Args:
            results_dict: Dictionary of results DataFrames for each asset
            
        Returns:
            Dict of portfolio-level metrics
        """
        if not results_dict:
            return {}
            
        # Combine asset returns
        portfolio_returns = pd.DataFrame()
        for symbol, results in results_dict.items():
            if not results.empty and 'returns' in results.columns:
                portfolio_returns[symbol] = results['returns']
        
        if portfolio_returns.empty:
            return {}
            
        # Calculate portfolio-level returns with type safety
        portfolio_weights = self._calculate_optimal_weights(portfolio_returns)
        weighted_returns = pd.Series(
            (portfolio_returns.multiply(portfolio_weights, axis=1)).sum(axis=1),
            index=portfolio_returns.index
        )
        
        # Calculate cumulative performance with explicit float conversion
        cumulative_returns = (1.0 + weighted_returns).cumprod()
        peak = cumulative_returns.expanding(min_periods=1).max()
        drawdown = (cumulative_returns - peak) / peak
        
        # Calculate CAGR with safe float operations
        years = float(len(weighted_returns)) / 252.0
        final_value = float(cumulative_returns.iloc[-1])
        cagr = float((final_value ** (1.0/years) - 1.0) if years > 0 else 0.0)
        
        # Calculate drawdown metrics with safe float operations
        max_drawdown = float(drawdown.min())
        avg_drawdown = float(drawdown[drawdown < 0].mean()) if len(drawdown[drawdown < 0]) > 0 else 0.0
        
        # Calculate CAGR-to-Drawdown ratio with safe float operations
        cagr_to_drawdown = float(abs(cagr / max_drawdown)) if abs(max_drawdown) > 1e-10 else 0.0
        
        # Calculate volatility and Sharpe ratio with safe float operations
        returns_std = float(weighted_returns.std())
        volatility = float(returns_std * np.sqrt(252)) if returns_std != 0 else 0.0
        
        excess_returns = weighted_returns - (self.risk_free_rate / 252.0)
        excess_returns_std = float(excess_returns.std())
        excess_returns_mean = float(excess_returns.mean())
        sharpe_ratio = float(
            np.sqrt(252) * excess_returns_mean / excess_returns_std
        ) if excess_returns_std > 1e-10 else 0.0
        
        # Calculate correlation metrics with safe float operations
        corr_matrix = portfolio_returns.corr().values
        triu_indices = np.triu_indices_from(corr_matrix, k=1)
        if len(triu_indices[0]) > 0:
            avg_correlation = float(np.mean(corr_matrix[triu_indices]))
        else:
            avg_correlation = 0.0
            
        # Return metrics with explicit float types
        metrics_dict: Dict[str, Union[float, Dict[str, float]]] = {
            'cagr': cagr,
            'max_drawdown': max_drawdown,
            'avg_drawdown': avg_drawdown,
            'cagr_to_drawdown': cagr_to_drawdown,
            'volatility': volatility,
            'sharpe_ratio': sharpe_ratio,
            'avg_correlation': avg_correlation,
            'portfolio_weights': {
                str(k): float(v) 
                for k, v in portfolio_weights.items()
            }
        }
        
        return metrics_dict
        
    def _calculate_optimal_weights(self, returns: pd.DataFrame) -> pd.Series:
        """
        Calculate optimal portfolio weights using risk-adjusted returns and correlation constraints
        
        Args:
            returns: DataFrame of asset returns
            
        Returns:
            Series of optimal weights
        """
        # Calculate risk metrics with safe float operations
        volatilities = pd.Series(
            np.sqrt(252.0) * returns.std(),
            index=returns.columns
        )
        correlations = returns.corr()
        
        # Calculate initial weights based on inverse volatility with safe operations
        weights = pd.Series(
            1.0 / np.maximum(volatilities, 1e-10),
            index=returns.columns
        )
        weights = weights / weights.sum()
        
        # Adjust weights based on correlations with safe float operations
        for i in range(len(returns.columns)):
            for j in range(i+1, len(returns.columns)):
                try:
                    corr_value = correlations.iat[i,j]
                    if isinstance(corr_value, (int, float)) and np.isfinite(corr_value):
                        corr_value = float(corr_value)
                        if corr_value > self.correlation_threshold:
                            # Reduce weights for highly correlated assets
                            scale = max(0.0, min(1.0, 1.0 - (corr_value - self.correlation_threshold)))
                            weights.iat[i] = float(weights.iat[i]) * scale
                            weights.iat[j] = float(weights.iat[j]) * scale
                except (ValueError, TypeError, IndexError):
                    continue  # Skip invalid correlation values
        
        # Normalize weights
        weights = weights / weights.sum()
        
        # Apply position limits
        weights = weights.clip(0, self.max_position_size)
        weights = weights / weights.sum() * self.max_portfolio_size
        
        return weights


if __name__ == "__main__":
    # Example usage
    # Initialize components
    data_handler = FinancialDataHandler(
        api_key='ebVYwpeLDHAsY1p7pFkiWucnWjbRM3KQ')
    model = MockStockPredictionFNN(input_dim=130)  # 13 features * 10 timesteps

    # Create backtester
    backtester = ModelBacktester(model, data_handler)

    # Run evaluation
    results = backtester.evaluate_strategy('AAPL', days=100)

    if results:
        print("\nBacktesting completed successfully!")
        print(f"Final equity: ${results['results']['equity'].iloc[-1]:,.2f}")
        print(f"Total return: {results['metrics']['total_return']*100:.2f}%")
        print(f"Sharpe ratio: {results['metrics']['sharpe_ratio']:.2f}")
