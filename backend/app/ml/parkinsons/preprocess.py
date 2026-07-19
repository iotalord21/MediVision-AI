import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler


# ==============================
# Load Dataset
# ==============================

def load_data(path):
    return pd.read_csv(path)


# ==============================
# Clean Dataset
# ==============================

def clean_data(df):

    # Drop ID column
    df = df.drop(columns=["id"])

    return df


# ==============================
# Train Test Split
# ==============================

def split_data(df):

    X = df.drop("class", axis=1)
    y = df["class"]

    return train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )


# ==============================
# Feature Scaling
# ==============================

def scale_features(X_train, X_test):

    scaler = StandardScaler()

    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    return X_train_scaled, X_test_scaled, scaler