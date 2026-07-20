from fastapi import APIRouter

from app.schemas.kidney import KidneyRequest
from app.services.prediction_service import prediction_service


router = APIRouter()


@router.post("/predict")
def predict_kidney(data: KidneyRequest):

    result = prediction_service.predict(
        "kidney",
        data.model_dump()
    )

    return result