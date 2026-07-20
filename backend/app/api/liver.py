from fastapi import APIRouter

from app.schemas.liver import LiverRequest
from app.services.prediction_service import prediction_service
from app.services.explainability_service import explainability_service

router = APIRouter()


@router.post("/predict")
def predict_liver(data: LiverRequest):
    input_dict = data.model_dump()
    result = prediction_service.predict("liver", input_dict)
    result["shap_explanations"] = explainability_service.explain_prediction("liver", input_dict)
    return result