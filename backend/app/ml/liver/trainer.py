from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score
from xgboost import XGBClassifier


# ==========================================
# Train Model
# ==========================================

def train_model(model, X_train, y_train):
    """
    Train any scikit-learn compatible model.
    """
    model.fit(X_train, y_train)
    return model


# ==========================================
# Cross Validation
# ==========================================

def cross_validate_model(model, X, y):
    """
    Perform 5-Fold Cross Validation.
    """

    scores = cross_val_score(
        estimator=model,
        X=X,
        y=y,
        cv=5,
        scoring="f1",
        n_jobs=-1
    )

    return {
        "Scores": scores,
        "Mean F1": scores.mean(),
        "Std Dev": scores.std()
    }


# ==========================================
# Models
# ==========================================

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