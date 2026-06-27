import pandas as pd

# Load datasets
movies = pd.read_csv("data/tmdb_5000_movies.csv")
credits = pd.read_csv("data/tmdb_5000_credits.csv")

# Merge datasets
movies = movies.merge(credits, on="title")

# Keep only useful columns
movies = movies[['movie_id','title','overview','genres','keywords','cast','crew']]

print(movies.head())
print(movies.shape)