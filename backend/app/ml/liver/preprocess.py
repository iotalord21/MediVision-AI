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

    # Encode Gender
    df["gender"] = df["gender"].map({
        "Male": 1,
        "Female": 0
    })

    # Encode Target
    df["is_patient"] = df["is_patient"].map({
        1: 1,
        2: 0
    })

    # Fill Missing Values
    for column in df.columns:

        if column == "is_patient":
            continue

        if df[column].dtype == "object":
            df[column] = df[column].fillna(df[column].mode()[0])
        else:
            df[column] = df[column].fillna(df[column].median())

    return df


# ==============================
# Train Test Split
# ==============================

def split_data(df):

    X = df.drop("is_patient", axis=1)
    y = df["is_patient"]

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