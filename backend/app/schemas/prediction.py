from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field


class ShapFeatureContribution(BaseModel):
    feature_name: str
    feature_value: Any
    shap_value: float
    impact: str = Field(..., description="'positive' (increases risk) or 'negative' (decreases risk)")


class PredictionSaveRequest(BaseModel):
    disease_type: str = Field(..., example="diabetes")
    input_data: Dict[str, Any]
    prediction: int = Field(..., example=1)
    status: str = Field(..., example="Positive")
    probability: Optional[float] = Field(None, example=0.85)
    shap_explanations: Optional[List[ShapFeatureContribution]] = None


class PredictionHistoryResponse(BaseModel):
    id: str
    user_id: str
    disease_type: str
    input_data: Dict[str, Any]
    prediction: int
    status: str
    probability: Optional[float]
    shap_explanations: List[ShapFeatureContribution] = []
    created_at: datetime

    class Config:
        from_attributes = True
