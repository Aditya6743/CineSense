from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import httpx
import asyncio
import os
import time
import logging
from contextlib import asynccontextmanager
from cachetools import TTLCache
from google import genai
import asyncpg
import json

# Setup Structured Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("CineSenseAPI")

load_dotenv()

TMDB_TOKEN = os.getenv("TMDB_API_TOKEN")
HEADERS = {
    "Authorization": f"Bearer {TMDB_TOKEN}",
    "accept": "application/json",
}
# --- Caching Configuration ---
tmdb_cache = TTLCache(maxsize=1000, ttl=43200)
pitch_cache = TTLCache(maxsize=2000, ttl=86400)
trending_cache = TTLCache(maxsize=1, ttl=3600)

# Load environment variables
load_dotenv()

# Use Vercel env vars if present, otherwise fallback to the known working strings
# This bypasses the issue where Vercel Dashboard env vars are missing in Preview
DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres.sirfutmxumyjioghwlwq:cinesense6777@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres")
TMDB_API_TOKEN = os.getenv("TMDB_API_TOKEN", "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwZDVkOTdhODY5YzQ5OTI1N2JmZTIwOTg0OGRiNGUzNyIsIm5iZiI6MTc4MjU3MDcxNi4zNjMwMDAyLCJzdWIiOiI2YTNmZGVkYzZhYmRhMDQxZjQ2NGRiYTciLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.KGeju7hvQ3kXaghvBzx4u8XMcOuFla8Y8V8l3O1NawA")

if DB_URL and DB_URL.count("@") > 1 and "%40" not in DB_URL:
    # URL encode the password if it contains an unescaped @
    # Format: postgresql://user:password@host:port/db
    parts = DB_URL.rsplit("@", 1)
    auth_part = parts[0]
    rest = parts[1]
    
    user_pass = auth_part.split("://", 1)
    if len(user_pass) == 2:
        scheme = user_pass[0]
        credentials = user_pass[1].replace("@", "%40")
        DB_URL = f"{scheme}://{credentials}@{rest}"

HEADERS = {
    "accept": "application/json",
    "Authorization": f"Bearer {TMDB_API_TOKEN}"
}

app = FastAPI(title="CineSense API")

# --- Lazy Initialization for Serverless ---
async def get_db_pool():
    if not hasattr(app.state, 'db') or app.state.db is None:
        try:
            if not DB_URL:
                raise ValueError("DATABASE_URL environment variable is missing on Vercel!")
            logger.info("Initializing PostgreSQL pool lazily...")
            app.state.db = await asyncpg.create_pool(DB_URL, min_size=1, max_size=10, ssl="require")
        except Exception as e:
            logger.error(f"Failed to create PostgreSQL pool: {e}")
            app.state.db_error = str(e)
            app.state.db = None
    return app.state.db

async def get_http_client():
    if not hasattr(app.state, 'client') or app.state.client is None:
        app.state.client = httpx.AsyncClient(limits=httpx.Limits(max_keepalive_connections=50, max_connections=100))
    return app.state.client

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow Vercel frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api")
def home():
    return {"message": "Welcome to CineSense API 🚀", "status": "Postgres Optimized & Ready"}

@app.get("/search/suggestions")
@app.get("/api/search/suggestions")
async def get_suggestions(request: Request, query: str = ""):
    """Returns autocomplete suggestions for movie titles from Postgres"""
    if not query:
        return []
    
    if not await get_db_pool():
        return []

    try:
        db_pool = await get_db_pool()
        async with db_pool.acquire() as conn:
            records = await conn.fetch(
                "SELECT title FROM movies WHERE title ILIKE $1 LIMIT 10",
                f"%{query}%"
            )
            return [r['title'] for r in records]
    except Exception as e:
        logger.error(f"Search error: {e}")
        return []

async def get_similar_movies_db(db_pool, movie: str):
    async with db_pool.acquire() as conn:
        record = await conn.fetchrow("SELECT recommendations FROM movies WHERE title = $1", movie)
        
        if not record:
            raise ValueError(f"Movie '{movie}' not found in dataset")
            
        # recommendations is stored as JSONB
        if isinstance(record['recommendations'], str):
            recommendations = json.loads(record['recommendations'])
        else:
            recommendations = record['recommendations']
            
        return recommendations

