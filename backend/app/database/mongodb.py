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


async def init_db():
    global db
    try:
        await db.command("ping")
        await db.users.create_index("email", unique=True)
        logger.info("✅ Live MongoDB Cluster Connected & Indexes Initialized!")
    except Exception as e:
        logger.warning(f"⚠️ Live MongoDB ping failed ({e}). Switching to AsyncMongoMockClient fallback...")
        client_mock = AsyncMongoMockClient()
        db_mock = client_mock[DATABASE_NAME]
        
        # Monkeypatch db reference across database module
        db = db_mock
        import app.auth.auth_service as auth_svc
        import app.api.predictions as pred_api
        auth_svc.db = db_mock
        pred_api.db = db_mock

        await db.users.create_index("email", unique=True)
        logger.info("✅ Database Indexes Initialized on Fallback Database Engine!")