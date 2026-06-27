from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pickle

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained files
movies = pickle.load(open("../models/movie_list.pkl", "rb"))
similarity = pickle.load(open("../models/similarity.pkl", "rb"))

# Home route
@app.get("/")
def home():
    return {"message": "Welcome to CineSense API 🚀"}

# Recommendation function
def recommend(movie):
    movie_index = movies[movies['title'] == movie].index[0]

    distances = similarity[movie_index]

    movies_list = sorted(
        list(enumerate(distances)),
        reverse=True,
        key=lambda x: x[1]
    )[1:6]

    recommendations = []

    for i in movies_list:
        recommendations.append(movies.iloc[i[0]].title)

    return recommendations

# API Endpoint
@app.get("/recommend/{movie_name}")
def get_recommendations(movie_name: str):
    try:
        return {
            "movie": movie_name,
            "recommendations": recommend(movie_name)
        }
    except:
        return {
            "error": "Movie not found"
        }