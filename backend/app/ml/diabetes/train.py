from pathlib import Path

from app.ml.diabetes.preprocess import (
    load_data,
    clean_data,
    split_data,
    scale_features
)
from app.ml.diabetes.trainer import train_model
from sklearn.linear_model import LogisticRegression
from app.ml.diabetes.evaluator import evaluate_model


# ==============================
# Project Configuration
# ==============================

PROJECT_ROOT = Path(__file__).resolve().parents[4]
DATASET_PATH = PROJECT_ROOT / "datasets" / "diabetes.csv"


# ==============================
# Load Dataset
# ==============================

df = load_data(DATASET_PATH)

print("=" * 50)
print("Dataset Loaded Successfully")
print("=" * 50)

print("\nDataset Shape:")
print(df.shape)

print("\nFirst 5 Rows:")
print(df.head())


# ==============================
# Clean Dataset
# ==============================

df = clean_data(df)

print("\nDataset cleaned successfully.")


# ==============================
# Split Dataset
# ==============================

X_train, X_test, y_train, y_test = split_data(df)

print("\nTraining Set Shape:")
print(X_train.shape)

print("\nTesting Set Shape:")
print(X_test.shape)

print("\nTraining Labels:")
print(y_train.value_counts())

print("\nTesting Labels:")
print(y_test.value_counts())


# ==============================
# Feature Scaling
# ==============================

X_train_scaled, X_test_scaled, scaler = scale_features(
    X_train,
    X_test
)

print("\nScaled Training Shape:")
print(X_train_scaled.shape)

print("\nScaled Testing Shape:")
print(X_test_scaled.shape)


# ==============================
# Train Model
# ==============================

model = LogisticRegression(
    random_state=42,
    max_iter=1000,
    C=0.1,
    class_weight="balanced",
    solver="liblinear"
)

model = train_model(
    model,
    X_train_scaled,
    y_train
)

print("\nModel trained successfully.")


# ==============================
# Evaluate Model
# ==============================

evaluate_model(
    model,
    X_test_scaled,
    y_test
)