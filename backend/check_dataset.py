from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent

datasets = {
    "Diabetes": "diabetes.csv",
    "Heart": "heart.csv",
    "Kidney": "kidney.csv",
    "Liver": "liver.csv",
    "Parkinsons": "parkinsons.csv"
}

DATASET_DIR = PROJECT_ROOT / "datasets"

for name, file in datasets.items():

    print("\n" + "=" * 80)
    print(name.upper())
    print("=" * 80)

    df = pd.read_csv(DATASET_DIR / file)

    print("\nShape:")
    print(df.shape)

    print("\nColumns:")
    print(df.columns.tolist())

    print("\nData Types:")
    print(df.dtypes)

    print("\nMissing Values:")
    print(df.isnull().sum())

    print("\nFirst 5 Rows:")
    print(df.head())