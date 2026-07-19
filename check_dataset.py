import pandas as pd

import pandas as pd

df = pd.read_csv("datasets/parkinsons.csv")

print(df.head())
print(df.columns)
print(df.dtypes)
print(df.isnull().sum())
print(df.shape)