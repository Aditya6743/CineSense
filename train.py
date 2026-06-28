import pickle
import pandas as pd
import ast
import json
from nltk.stem.porter import PorterStemmer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import warnings
warnings.filterwarnings('ignore')

import numpy as np

ps = PorterStemmer()

# Load 30k dataset
movies = pd.read_csv("data/tmdb_30000_data.csv")

# Keep useful columns including vote_average and vote_count for sorting ties
movies = movies[['movie_id', 'title', 'overview', 'genres', 'keywords', 'cast', 'crew', 'vote_average', 'vote_count']]
movies.dropna(inplace=True)

# ---------- Functions ----------

def convert(obj):
    L = []
    for i in ast.literal_eval(obj):
        L.append(i['name'])
    return L

def convert3(obj):
    L = []
    counter = 0
    for i in ast.literal_eval(obj):
        if counter != 3:
            L.append(i['name'])
            counter += 1
        else:
            break
    return L

def fetch_director(obj):
    L = []
    for i in ast.literal_eval(obj):
        if i['job'] == 'Director':
            L.append(i['name'])
            break
    return L

# ---------- Cleaning ----------

movies['genres'] = movies['genres'].apply(convert)
movies['keywords'] = movies['keywords'].apply(convert)
movies['cast'] = movies['cast'].apply(convert3)
movies['crew'] = movies['crew'].apply(fetch_director)

movies['overview'] = movies['overview'].apply(lambda x: x.split())

movies['genres'] = movies['genres'].apply(lambda x:[i.replace(" ","") for i in x])
movies['keywords'] = movies['keywords'].apply(lambda x:[i.replace(" ","") for i in x])
movies['cast'] = movies['cast'].apply(lambda x:[i.replace(" ","") for i in x])
movies['crew'] = movies['crew'].apply(lambda x:[i.replace(" ","") for i in x])

movies['tags'] = movies['overview'] + (movies['genres'] * 2) + movies['keywords'] + (movies['cast'] * 2) + (movies['crew'] * 3)

# Adding weighted score calculation just to have it available in new_df for better sorting in backend
C = movies['vote_average'].mean()
m = movies['vote_count'].quantile(0.9)

def weighted_rating(x, m=m, C=C):
    v = x['vote_count']
    R = x['vote_average']
    return (v/(v+m) * R) + (m/(m+v) * C)

movies['score'] = movies.apply(weighted_rating, axis=1)

new_df = movies[['movie_id', 'title', 'tags', 'score']]

new_df['tags'] = new_df['tags'].apply(lambda x: " ".join(x))
new_df['tags'] = new_df['tags'].apply(lambda x: x.lower())

def stem(text):
    y = []
    for i in text.split():
        y.append(ps.stem(i))
    return " ".join(y)

new_df['tags'] = new_df['tags'].apply(stem)

# ---------- ML ----------

# Use CountVectorizer with 10k features instead of Tfidf (TF-IDF penalizes popular actors/directors, which is bad for movie similarity)
cv = CountVectorizer(max_features=10000, stop_words='english')
vectors = cv.fit_transform(new_df['tags']).toarray()

similarity = cosine_similarity(vectors).astype(np.float32)

# ---------- Recommendation ----------

def recommend(movie):
    movie_index = new_df[new_df['title'] == movie].index[0]
    distances = similarity[movie_index]
    
    # We can fetch top 15 similar and then sort them by our weighted score for top 5
    movies_list = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:16]
    
    # Sort top 15 by score
    top_movies = []
    for i in movies_list:
        idx = i[0]
        top_movies.append({
            'title': new_df.iloc[idx].title,
            'score': new_df.iloc[idx].score,
            'similarity': i[1]
        })
        
    top_movies = sorted(top_movies, key=lambda x: (x['similarity'] * 0.7 + (x['score']/10) * 0.3), reverse=True)[:5]
    
    print(f"\nMovies similar to {movie}:\n")
    for m in top_movies:
        print(f"{m['title']} (Score: {m['score']:.2f}, Sim: {m['similarity']:.2f})")

# Test
recommend("Avatar")
pickle.dump(new_df, open('models/movie_list.pkl', 'wb'))
pickle.dump(similarity, open('models/similarity.pkl', 'wb'))

# Export movie titles for backend autocomplete
titles = new_df['title'].tolist()
with open('models/movie_titles.json', 'w') as f:
    json.dump(titles, f)