from fastapi import APIRouter

from app.schemas.heart import HeartRequest
from app.services.prediction_service import prediction_service
from app.services.explainability_service import explainability_service

router = APIRouter()


@router.post("/predict")
def predict_heart(data: HeartRequest):
    input_dict = data.model_dump()
    result = prediction_service.predict("heart", input_dict)
    result["shap_explanations"] = explainability_service.explain_prediction("heart", input_dict)
    return result