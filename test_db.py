import asyncio
import asyncpg
import os
import traceback

DB_URL = "postgresql://postgres.sirfutmxumyjioghwlwq:cinesense6777@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres"

async def test():
    try:
        pool = await asyncpg.create_pool(DB_URL, ssl="require")
        async with pool.acquire() as conn:
            # test a query with arguments to trigger prepared statement
            record = await conn.fetchrow("SELECT title FROM movies WHERE title = $1 LIMIT 1", "Avatar")
            print("Query Success:", record)
    except Exception as e:
        print("Query Failed:")
        traceback.print_exc()

asyncio.run(test())
