import asyncio
from app.database.mongodb import db


async def test():
    try:
        await db.command("ping")
        print("✅ MongoDB Connected Successfully!")

        collections = await db.list_collection_names()
        print("Collections:", collections)

    except Exception as e:
        print("❌ MongoDB Connection Failed")
        print(e)


asyncio.run(test())