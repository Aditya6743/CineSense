import asyncio, httpx, os, json

TMDB_API_TOKEN = os.getenv("TMDB_API_TOKEN", "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwZDVkOTdhODY5YzQ5OTI1N2JmZTIwOTg0OGRiNGUzNyIsIm5iZiI6MTc4MjU3MDcxNi4zNjMwMDAyLCJzdWIiOiI2YTNmZGVkYzZhYmRhMDQxZjQ2NGRiYTciLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.KGeju7hvQ3kXaghvBzx4u8XMcOuFla8Y8V8l3O1NawA")
HEADERS = {"Authorization": f"Bearer {TMDB_API_TOKEN}", "accept": "application/json"}

async def test():
    movie_name = "Avatar"
    async with httpx.AsyncClient() as client:
        search_url = "https://api.themoviedb.org/3/search/movie"
        try:
            search_res = await client.get(search_url, headers=HEADERS, params={"query": movie_name}, timeout=10)
            search_res.raise_for_status()
            search_data = search_res.json()
            movie_id = search_data["results"][0]["id"]
            
            tmdb_url = f"https://api.themoviedb.org/3/movie/{movie_id}/recommendations"
            res = await client.get(tmdb_url, headers=HEADERS, timeout=10)
            res.raise_for_status()
            print("Success")
        except Exception as e:
            print(f"Error type: {type(e)}")
            print(f"Error str: {str(e)}")
            if hasattr(e, 'response'):
                print(e.response.text)

asyncio.run(test())
