import os
from google import genai

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("No API key")
    exit(1)

client = genai.Client(api_key=api_key)

prompt = """
You are an expert movie recommender with an encyclopedic knowledge of cinema, covering the vast global collection of movies from all eras, genres, and languages.
The user says:
- Feeling: Happy
- Vibe: Chill
- Ideal movie companion: Pizza

Search your vast internal database and be EXTREMELY PRECISE. Choose EXACTLY ONE perfect movie that perfectly matches ALL the provided constraints and inputs above. Do not default to popular movies if a lesser-known movie fits the constraints better.

Return ONLY a raw JSON object (no markdown, no backticks) with exactly two keys:
"title": "The exact movie title"
"reason": "A 1-sentence explanation of why it fits their mood and constraints perfectly."
"""

try:
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
    )
    print("Success:")
    print(response.text)
except Exception as e:
    print("Error:")
    print(str(e))
