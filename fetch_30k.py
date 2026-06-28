import asyncio
import httpx
import pandas as pd
import os
import json
from dotenv import load_dotenv
import time

load_dotenv("backend/.env")
TMDB_TOKEN = os.getenv("TMDB_API_TOKEN")

if not TMDB_TOKEN:
    print("Error: TMDB_API_TOKEN not found in environment")
    exit(1)

HEADERS = {
    "Authorization": f"Bearer {TMDB_TOKEN}",
    "accept": "application/json",
}

# We want roughly 30,000 movies.
# We will fetch popular movies from the last 30 years (1995-2024).
# 1000 movies per year (50 pages) = 30,000 movies.
YEARS = list(range(2025, 1990, -1))
PAGES_PER_YEAR = 50 

async def fetch_movie_ids(client):
    print("Step 1: Fetching 30,000+ movie IDs from TMDB...")
    movie_list = []
    seen_ids = set()
    
    for year in YEARS:
        print(f"Fetching popular movies from {year}...")
        for page in range(1, PAGES_PER_YEAR + 1):
            url = f"https://api.themoviedb.org/3/discover/movie"
            params = {
                "language": "en-US",
                "sort_by": "popularity.desc",
                "include_adult": "false",
                "include_video": "false",
                "page": page,
                "primary_release_year": year,
                "vote_count.gte": 50 # Filter out very obscure movies
            }
            try:
                response = await client.get(url, headers=HEADERS, params=params, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    for movie in data.get("results", []):
                        if movie['id'] not in seen_ids:
                            seen_ids.add(movie['id'])
                            movie_list.append({
                                'movie_id': movie['id'],
                                'title': movie['title'],
                                'overview': movie['overview'] if movie['overview'] else "",
                                'vote_average': movie['vote_average'],
                                'vote_count': movie['vote_count'],
                                'popularity': movie['popularity']
                            })
                    if page >= data.get("total_pages", 0):
                        break
                else:
                    print(f"Error fetching year {year} page {page}: {response.status_code}")
                    await asyncio.sleep(1)
            except Exception as e:
                print(f"Exception fetching year {year} page {page}: {e}")
                
    # Sort by popularity to get the top 30k globally if we fetched too many
    movie_list = sorted(movie_list, key=lambda x: x['popularity'], reverse=True)[:30000]
    print(f"Successfully gathered {len(movie_list)} unique movie IDs.")
    return movie_list

async def fetch_movie_details(client, semaphore, movie, progress):
    url = f"https://api.themoviedb.org/3/movie/{movie['movie_id']}"
    params = {"append_to_response": "credits,keywords"}
    
    async with semaphore:
        retries = 3
        for attempt in range(retries):
            try:
                response = await client.get(url, headers=HEADERS, params=params, timeout=15)
                if response.status_code == 200:
                    data = response.json()
                    
                    # Extract Genres
                    genres = [{"id": g["id"], "name": g["name"]} for g in data.get("genres", [])]
                    
                    # Extract Keywords
                    keywords = [{"id": k["id"], "name": k["name"]} for k in data.get("keywords", {}).get("keywords", [])]
                    
                    # Extract Cast
                    cast = []
                    for c in data.get("credits", {}).get("cast", [])[:10]: # Top 10 cast
                        cast.append({"cast_id": c.get("cast_id"), "character": c.get("character"), "name": c.get("name")})
                        
                    # Extract Crew
                    crew = []
                    for c in data.get("credits", {}).get("crew", []):
                        if c.get("job") in ["Director", "Screenplay", "Writer"]:
                            crew.append({"job": c.get("job"), "name": c.get("name")})
                    
                    movie["genres"] = str(genres) # Stored as stringified JSON to match Kaggle dataset format
                    movie["keywords"] = str(keywords)
                    movie["cast"] = str(cast)
                    movie["crew"] = str(crew)
                    
                    progress["completed"] += 1
                    if progress["completed"] % 500 == 0:
                        print(f"Progress: {progress['completed']}/{progress['total']} movies enriched...")
                        
                    return movie
                elif response.status_code == 429:
                    # Rate limit
                    await asyncio.sleep(1 * (attempt + 1))
                else:
                    break
            except Exception as e:
                await asyncio.sleep(1)
        
        # If failed, return None
        progress["completed"] += 1
        return None

async def main():
    start_time = time.time()
    # High connection limits to maximize speed while respecting TMDB's 40 req/sec limit
    async with httpx.AsyncClient(limits=httpx.Limits(max_keepalive_connections=50, max_connections=100)) as client:
        movies = await fetch_movie_ids(client)
        
        print(f"\nStep 2: Fetching detailed credits and keywords for {len(movies)} movies...")
        print("This will take about 10-15 minutes. Please wait...")
        
        semaphore = asyncio.Semaphore(40) # 40 concurrent requests to stay within TMDB rate limits
        progress = {"completed": 0, "total": len(movies)}
        
        tasks = [fetch_movie_details(client, semaphore, m, progress) for m in movies]
        results = await asyncio.gather(*tasks)
        
        # Filter out failed requests
        valid_movies = [m for m in results if m is not None and m.get("genres")]
        
        print(f"\nSuccessfully fetched full details for {len(valid_movies)} movies in {(time.time() - start_time)/60:.2f} minutes.")
        
        # Convert to Pandas DataFrame
        df = pd.DataFrame(valid_movies)
        
        # The ML script expects 'tmdb_5000_movies.csv' format, but we'll make a unified one
        df.to_csv("data/tmdb_30000_data.csv", index=False)
        print("Saved successfully to data/tmdb_30000_data.csv")

if __name__ == "__main__":
    asyncio.run(main())
