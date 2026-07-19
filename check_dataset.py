import pandas as pd

df = pd.read_csv("datasets/liver.csv")
import pandas as pd

df = pd.read_csv("datasets/liver.csv")

print(df.head())
print(df.dtypes)
print(df.isnull().sum())
print(df["is_patient"].value_counts())