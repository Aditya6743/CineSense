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
import re

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

# Use Vercel env vars
DB_URL = os.getenv("DATABASE_URL")
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
            app.state.db = await asyncpg.create_pool(
                DB_URL, 
                min_size=1, 
                max_size=10, 
                ssl="require",
                server_settings={'statement_timeout': '10000'},
                statement_cache_size=0, # REQUIRED FOR SUPABASE PGBOUNCER TRANSACTION POOLING (PORT 6543)
                timeout=3.0 # Fail fast if DB is paused so we can fallback to TMDB instantly
            )
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

@app.get("/")
@app.get("/api")
def home():
    return {"message": "Welcome to CineSense API 🚀", "status": "Postgres Optimized & Ready", "docs": "/docs"}

@app.get("/search/suggestions")
@app.get("/api/search/suggestions")
async def get_suggestions(request: Request, query: str = ""):
    """Returns autocomplete suggestions for movie titles from Postgres and TMDB"""
    if not query:
        return []
    
    suggestions = []
    
    # 1. Try fetching from local database first
    try:
        db_pool = await get_db_pool()
        if db_pool:
            async with db_pool.acquire() as conn:
                records = await conn.fetch(
                    "SELECT title FROM movies WHERE title ILIKE $1 LIMIT 5",
                    f"%{query}%"
                )
                suggestions.extend([r['title'] for r in records])
    except Exception as e:
        logger.error(f"Search DB error: {e}")
        
    # 2. Fetch from TMDB for global search
    try:
        client = await get_http_client()
        tmdb_url = "https://api.themoviedb.org/3/search/movie"
        res = await client.get(
            tmdb_url, 
            headers=HEADERS, 
            params={"query": query, "include_adult": "false", "language": "en-US"}, 
            timeout=5
        )
        if res.status_code == 200:
            tmdb_data = res.json()
            for movie in tmdb_data.get("results", [])[:7]:
                title = movie.get("title")
                if title and title not in suggestions:
                    suggestions.append(title)
    except Exception as e:
        logger.error(f"Search TMDB error: {e}")
        
    return suggestions[:10]

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
async def get_recommendations(request: Request, movie_name: str, movie_id: int = None):
    similar_movies = []
    
    # Try Database first
    db_pool = await get_db_pool()
    if db_pool:
        try:
            similar_movies = await get_similar_movies_db(db_pool, movie_name)
        except Exception as e:
            logger.warning(f"DB Recommendation failed for {movie_name}: {e}")
            
    # Fallback to TMDB if DB failed or movie not in DB
    if not similar_movies:
        client = await get_http_client()
        
        # If movie_id is not provided, we must search TMDB for the movie_name first
        if not movie_id:
            logger.info(f"Searching TMDB for ID of '{movie_name}'")
            try:
                search_url = "https://api.themoviedb.org/3/search/movie"
                search_res = await client.get(search_url, headers=HEADERS, params={"query": movie_name}, timeout=10)
                search_res.raise_for_status()
                search_data = search_res.json()
                if search_data.get("results") and len(search_data["results"]) > 0:
                    movie_id = search_data["results"][0]["id"]
            except Exception as e:
                logger.error(f"TMDB search fallback failed for {movie_name}: {e}")

        if movie_id:
            logger.info(f"Falling back to TMDB recommendations for ID {movie_id}")
            tmdb_url = f"https://api.themoviedb.org/3/movie/{movie_id}/recommendations"
            try:
                response = await client.get(tmdb_url, headers=HEADERS, timeout=10)
                response.raise_for_status()
                tmdb_data = response.json()
                for rec in tmdb_data.get("results", [])[:5]:
                    similar_movies.append({
                        "movie_id": rec["id"],
                        "title": rec["title"],
                        "score": rec.get("vote_average", 0),
                        "similarity": 0.95
                    })
            except Exception as e:
                logger.error(f"TMDB fallback failed: {e}")
            
    if not similar_movies:
        raise HTTPException(status_code=404, detail="Movie not found and TMDB fallback failed")

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
        
        models_to_try = [
            'gemini-2.5-flash-lite',
            'gemini-flash-lite-latest',
            'gemini-2.0-flash-lite',
            'gemini-flash-latest',
            'gemini-2.5-flash',
            'gemini-3.5-flash'
        ]
        
        response = None
        for model_name in models_to_try:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                break
            except Exception as e:
                logger.warning(f"Pitch model {model_name} failed: {e}")
                continue
                
        if not response:
            raise Exception("All Gemini models failed for generate-pitch.")
        
        pitch_cache[cache_key] = response.text
        return {"pitch": response.text}
    except Exception as e:
        logger.error(f"GenAI Error: {e}")
        return {"pitch": fallback_pitch}

