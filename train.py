import pandas as pd
import ast

# Load datasets
movies = pd.read_csv("data/tmdb_5000_movies.csv")
credits = pd.read_csv("data/tmdb_5000_credits.csv")

# Merge datasets
movies = movies.merge(credits, on="title")

# Keep useful columns
movies = movies[['movie_id','title','overview','genres','keywords','cast','crew']]

# Function to extract names
def convert(obj):
    L = []
    for i in ast.literal_eval(obj):
        L.append(i['name'])
    return L

# Clean genres
movies['genres'] = movies['genres'].apply(convert)

# Show result
print(movies[['title','genres']].head())