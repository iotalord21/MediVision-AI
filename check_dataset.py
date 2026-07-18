import pandas as pd

df = pd.read_csv("datasets/kidney.csv")
numeric_columns = [
    "age", "bp", "sg", "al", "su",
    "bgr", "bu", "sc", "sod", "pot",
    "hemo", "pcv", "wc", "rc"
]

for col in numeric_columns:
    df[col] = pd.to_numeric(df[col], errors="coerce")