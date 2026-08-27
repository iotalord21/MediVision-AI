from fastapi import APIRouter

from app.api import (
    auth,
    predictions,
    reports,
    diabetes,
    heart,
    kidney,
    liver,
    parkinsons,
    analysis,
    rag,
    chat,
)

api_router = APIRouter()

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"],
)

api_router.include_router(
    predictions.router,
    prefix="/predictions",
    tags=["Prediction History & SHAP"],
)

api_router.include_router(
    reports.router,
    prefix="/reports",
    tags=["Medical Reports & PDF"],
)

api_router.include_router(
    analysis.router,
    prefix="/analysis",
    tags=["Document Analysis"],
)

api_router.include_router(
    rag.router,
    prefix="/rag",
    tags=["RAG Medical Knowledge Retrieval"],
)

api_router.include_router(
    chat.router,
    prefix="/chat",
    tags=["Conversational Decision Support"],
)

api_router.include_router(
    diabetes.router,
    prefix="/diabetes",
    tags=["Diabetes"],
)

api_router.include_router(
    heart.router,
    prefix="/heart",
    tags=["Heart"],
)

api_router.include_router(
    kidney.router,
    prefix="/kidney",
    tags=["Kidney"],
)

api_router.include_router(
    liver.router,
    prefix="/liver",
    tags=["Liver"],
)

api_router.include_router(
    parkinsons.router,
    prefix="/parkinsons",
    tags=["Parkinsons"],
)