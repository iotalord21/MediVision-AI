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

    # Drop unnecessary column
    df = df.drop(columns=["id"])

    # Clean target column
    df["classification"] = (
        df["classification"]
        .str.strip()
        .map({
            "ckd": 1,
            "notckd": 0
        })
    )

    # ==============================
    # Convert numeric columns
    # ==============================

    numeric_columns = [
        "age", "bp", "sg", "al", "su",
        "bgr", "bu", "sc", "sod", "pot",
        "hemo", "pcv", "wc", "rc"
    ]

    for col in numeric_columns:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # ==============================
    # Fill missing values
    # ==============================

    for column in df.columns:

        if column == "classification":
            continue

        if df[column].dtype == "object":
            df[column] = df[column].fillna(df[column].mode()[0])
        else:
            df[column] = df[column].fillna(df[column].median())

    # Convert categorical columns to numeric
    print(df.dtypes)
    categorical_columns = df.select_dtypes(include=["object", "bool"]).columns

    df = pd.get_dummies(
        df,
        columns=categorical_columns,
        drop_first=True
    )

    return df

# ==============================
# Train Test Split
# ==============================

def split_data(df):

    X = df.drop("classification", axis=1)
    y = df["classification"]

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