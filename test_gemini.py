import os
from pathlib import Path
from dotenv import load_dotenv
from google import genai

# Load backend/.env
load_dotenv(Path(__file__).parent / "backend" / ".env")

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ No API key found")
    exit(1)

print("✅ API Key Loaded")

client = genai.Client(api_key=api_key)

prompt = """
You are an expert movie recommender.

The user says:
- Feeling: Happy
- Vibe: Chill
- Ideal movie companion: Pizza

Return ONLY a JSON object:
{
  "title": "Movie Name",
  "reason": "One sentence."
}
"""

try:
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    print("\n✅ Success!\n")
    print(response.text)

except Exception as e:
    print("\n❌ Gemini Error:")
    print(e)