from fastapi import APIRouter

from app.schemas.parkinsons import ParkinsonsRequest
from app.services.prediction_service import prediction_service


router = APIRouter()


@router.post("/predict")
def predict(data: ParkinsonsRequest):
    return prediction_service.predict(
        "parkinsons",
        data.model_dump(by_alias=True)
    )
