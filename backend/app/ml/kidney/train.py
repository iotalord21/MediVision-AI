from pathlib import Path
import joblib

from app.ml.kidney.preprocess import (
    load_data,
    clean_data,
    split_data,
    scale_features
)

from app.ml.kidney.trainer import (
    train_model,
    get_models,
    cross_validate_model
)

from app.ml.kidney.evaluator import evaluate_model


# ==================================================
# Project Configuration
# ==================================================

PROJECT_ROOT = Path(__file__).resolve().parents[4]

DATASET_PATH = PROJECT_ROOT / "datasets" / "kidney.csv"

MODEL_DIR = PROJECT_ROOT / "backend" / "trained_models"
MODEL_DIR.mkdir(exist_ok=True)

MODEL_PATH = MODEL_DIR / "kidney_model.pkl"
SCALER_PATH = MODEL_DIR / "kidney_scaler.pkl"


# ==================================================
# Load Dataset
# ==================================================

df = load_data(DATASET_PATH)

print("=" * 50)
print("Dataset Loaded Successfully")
print("=" * 50)

print("\nDataset Shape:")
print(df.shape)

print("\nFirst 5 Rows:")
print(df.head())


# ==================================================
# Clean Dataset
# ==================================================

df = clean_data(df)

print("\nDataset cleaned successfully.")


# ==================================================
# Train-Test Split
# ==================================================

X_train, X_test, y_train, y_test = split_data(df)

print("\nTraining Set Shape:")
print(X_train.shape)

print("\nTesting Set Shape:")
print(X_test.shape)

print("\nTraining Labels:")
print(y_train.value_counts())

print("\nTesting Labels:")
print(y_test.value_counts())


# ==================================================
# Feature Scaling
# ==================================================

X_train_scaled, X_test_scaled, scaler = scale_features(
    X_train,
    X_test
)

print("\nScaled Training Shape:")
print(X_train_scaled.shape)

print("\nScaled Testing Shape:")
print(X_test_scaled.shape)


# ==================================================
# Train & Evaluate Models
# ==================================================

models = get_models()

trained_models = {}
results = {}

for model_name, model in models.items():

    print(f"\nTraining {model_name}...")

    # Logistic Regression uses scaled features
    if model_name == "Logistic Regression":
        X_train_model = X_train_scaled
        X_test_model = X_test_scaled

    # Tree models use original features
    else:
        X_train_model = X_train
        X_test_model = X_test

    trained_model = train_model(
        model,
        X_train_model,
        y_train
    )

    cv_results = cross_validate_model(
    model,
    X_train_model,
    y_train
    )

    print("\nCross Validation Results")
    print(f"Scores  : {cv_results['Scores']}")
    print(f"Mean F1 : {cv_results['Mean F1']:.4f}")
    print(f"Std Dev : {cv_results['Std Dev']:.4f}")

    trained_models[model_name] = trained_model

    metrics = evaluate_model(
        trained_model,
        X_test_model,
        y_test
    )

    results[model_name] = metrics

    print(f"{model_name} completed.")


# ==================================================
# Model Comparison
# ==================================================

print("\n" + "=" * 50)
print("MODEL COMPARISON")
print("=" * 50)

for model_name, metrics in results.items():

    print(f"\n{model_name}")

    print(f"Accuracy : {metrics['Accuracy']:.4f}")
    print(f"Precision: {metrics['Precision']:.4f}")
    print(f"Recall   : {metrics['Recall']:.4f}")
    print(f"F1 Score : {metrics['F1']:.4f}")


# ==================================================
# Select Best Model
# ==================================================

best_model_name = max(
    results,
    key=lambda model: results[model]["F1"]
)

best_model = trained_models[best_model_name]

print("\n" + "=" * 50)
print(f"Best Model: {best_model_name}")
print(f"Best F1 Score: {results[best_model_name]['F1']:.4f}")
print("=" * 50)


# ==================================================
# Save Model, Scaler, Feature Names & Metadata
# ==================================================

FEATURES_PATH = MODEL_DIR / "kidney_features.pkl"
USE_SCALER_PATH = MODEL_DIR / "kidney_use_scaler.pkl"

# Save feature names
joblib.dump(
    X_train.columns.tolist(),
    FEATURES_PATH
)

# Save whether the selected model requires scaling
use_scaler = best_model_name == "Logistic Regression"

joblib.dump(
    use_scaler,
    USE_SCALER_PATH
)

# Save model and scaler
joblib.dump(best_model, MODEL_PATH)
joblib.dump(scaler, SCALER_PATH)

print("\nModel saved successfully!")
print(f"Model Path : {MODEL_PATH}")

print("\nScaler saved successfully!")
print(f"Scaler Path: {SCALER_PATH}")

print("\nFeature names saved successfully!")
print(f"Feature Path: {FEATURES_PATH}")

print("\nScaler metadata saved successfully!")
print(f"Use Scaler : {use_scaler}")