class MoodRequest(BaseModel):
    feeling: str
    vibe: str
    gimmick: str
    custom: str = ""
    watched_titles: list[str] = []

@app.post("/recommend-mood")
@app.post("/api/recommend-mood")
async def recommend_mood(request: Request, req: MoodRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    client = await get_http_client()
    
    suggested_title = ""
    reason = ""
    
    if not api_key:
        logger.warning("Gemini API Key missing. Using dynamic fallback recommendations.")
        import random
        
        fallback_movies = [
            "Inception", "The Dark Knight", "La La Land", "Interstellar", "Spider-Man: Across the Spider-Verse",
            "Everything Everywhere All at Once", "The Truman Show", "Spirited Away", "Mad Max: Fury Road", 
            "Parasite", "Whiplash", "The Matrix", "Dune", "Avatar", "Gladiator", "Pulp Fiction",
            "The Big Lebowski", "Knives Out", "Catch Me If You Can", "Jurassic Park", "Before Sunrise",
            "Inside Out", "Indiana Jones and the Raiders of the Lost Ark", "The Grand Budapest Hotel", "Arrival"
        ]
        
        suggested_title = random.choice(fallback_movies)
        
        # Clean up the emoji tags to make a natural sentence
        clean_feeling = req.feeling.split()[0].lower()
        clean_vibe = req.vibe.split()[0].lower()
        clean_gimmick = req.gimmick.lower().replace("just ", "").replace("a ", "")
        
        reason = f"Since you're feeling {clean_feeling} and want a {clean_vibe} vibe, this is a perfect pick to watch with {clean_gimmick}!"
        
    else:
        try:
            genai_client = genai.Client(api_key=api_key)
            
            custom_instruction = f"- User's specific details: {req.custom}\n" if req.custom.strip() else ""
            watched_instruction = ""
            if req.watched_titles:
                watched_instruction = f"- Movies the user has ALREADY SEEN (DO NOT recommend these under any circumstances): {', '.join(req.watched_titles)}\n"
            
            prompt = f"""
You are an expert movie recommender with an encyclopedic knowledge of cinema, covering the vast global collection of movies from all eras, genres, and languages.
The user says:
- Feeling: {req.feeling}
- Vibe: {req.vibe}
- Ideal movie companion: {req.gimmick}
{custom_instruction}{watched_instruction}

Search your vast internal database and be EXTREMELY PRECISE. Choose EXACTLY ONE perfect movie that perfectly matches ALL the provided constraints and inputs above. Do not default to popular movies if a lesser-known movie fits the constraints better.

Return ONLY a raw JSON object (no markdown, no backticks) with exactly two keys:
"title": "The exact movie title"
"reason": "A 1-sentence explanation of why it fits their mood and constraints perfectly."
"""
            models_to_try = [
                'gemini-2.5-flash-lite',
                'gemini-flash-lite-latest',
                'gemini-2.0-flash-lite',
                'gemini-flash-latest',
                'gemini-2.5-flash',
                'gemini-3.5-flash'
            ]
            
            response = None
            last_err = None
            for model_name in models_to_try:
                try:
                    response = genai_client.models.generate_content(
                        model=model_name,
                        contents=prompt,
                    )
                    break
                except Exception as e:
                    last_err = e
                    logger.warning(f"Mood model {model_name} failed: {e}")
                    continue
                    
            if not response:
                raise Exception(f"All models failed. Last error: {last_err}")
            
            raw_text = response.text.strip()
            
            # More robust JSON parsing
            try:
                # Strip markdown code blocks explicitly
                raw_text = raw_text.replace("```json", "").replace("```", "").strip()
                start_idx = raw_text.find('{')
                end_idx = raw_text.rfind('}')
                if start_idx != -1 and end_idx != -1:
                    raw_text = raw_text[start_idx:end_idx+1]
                    
                ai_data = json.loads(raw_text)
                suggested_title = ai_data.get("title", "")
                reason = ai_data.get("reason", "")
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse AI JSON: {raw_text}")
                suggested_title = "Inception"
                reason = "Our AI got a bit confused, but here is a mind-bending classic!"
                
            if not suggested_title:
                suggested_title = "The Truman Show"
                reason = "A great watch for any occasion."
                
        except Exception as ai_err:
            import random
            logger.error(f"AI Generation Failed: {ai_err}")
            fallback_list = ["The Dark Knight", "Inception", "Interstellar", "Dune", "The Matrix", "Mad Max: Fury Road"]
            suggested_title = random.choice(fallback_list)
            reason = f"Our AI encountered an error ({str(ai_err)}). Here is a cinematic masterpiece instead."
            
    try:
        # Clean up title by removing years in parentheses (e.g. "Interstellar (2014)" -> "Interstellar")
        suggested_title = re.sub(r'\s*\(\d{4}\)', '', suggested_title).strip()
            
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
            logger.warning(f"AI suggested '{suggested_title}' but TMDB returned no results.")
            import random
            fallback_list = ["Parasite", "Everything Everywhere All at Once", "Spirited Away", "Whiplash", "Knives Out", "Arrival"]
            suggested_title = random.choice(fallback_list)
            reason = "The AI found an extremely obscure movie not available in the global database! So here is a phenomenal masterpiece instead."
            
            search_res = await client.get(tmdb_search_url, headers=HEADERS, params={"query": suggested_title, "include_adult": "false", "language": "en-US", "page": 1})
            search_data = search_res.json()
            
        best_match = search_data["results"][0]
        
        movie_info = {
            "movie_id": best_match["id"],
            "title": best_match["title"],
            "score": 100, 
            "similarity": 100
        }
        
        full_movie = await fetch_movie_details(client, movie_info)
        full_movie["ai_reason"] = reason
        
        return {
            "movie": suggested_title,
            "recommendations": [full_movie]
        }
        
    except Exception as e:
        logger.error(f"Mood Recommender Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/movie/providers")
@app.get("/api/movie/providers")
async def get_movie_providers(title: str):
    """Fetches where to watch (streaming providers) for a given movie title."""
    client = await get_http_client()
    try:
        # Clean up title by removing years in parentheses (e.g. "Interstellar (2014)" -> "Interstellar")
        clean_title = re.sub(r'\s*\(\d{4}\)', '', title).strip()
        
        # 1. Search for the movie ID
        search_url = "https://api.themoviedb.org/3/search/movie"
        search_res = await client.get(
            search_url,
            headers=HEADERS,
            params={"query": clean_title, "include_adult": "false"},
            timeout=5
        )
        search_data = search_res.json()
        
        if not search_data.get("results"):
            return {"providers": []}
            
        movie_id = search_data["results"][0]["id"]
        
        # 2. Fetch providers
        prov_url = f"https://api.themoviedb.org/3/movie/{movie_id}/watch/providers"
        prov_res = await client.get(prov_url, headers=HEADERS, timeout=5)
        prov_data = prov_res.json()
        
        results = prov_data.get("results", {})
        
        in_data = results.get("IN", {})
        us_data = results.get("US", {})
        
        seen = set()
        providers = []
        
        # Ignored providers that confuse users (often rent/buy only, not true streaming subscriptions)
        IGNORED_PROVIDERS = {"YouTube", "Google Play Movies"}
        
        # 1. Try Flatrate (Streaming Subscriptions) for IN and US
        for p in in_data.get("flatrate", []) + us_data.get("flatrate", []):
            name = p.get("provider_name")
            if name and name not in seen and name not in IGNORED_PROVIDERS:
                seen.add(name)
                providers.append({
                    "name": name,
                    "logo": f"https://image.tmdb.org/t/p/original{p.get('logo_path')}" if p.get('logo_path') else None
                })
                
        # 2. If no streaming in IN/US, try Rent/Buy in IN/US
        if not providers:
            for p in in_data.get("rent", []) + in_data.get("buy", []) + us_data.get("rent", []) + us_data.get("buy", []):
                name = p.get("provider_name")
                if name and name not in seen and name not in IGNORED_PROVIDERS:
                    seen.add(name)
                    providers.append({
                        "name": f"{name} (Rent/Buy)",
                        "logo": f"https://image.tmdb.org/t/p/original{p.get('logo_path')}" if p.get('logo_path') else None
                    })
                    
        # 3. If STILL nothing, check ALL other countries for streaming
        if not providers:
            for country, data in results.items():
                for p in data.get("flatrate", []):
                    name = p.get("provider_name")
                    if name and name not in seen and name not in IGNORED_PROVIDERS:
                        seen.add(name)
                        providers.append({
                            "name": f"{name} ({country})",
                            "logo": f"https://image.tmdb.org/t/p/original{p.get('logo_path')}" if p.get('logo_path') else None
                        })
                # Break early if we found global providers to avoid spam
                if len(providers) >= 3:
                    break
                    
        # Return top 5 maximum to avoid cluttering the UI
        return {"providers": providers[:5]}
        
    except Exception as e:
        logger.error(f"Failed to fetch providers for {title}: {e}")
        return {"providers": []}

@app.get("/debug-env")
@app.get("/api/debug-env")
async def debug_env():
    # Only return keys for security
    return {"env_keys": list(os.environ.keys())}

@app.get("/debug-models")
@app.get("/api/debug-models")
async def debug_models():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"error": "No API key"}
    try:
        genai_client = genai.Client(api_key=api_key)
        models = []
        for m in genai_client.models.list():
            models.append(m.name)
        return {"models": models}
    except Exception as e:
        return {"error": str(e)}