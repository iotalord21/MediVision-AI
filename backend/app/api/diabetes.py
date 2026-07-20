from fastapi import APIRouter

from app.schemas.diabetes import DiabetesRequest
from app.services.prediction_service import prediction_service
from app.services.explainability_service import explainability_service

router = APIRouter()


@router.post("/predict")
def predict_diabetes(data: DiabetesRequest):
    input_dict = data.model_dump()
    result = prediction_service.predict("diabetes", input_dict)
    result["shap_explanations"] = explainability_service.explain_prediction("diabetes", input_dict)
    return result