import os
import requests
from dotenv import load_dotenv

load_dotenv()

token = os.getenv("TMDB_API_TOKEN")

headers = {
    "Authorization": f"Bearer {token}",
    "accept": "application/json",
}

response = requests.get(
    "https://api.themoviedb.org/3/search/movie",
    headers=headers,
    params={"query": "Avatar"},
    timeout=10,
)

print(response.status_code)
print(response.text)