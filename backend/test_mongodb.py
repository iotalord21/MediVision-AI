import sys
import asyncio

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import MONGODB_URL, DATABASE_NAME

print(f"Connecting to database: {DATABASE_NAME}")
client = AsyncIOMotorClient(MONGODB_URL, tlsAllowInvalidCertificates=True)
db = client[DATABASE_NAME]


async def test():
    try:
        await db.command("ping")
        print("SUCCESS: MongoDB Connected Successfully!")

        collections = await db.list_collection_names()
        print("Collections in database:", collections)

    except Exception as e:
        print("FAILED: MongoDB Connection Error:")
        print(e)


if __name__ == "__main__":
    asyncio.run(test())