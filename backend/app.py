from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import requests
import pickle
import os

load_dotenv()

TMDB_TOKEN = os.getenv("TMDB_API_TOKEN")

HEADERS = {
    "Authorization": f"Bearer {TMDB_TOKEN}",
    "accept": "application/json",
}

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load ML model
movies = pickle.load(open("../models/movie_list.pkl", "rb"))
similarity = pickle.load(open("../models/similarity.pkl", "rb"))


@app.get("/")
def home():
    return {"message": "Welcome to CineSense API 🚀"}


# Recommendation Function
def recommend(movie):
    movie_index = movies[movies["title"] == movie].index[0]

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


# Fetch Movie Details from TMDB
def get_movie_details(title):
    url = "https://api.themoviedb.org/3/search/movie"

    response = requests.get(
        url,
        headers=HEADERS,
        params={"query": title},
        timeout=10,
    )

    response.raise_for_status()

    data = response.json()

    if not data["results"]:
        return {
            "title": title,
            "poster": None,
            "rating": None,
            "release_date": None,
            "overview": None,
        }

    movie = data["results"][0]

    poster = None

    if movie.get("poster_path"):
        poster = "https://image.tmdb.org/t/p/w500" + movie["poster_path"]

    return {
        "title": movie["title"],
        "poster": poster,
        "rating": movie["vote_average"],
        "release_date": movie["release_date"],
        "overview": movie["overview"],
    }


@app.get("/recommend/{movie_name}")
def get_recommendations(movie_name: str):
    recommendations = recommend(movie_name)

    print("Recommendations:", recommendations)

    movies_data = []

    for movie in recommendations:
        print("Fetching:", movie)

        try:
            data = get_movie_details(movie)
            movies_data.append(data)

        except Exception as e:
            print("Failed on:", movie)
            print(e)

            movies_data.append({
                "title": movie,
                "poster": None,
                "rating": None,
                "release_date": None,
                "overview": None,
            })

    return {
        "movie": movie_name,
        "recommendations": movies_data
    }
@app.get("/trending")
def get_trending():
    try:
        url = "https://api.themoviedb.org/3/trending/movie/week"

        response = requests.get(
            url,
            headers=HEADERS,
            timeout=10,
        )

        response.raise_for_status()

        data = response.json()

        movies = []

        for movie in data.get("results", [])[:12]:
            movies.append({
                "title": movie.get("title"),
                "poster": (
                    "https://image.tmdb.org/t/p/w500"
                    + movie["poster_path"]
                ) if movie.get("poster_path") else None,
                "rating": movie.get("vote_average"),
                "release_date": movie.get("release_date"),
                "overview": movie.get("overview"),
            })

        return movies

    except Exception as e:
        print("Trending Error:", e)
        return []