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

    # Drop unnecessary columns
    df = df.drop(columns=[
        "id",
        "dataset",
        "ca",
        "thal",
        "slope"
    ])

    # Convert target to binary
    df["num"] = df["num"].apply(lambda x: 0 if x == 0 else 1)

    # Fill missing values
    for column in df.columns:

        if column == "num":
            continue

        if df[column].dtype == "object":
            df[column] = df[column].fillna(df[column].mode()[0])
        else:
            df[column] = df[column].fillna(df[column].median())

    # Convert categorical columns to numeric
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

    X = df.drop("num", axis=1)
    y = df["num"]

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