import pandas as pd

movies = pd.read_csv("data/tmdb_5000_movies.csv")
credits = pd.read_csv("data/tmdb_5000_credits.csv")

print(movies.shape)
print(credits.shape)

print(movies.head())