from fastapi import APIRouter

from app.schemas.kidney import KidneyRequest
from app.services.prediction_service import prediction_service
from app.services.explainability_service import explainability_service

router = APIRouter()


@router.post("/predict")
def predict_kidney(data: KidneyRequest):
    input_dict = data.model_dump()
    result = prediction_service.predict("kidney", input_dict)
    result["shap_explanations"] = explainability_service.explain_prediction("kidney", input_dict)
    return result