from fastapi import APIRouter

from app.schemas.parkinsons import ParkinsonsRequest
from app.services.prediction_service import prediction_service
from app.services.explainability_service import explainability_service

router = APIRouter()


@router.post("/predict")
def predict_parkinsons(data: ParkinsonsRequest):
    input_dict = data.model_dump(by_alias=True)
    result = prediction_service.predict("parkinsons", input_dict)
    result["shap_explanations"] = explainability_service.explain_prediction("parkinsons", input_dict)
    return result
