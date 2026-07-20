from fastapi import APIRouter

from app.schemas.heart import HeartRequest
from app.services.prediction_service import prediction_service


router = APIRouter()


@router.post("/predict")
def predict_heart(data: HeartRequest):

    result = prediction_service.predict(
        "heart",
        data.model_dump()
    )

    return result