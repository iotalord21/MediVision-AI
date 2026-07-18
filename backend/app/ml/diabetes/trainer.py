from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier


def train_model(model, X_train, y_train):
    """
    Train any scikit-learn compatible model.
    """
    model.fit(X_train, y_train)
    return model


def get_models():
    return {
        "Logistic Regression": LogisticRegression(
            random_state=42,
            max_iter=1000,
            C=0.1,
            class_weight="balanced",
            solver="liblinear"
        ),

        "Random Forest": RandomForestClassifier(
            n_estimators=100,
            random_state=42
        ),

        "XGBoost": XGBClassifier(
            n_estimators=100,
            random_state=42,
            eval_metric="logloss"
        )
    }