# Fetch Movie Details from TMDB asynchronously with Retry Logic and Caching
async def fetch_movie_details(client: httpx.AsyncClient, movie_info: dict, max_retries: int = 3):
    movie_id = movie_info['movie_id']
    title = movie_info['title']
    
    # Check cache first to save API calls
    if movie_id in tmdb_cache:
        logger.info(f"Cache HIT for {title}")
        cached_data = tmdb_cache[movie_id].copy()
        cached_data["score"] = movie_info.get("score")
        cached_data["similarity"] = movie_info.get("similarity")
        return cached_data

    logger.info(f"Cache MISS for {title}. Fetching from TMDB...")
    
    url = f"https://api.themoviedb.org/3/movie/{movie_id}"
    
    for attempt in range(max_retries):
        try:
            response = await client.get(
                url,
                headers=HEADERS,
                params={"append_to_response": "credits,videos"},
                timeout=10,
            )
            response.raise_for_status()
            movie = response.json()

            poster = f"https://image.tmdb.org/t/p/w500{movie.get('poster_path')}" if movie.get("poster_path") else None
            
            genres = [g["name"] for g in movie.get("genres", [])]
            cast = [c["name"] for c in movie.get("credits", {}).get("cast", [])[:5]]
            
            trailer_url = None
            videos = movie.get("videos", {}).get("results", [])
            trailers = [v for v in videos if v.get("type") == "Trailer" and v.get("site") == "YouTube"]
            if trailers:
                trailer_url = f"https://www.youtube.com/watch?v={trailers[0]['key']}"

            result = {
                "movie_id": movie_id,
                "title": movie.get("title", title),
                "poster": poster,
                "rating": movie.get("vote_average"),
                "release_date": movie.get("release_date"),
                "overview": movie.get("overview"),
                "runtime": movie.get("runtime"),
                "genres": genres,
                "cast": cast,
                "trailer_url": trailer_url,
                "language": str(movie.get("original_language", "")).upper()
            }
            
            tmdb_cache[movie_id] = result
            
            final_result = result.copy()
            final_result["score"] = movie_info.get("score")
            final_result["similarity"] = movie_info.get("similarity")
            
            return final_result
            
        except Exception as e:
            logger.error(f"Attempt {attempt + 1} failed fetching TMDB data for ID {movie_id} ({title}): {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(1 * (attempt + 1))
            else:
                return {
                    "movie_id": movie_id,
                    "title": title,
                    "poster": None,
                    "rating": None,
                    "release_date": None,
                    "overview": None,
                    "score": movie_info.get("score"),
                    "similarity": movie_info.get("similarity"),
                    "runtime": None,
                    "genres": [],
                    "cast": [],
                    "trailer_url": None,
                    "language": None
                }

@app.get("/recommend/{movie_name}")
@app.get("/api/recommend/{movie_name}")
async def get_recommendations(request: Request, movie_name: str):
    db_pool = await get_db_pool()
    if not db_pool:
        error_msg = getattr(request.app.state, 'db_error', 'Unknown Error')
        raise HTTPException(status_code=500, detail=f"Database connection failed: {error_msg}")
        
    try:
        similar_movies = await get_similar_movies_db(await get_db_pool(), movie_name)
    except ValueError as e:
        logger.warning(f"Recommendation failed: {e}")
        raise HTTPException(status_code=404, detail=str(e))

    client = await get_http_client()
    tasks = [fetch_movie_details(client, m) for m in similar_movies]
    movies_data = await asyncio.gather(*tasks)

    return {
        "movie": movie_name,
        "recommendations": movies_data
    }

@app.get("/trending")
@app.get("/api/trending")
async def get_trending(request: Request):
    if "data" in trending_cache:
        return trending_cache["data"]
        
    try:
        url = "https://api.themoviedb.org/3/trending/movie/week"
        client = await get_http_client()
        response = await client.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        data = response.json()

        movies_data = []
        for movie in data.get("results", [])[:12]:
            movies_data.append({
                "movie_id": movie.get("id"),
                "title": movie.get("title"),
                "poster": f"https://image.tmdb.org/t/p/w500{movie['poster_path']}" if movie.get("poster_path") else None,
                "rating": movie.get("vote_average"),
                "release_date": movie.get("release_date"),
                "overview": movie.get("overview"),
            })

        trending_cache["data"] = movies_data
        return movies_data

    except Exception as e:
        logger.error(f"Trending Error: {e}")
        return []

@app.get("/generate-pitch")
@app.get("/api/generate-pitch")
async def generate_pitch(query: str, recommended: str):
    cache_key = f"{query}_{recommended}"
    if cache_key in pitch_cache:
        logger.info(f"Pitch Cache HIT for {cache_key}")
        return {"pitch": pitch_cache[cache_key]}
        
    api_key = os.getenv("GEMINI_API_KEY")
    fallback_pitch = f"Because you enjoyed '{query}', we highly recommend '{recommended}'. It shares deep stylistic and thematic similarities that align perfectly with your taste."
    
    if not api_key:
        return {"pitch": fallback_pitch}
        
    try:
        logger.info(f"Generating AI pitch for {cache_key}...")
        client = genai.Client(api_key=api_key)
        prompt = f"Write a short, engaging, 2-sentence movie pitch explaining why a fan of '{query}' would absolutely love '{recommended}'. Be enthusiastic and focus on thematic similarities. Do not use quotes or introductory phrases, just give the pitch."
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        pitch_cache[cache_key] = response.text
        return {"pitch": response.text}
    except Exception as e:
        logger.error(f"GenAI Error: {e}")
        return {"pitch": fallback_pitch}

@app.get("/debug-env")
@app.get("/api/debug-env")
async def debug_env():
    # Only return keys for security
    return {"env_keys": list(os.environ.keys())}