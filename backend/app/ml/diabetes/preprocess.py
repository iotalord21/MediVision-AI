import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
# Columns where 0 means missing
INVALID_ZERO_COLUMNS = [
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI"
]


def load_data(file_path):
    return pd.read_csv(file_path)

def clean_data(df):
    """
    Replace medically invalid zeros with NaN,
    then fill missing values using the median.
    """

    df = df.copy()

    # Replace invalid zeros with NaN
    for col in INVALID_ZERO_COLUMNS:
        df[col] = df[col].replace(0, pd.NA)

    # Fill missing values with median
    for col in INVALID_ZERO_COLUMNS:
        df[col] = df[col].fillna(df[col].median())

    return df
def split_data(df):
    """
    Split the dataset into training and testing sets.
    """

    X = df.drop("Outcome", axis=1)
    y = df["Outcome"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    return X_train, X_test, y_train, y_test
def scale_features(X_train, X_test):
    """
    Scale features using StandardScaler.
    """

    scaler = StandardScaler()

    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    return X_train_scaled, X_test_scaled, scaler