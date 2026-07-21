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