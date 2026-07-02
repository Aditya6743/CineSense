from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re
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

# Database URL
DB_URL = os.getenv("DATABASE_URL")
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

# --- Lifespan for Global Connection Pooling & DB Pool ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing global HTTP connection pool...")
    app.state.client = httpx.AsyncClient(limits=httpx.Limits(max_keepalive_connections=50, max_connections=100))
    
    logger.info("Initializing PostgreSQL connection pool...")
    try:
        app.state.db = await asyncpg.create_pool(DB_URL, min_size=1, max_size=10)
        logger.info("PostgreSQL pool created successfully.")
    except Exception as e:
        logger.error(f"Failed to create PostgreSQL pool: {e}")
        app.state.db = None
        
    yield
    
    logger.info("Closing HTTP connection pool...")
    await app.state.client.aclose()
    
    if app.state.db:
        logger.info("Closing PostgreSQL pool...")
        await app.state.db.close()

app = FastAPI(title="CineSense API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow Vercel frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Welcome to CineSense API 🚀", "status": "Postgres Optimized & Ready"}

@app.get("/search/suggestions")
async def get_suggestions(request: Request, query: str = ""):
    """Returns autocomplete suggestions for movie titles from Postgres"""
    if not query:
        return []
    
    if not request.app.state.db:
        return []

    try:
        async with request.app.state.db.acquire() as conn:
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
async def get_recommendations(request: Request, movie_name: str):
    if not request.app.state.db:
        raise HTTPException(status_code=500, detail="Database connection failed")
        
    try:
        similar_movies = await get_similar_movies_db(request.app.state.db, movie_name)
    except ValueError as e:
        logger.warning(f"Recommendation failed: {e}")
        raise HTTPException(status_code=404, detail=str(e))

    client = request.app.state.client
    tasks = [fetch_movie_details(client, m) for m in similar_movies]
    movies_data = await asyncio.gather(*tasks)

    return {
        "movie": movie_name,
        "recommendations": movies_data
    }

@app.get("/trending")
async def get_trending(request: Request):
    if "data" in trending_cache:
        return trending_cache["data"]
        
    try:
        url = "https://api.themoviedb.org/3/trending/movie/week"
        client = request.app.state.client
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

class MoodRequest(BaseModel):
    feeling: str
    vibe: str
    time: str

@app.post("/recommend-mood")
async def recommend_mood(request: Request, req: MoodRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API Key missing")
        
    client = request.app.state.client
    
    try:
        genai_client = genai.Client(api_key=api_key)
        prompt = f"""
You are an expert movie recommender. The user says:
- Feeling: {req.feeling}
- Vibe: {req.vibe}
- Time available: {req.time}

Based on this, suggest EXACTLY ONE perfect movie. 
Return ONLY a raw JSON object (no markdown, no backticks) with exactly two keys:
"title": "The exact movie title"
"reason": "A 1-sentence explanation of why it fits their mood perfectly."
"""
        response = genai_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        # Parse JSON from Gemini (stripping potential markdown blocks)
        raw_text = response.text.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
        
        ai_data = json.loads(raw_text.strip())
        suggested_title = ai_data.get("title", "")
        reason = ai_data.get("reason", "")
        
        if not suggested_title:
            raise ValueError("No title returned from AI")
            
        # Search TMDB for this title to get the exact ID
        tmdb_search_url = "https://api.themoviedb.org/3/search/movie"
        search_res = await client.get(
            tmdb_search_url,
            headers=HEADERS,
            params={"query": suggested_title, "include_adult": "false", "language": "en-US", "page": 1},
            timeout=10
        )
        search_res.raise_for_status()
        search_data = search_res.json()
        
        if not search_data.get("results"):
            raise HTTPException(status_code=404, detail="AI suggested a movie but it was not found on TMDB.")
            
        best_match = search_data["results"][0]
        
        # Fetch full details using our existing function
        movie_info = {
            "movie_id": best_match["id"],
            "title": best_match["title"],
            "score": 100, # Fake score for UI
            "similarity": 100
        }
        
        full_movie = await fetch_movie_details(client, movie_info)
        
        # Attach the AI's reason to the response
        full_movie["ai_reason"] = reason
        
        return {
            "movie": suggested_title,
            "recommendations": [full_movie]
        }
        
    except Exception as e:
        logger.error(f"Mood Recommender Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))