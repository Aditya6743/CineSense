import os
from google import genai

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("No API key")
    exit(1)

client = genai.Client(api_key=api_key)

try:
    for model in client.models.list():
        print(model.name)
except Exception as e:
    print("Error:", e)
