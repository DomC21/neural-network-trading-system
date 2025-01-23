import tensorflow as tf
import numpy as np
from rnn_model import StockPredictionRNN


def test_gpu_utilization():
    """Test if RNN model is using GPU."""
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
    """Test RNN model's sequence processing capabilities."""
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
    model = StockPredictionRNN(
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
    """Test RNN model's error handling."""
    print("\nError Handling Test:")

    sequence_length = 10
    n_features = 5
    model = StockPredictionRNN(
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


def main():
    """Run all RNN model tests."""
    print("Starting RNN Model Tests...")

    # Test GPU utilization
    test_gpu_utilization()

    # Test sequence handling
    test_sequence_handling()

    # Test error handling
    test_error_handling()

    print("\nAll tests completed!")


if __name__ == "__main__":
    main()
