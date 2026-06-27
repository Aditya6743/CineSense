import pandas as pd

# Load datasets
movies = pd.read_csv("data/tmdb_5000_movies.csv")
credits = pd.read_csv("data/tmdb_5000_credits.csv")

# Merge datasets using the movie title
movies = movies.merge(credits, on="title")

# Check the new dataset
print(movies.shape)
print(movies.head())