import logging
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from mongomock_motor import AsyncMongoMockClient
from app.core.config import MONGODB_URL, DATABASE_NAME

logger = logging.getLogger("uvicorn")

try:
    client = AsyncIOMotorClient(
        MONGODB_URL,
        tlsCAFile=certifi.where(),
        tlsAllowInvalidCertificates=True,
        serverSelectionTimeoutMS=3000
    )
    db = client[DATABASE_NAME]
except Exception as e:
    logger.warning(f"⚠️ Live Atlas connection failed, initializing local AsyncMongoMockClient fallback: {e}")
    client = AsyncMongoMockClient()
    db = client[DATABASE_NAME]


async def create_prediction_indexes(target_db):
    try:
        await target_db.users.create_index("email", unique=True)
        await target_db.predictions.create_index([("user_id", 1), ("created_at", -1)])
        await target_db.predictions.create_index([("user_id", 1), ("disease_type", 1)])
        await target_db.predictions.create_index([("user_id", 1), ("status", 1)])
    except Exception as exc:
        logger.warning(f"Index creation warning: {exc}")


async def init_db():
    global db
    try:
        await db.command("ping")
        await create_prediction_indexes(db)
        logger.info("✅ Live MongoDB Cluster Connected & Indexes Initialized!")
    except Exception as e:
        logger.warning(f"⚠️ Live MongoDB ping failed ({e}). Switching to AsyncMongoMockClient fallback...")
        client_mock = AsyncMongoMockClient()
        db_mock = client_mock[DATABASE_NAME]
        
        # Update the module-level global db variable
        db = db_mock

        await create_prediction_indexes(db)
        logger.info("✅ Database Indexes Initialized on Fallback Database Engine!")