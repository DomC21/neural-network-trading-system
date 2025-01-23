import tensorflow as tf
from tensorflow.keras import layers, models
import numpy as np
import logging


class StockPredictionLSTM:
    """LSTM model for stock prediction with advanced sequence modeling capabilities.
    
    This model implements LSTM architecture with batch normalization and dropout
    for stable training. It includes GPU support when available and conservative
    hyperparameters for risk management."""

    def __init__(
            self,
            sequence_length: int,
            n_features: int,
            hidden_units=[64, 32],
            learning_rate=0.001
    ):
        """Initialize LSTM for stock prediction.

        Args:
            sequence_length (int): Length of input sequence
            n_features (int): Number of features per timestep
            hidden_units (list): List of integers for number of units in each
                LSTM layer
            learning_rate (float): Learning rate for optimizer
        """
        self.sequence_length = sequence_length
        self.n_features = n_features
        self.hidden_units = hidden_units
        self.learning_rate = learning_rate
        self.model = self._build_model()

    def _build_model(self):
        """Build and compile the LSTM model with GPU support."""
        model = models.Sequential()

        # Input layer
        model.add(layers.Input(shape=(self.sequence_length, self.n_features)))

        # LSTM layers with batch normalization and conservative dropout
        for i, units in enumerate(self.hidden_units):
            # Return sequences for all but last LSTM layer
            return_sequences = i < len(self.hidden_units) - 1

            # LSTM layer with tanh activation
            model.add(layers.LSTM(
                units=units,
                return_sequences=return_sequences,
                activation='tanh',
                kernel_initializer='glorot_uniform',
                recurrent_dropout=0.0  # Disable for better GPU performance
            ))

            # Batch normalization for stable training
            model.add(layers.BatchNormalization())

            # Conservative dropout for regularization
            model.add(layers.Dropout(0.2))

        # Output layer for binary classification (bullish/bearish)
        model.add(layers.Dense(1, activation='sigmoid'))

        # Compile model with binary crossentropy and Adam optimizer
        optimizer = tf.keras.optimizers.Adam(
            learning_rate=self.learning_rate
        )
        model.compile(
            optimizer=optimizer,
            loss='binary_crossentropy',
            metrics=['accuracy']
        )

        return model

    def train(
            self,
            X_train,
            y_train,
            epochs=100,
            batch_size=32,
            validation_split=0.2
    ):
        """Train the LSTM model with early stopping and learning rate scheduling.

        Args:
            X_train (np.array): Training sequences of shape
                (samples, sequence_length, features)
            y_train (np.array): Training labels (0 for bearish, 1 for bullish)
            epochs (int): Number of training epochs
            batch_size (int): Batch size for training
            validation_split (float): Fraction of data to use for validation

        Returns:
            history: Training history with loss and accuracy metrics
        """
        # Verify GPU availability
        physical_devices = tf.config.list_physical_devices('GPU')
        if physical_devices:
            logging.info(f"Training on GPU: {physical_devices}")
            # Enable memory growth for GPU
            for device in physical_devices:
                try:
                    tf.config.experimental.set_memory_growth(device, True)
                except RuntimeError as e:
                    logging.warning(f"Memory growth setting failed: {str(e)}")
        else:
            logging.warning("No GPU available, training on CPU")

        # Validate input shapes
        if len(X_train.shape) != 3:
            msg = (
                f"Expected X_train shape (samples, {self.sequence_length}, "
                f"{self.n_features}), got {X_train.shape}"
            )
            raise ValueError(msg)
        if X_train.shape[1:] != (self.sequence_length, self.n_features):
            msg = (
                f"Expected sequence length {self.sequence_length} and "
                f"{self.n_features} features, got shape {X_train.shape[1:]}"
            )
            raise ValueError(msg)

        # Train with early stopping and learning rate scheduling
        callbacks = [
            tf.keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=10,
                restore_best_weights=True
            ),
            tf.keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=1e-6
            )
        ]

        history = self.model.fit(
            X_train,
            y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=validation_split,
            callbacks=callbacks
        )
        return history

    def predict(self, X):
        """Generate predictions with shape validation.

        Args:
            X (np.array): Input sequences of shape
                (samples, sequence_length, features)

        Returns:
            np.array: Predicted probabilities (0-1) of bullish market conditions
        """
        # Validate input shape
        if len(X.shape) != 3:
            msg = (
                f"Expected input shape (samples, {self.sequence_length}, "
                f"{self.n_features}), got {X.shape}"
            )
            raise ValueError(msg)
        if X.shape[1:] != (self.sequence_length, self.n_features):
            msg = (
                f"Expected sequence length {self.sequence_length} and "
                f"{self.n_features} features, got shape {X.shape[1:]}"
            )
            raise ValueError(msg)

        return self.model.predict(X)

    def evaluate(self, X_test, y_test):
        """Evaluate model performance on test data.

        Args:
            X_test (np.array): Test sequences of shape
                (samples, sequence_length, features)
            y_test (np.array): Test labels (0 for bearish, 1 for bullish)

        Returns:
            tuple: (loss, accuracy) metrics on test data
        """
        # Validate input shapes
        if len(X_test.shape) != 3:
            msg = (
                f"Expected X_test shape (samples, {self.sequence_length}, "
                f"{self.n_features}), got {X_test.shape}"
            )
            raise ValueError(msg)
        if X_test.shape[1:] != (self.sequence_length, self.n_features):
            msg = (
                f"Expected sequence length {self.sequence_length} and "
                f"{self.n_features} features, got shape {X_test.shape[1:]}"
            )
            raise ValueError(msg)

        return self.model.evaluate(X_test, y_test)


if __name__ == "__main__":
    # Example usage with sequence data
    np.random.seed(42)

    # Generate sample sequential data
    n_samples = 1000
    sequence_length = 10
    n_features = 5

    # Create sequences with temporal pattern
    X = np.random.randn(n_samples, sequence_length, n_features)
    # Simple rule: if average of last 3 timesteps > 0, then bullish
    y = (X[:, -3:, 0].mean(axis=1) > 0).astype(int)

    # Create and train model
    model = StockPredictionLSTM(
        sequence_length=sequence_length,
        n_features=n_features
    )
    history = model.train(X, y, epochs=10)

    # Make predictions
    preds = model.predict(X[:5])
    print("\nSample predictions:", preds)
