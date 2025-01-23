import tensorflow as tf
import numpy as np
from lstm_model import StockPredictionLSTM
import time
import logging


def test_gpu_utilization():
    """Test if LSTM model is using GPU."""
    print("\nGPU Utilization Test:")
    physical_devices = tf.config.list_physical_devices('GPU')
    if physical_devices:
        print(f"Found {len(physical_devices)} GPU(s):")
        for device in physical_devices:
            print(f"- {device}")

        # Enable memory growth
        try:
            for device in physical_devices:
                tf.config.experimental.set_memory_growth(device, True)
            print("Memory growth enabled on all devices")
        except RuntimeError as e:
            print(f"Memory growth setting failed: {str(e)}")
    else:
        print("No GPU devices found")


def test_sequence_handling():
    """Test LSTM model's sequence processing capabilities."""
    print("\nSequence Handling Test:")

    # Test parameters
    sequence_length = 10  # Length of input sequences
    n_features = 5       # Number of features per timestep
    n_samples = 100      # Number of test samples

    # Create sequences with clear temporal pattern
    X = np.zeros((n_samples, sequence_length, n_features))
    for i in range(n_samples):
        # Generate increasing or decreasing pattern
        trend = np.linspace(
            -1 if i < n_samples/2 else 0,
            1 if i < n_samples/2 else -1,
            sequence_length
        )
        for j in range(n_features):
            X[i, :, j] = trend + np.random.normal(0, 0.1, sequence_length)

    # Labels based on trend direction
    y = (X[:, -1, 0] > X[:, 0, 0]).astype(int)

    # Create and train model
    model = StockPredictionLSTM(
        sequence_length=sequence_length,
        n_features=n_features
    )

    print("Training model on sequence data...")
    history = model.train(
        X, y,
        epochs=5,
        batch_size=32
    )

    # Evaluate
    loss, accuracy = model.evaluate(X, y)
    print(f"Sequence classification accuracy: {accuracy:.4f}")

    # Test prediction shape
    preds = model.predict(X[:5])
    print(f"Prediction shape: {preds.shape}")
    print("Sample predictions:", preds)


def test_error_handling():
    """Test LSTM model's error handling."""
    print("\nError Handling Test:")

    sequence_length = 10
    n_features = 5
    model = StockPredictionLSTM(
        sequence_length=sequence_length,
        n_features=n_features
    )

    # Test wrong input shape
    try:
        # Missing feature dimension
        wrong_shape = np.random.randn(10, sequence_length)
        model.predict(wrong_shape)
        print("ERROR: Failed to catch wrong input shape")
    except ValueError as e:
        print("Successfully caught wrong input shape:", str(e))

    # Test wrong sequence length
    try:
        wrong_sequence = np.random.randn(10, sequence_length+1, n_features)
        model.predict(wrong_sequence)
        print("ERROR: Failed to catch wrong sequence length")
    except ValueError as e:
        print("Successfully caught wrong sequence length:", str(e))


def test_long_term_dependencies():
    """Test LSTM's ability to capture long-term dependencies."""
    print("\nLong-term Dependencies Test:")

    # Generate longer sequences
    sequence_length = 50  # Longer sequences
    n_features = 5
    n_samples = 100

    # Create sequences with long-term dependencies
    X = np.zeros((n_samples, sequence_length, n_features))
    y = np.zeros(n_samples)

    for i in range(n_samples):
        # Create a pattern where the prediction depends on both early and late values
        early_pattern = np.random.choice([-1, 1])  # Pattern in first 10 timesteps
        late_pattern = np.random.choice([-1, 1])   # Pattern in last 10 timesteps

        # Set the patterns
        X[i, :10, 0] = early_pattern + np.random.normal(0, 0.1, 10)
        X[i, -10:, 0] = late_pattern + np.random.normal(0, 0.1, 10)

        # Fill middle section with noise
        X[i, 10:-10, 0] = np.random.normal(0, 0.1, sequence_length-20)

        # Add other features as noise
        for j in range(1, n_features):
            X[i, :, j] = np.random.normal(0, 0.1, sequence_length)

        # Label: 1 if both patterns match, 0 otherwise
        y[i] = int(early_pattern == late_pattern)

    # Create and train model
    model = StockPredictionLSTM(
        sequence_length=sequence_length,
        n_features=n_features,
        hidden_units=[128, 64]  # Larger model for longer sequences
    )

    print("Training model on long-term dependency data...")
    history = model.train(
        X, y,
        epochs=10,
        batch_size=32
    )

    # Evaluate
    loss, accuracy = model.evaluate(X, y)
    print(f"Long-term pattern recognition accuracy: {accuracy:.4f}")


def main():
    """Run all LSTM model tests."""
    print("Starting LSTM Model Tests...")

    # Test GPU utilization
    test_gpu_utilization()

    # Test sequence handling
    test_sequence_handling()

    # Test error handling
    test_error_handling()

    # Test long-term dependencies
    test_long_term_dependencies()

    print("\nAll tests completed!")


if __name__ == "__main__":
    main()
