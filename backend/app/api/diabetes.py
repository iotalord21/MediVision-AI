from fastapi import APIRouter

from app.schemas.diabetes import DiabetesRequest
from app.services.prediction_service import prediction_service


router = APIRouter()


@router.post("/predict")
def predict_diabetes(data: DiabetesRequest):

    result = prediction_service.predict(
        "diabetes",
        data.model_dump()
    )

    return result