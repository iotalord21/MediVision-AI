from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.database.mongodb import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB indexes on startup
    await init_db()
    yield


app = FastAPI(
    title="MediVision AI",
    description="Explainable Healthcare Disease Prediction API",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for cross-origin requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Welcome to MediVision AI 🚀"
    }


@app.get("/health")
def health():
    return {
        "status": "Healthy"
    }


app.include_router(api_router, prefix="/api/v1")