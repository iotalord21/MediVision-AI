from fastapi import APIRouter

from app.schemas.liver import LiverRequest
from app.services.prediction_service import prediction_service


router = APIRouter()


@router.post("/predict")
def predict_liver(data: LiverRequest):

    result = prediction_service.predict(
        "liver",
        data.model_dump()
    )

    return result