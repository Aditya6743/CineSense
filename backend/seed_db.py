import pickle
import json
import psycopg2
from urllib.parse import quote_plus
import numpy as np
import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv()

# The raw password from the user might contain an @ symbol, which breaks URL parsing.
DB_URL = os.getenv("DATABASE_URL")
if DB_URL and DB_URL.count("@") > 1 and "%40" not in DB_URL:
    # URL encode the password if it contains an unescaped @
    # Format: postgresql://user:password@host:port/db
    parts = DB_URL.rsplit("@", 1)
    auth_part = parts[0]
    rest = parts[1]
    
    # URL encode the auth part
    # Replace any @ with %40 in the auth part
    user_pass = auth_part.split("://", 1)
    if len(user_pass) == 2:
        scheme = user_pass[0]
        credentials = user_pass[1].replace("@", "%40")
        DB_URL = f"{scheme}://{credentials}@{rest}"

if not DB_URL:
    print("Error: DATABASE_URL not found in environment")
    exit(1)

print("Connecting to Supabase PostgreSQL...")
try:
    conn = psycopg2.connect(DB_URL)
    cursor = conn.cursor()
    print("Connected successfully!")
except Exception as e:
    print(f"Connection failed: {e}")
    exit(1)

print("Loading ML models (This might take a few seconds)...")
movies = pickle.load(open("../models/movie_list.pkl", "rb"))
similarity = pickle.load(open("../models/similarity.pkl", "rb"))

print("Creating tables...")
cursor.execute("""
    DROP TABLE IF EXISTS movies;
    CREATE TABLE movies (
        movie_id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        score DOUBLE PRECISION,
        recommendations JSONB
    );
""")
conn.commit()

print("Calculating top 5 recommendations for each movie and inserting into PostgreSQL...")
# We will insert in batches for performance
batch_size = 500
insert_data = []

for row_idx, (index, row) in enumerate(movies.iterrows()):
    try:
        distances = similarity[row_idx]
    except Exception as e:
        print(f"Skipping row_idx {row_idx} due to error: {e}")
        continue
    # Fetch top 15 similar and then sort them by our weighted score for top 5
    movies_list = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:16]
    
    top_movies = []
    for i in movies_list:
        idx = i[0]
        top_movies.append({
            'movie_id': int(movies.iloc[idx].movie_id),
            'title': str(movies.iloc[idx].title),
            'score': float(movies.iloc[idx].score),
            'similarity': float(i[1])
        })
        
    top_movies = sorted(top_movies, key=lambda x: (x['similarity'] * 0.7 + (x['score']/10) * 0.3), reverse=True)[:5]
    
    insert_data.append((
        int(row['movie_id']),
        str(row['title']),
        float(row['score']) if not pd.isna(row['score']) else 0.0,
        json.dumps(top_movies)
    ))

    if len(insert_data) >= batch_size:
        args_str = ','.join(cursor.mogrify("(%s,%s,%s,%s)", x).decode('utf-8') for x in insert_data)
        cursor.execute(f"INSERT INTO movies (movie_id, title, score, recommendations) VALUES {args_str} ON CONFLICT (movie_id) DO NOTHING")
        conn.commit()
        print(f"Inserted {index + 1} / {len(movies)} movies...")
        insert_data = []

# Insert remaining
if insert_data:
    args_str = ','.join(cursor.mogrify("(%s,%s,%s,%s)", x).decode('utf-8') for x in insert_data)
    cursor.execute(f"INSERT INTO movies (movie_id, title, score, recommendations) VALUES {args_str} ON CONFLICT (movie_id) DO NOTHING")
    conn.commit()
    print(f"Inserted remaining movies.")

print("Creating indexes...")
cursor.execute("CREATE INDEX idx_movies_title ON movies (title);")
conn.commit()

cursor.close()
conn.close()

print("Database Seeding Complete! The backend is now completely decoupled from similarity.pkl!")
