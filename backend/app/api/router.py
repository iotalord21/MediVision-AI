from fastapi import APIRouter

from app.api import (
    diabetes,
    heart,
    kidney,
    liver,
    parkinsons,
)

api_router = APIRouter()

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