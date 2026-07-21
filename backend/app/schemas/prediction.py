from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field


class ShapFeatureContribution(BaseModel):
    feature_name: str
    feature_value: Any
    shap_value: float
    impact: str = Field(..., description="'positive' (increases risk) or 'negative' (decreases risk)")


class PredictionSaveRequest(BaseModel):
    disease_type: Optional[str] = Field(None, example="diabetes")
    disease: Optional[str] = Field(None, example="diabetes")
    input_data: Optional[Dict[str, Any]] = None
    input_values: Optional[Dict[str, Any]] = None
    prediction: int = Field(..., example=1)
    status: Optional[str] = Field(None, example="Positive")
    probability: Optional[float] = Field(None, example=0.85)
    confidence: Optional[float] = Field(None, example=0.85)
    shap_explanations: Optional[List[ShapFeatureContribution]] = None

    def get_disease_type(self) -> str:
        return self.disease_type or self.disease or "unknown"

    def get_input_data(self) -> Dict[str, Any]:
        return self.input_data if self.input_data is not None else (self.input_values or {})

    def get_status(self) -> str:
        if self.status:
            return self.status
        return "Positive" if self.prediction == 1 else "Negative"

    def get_probability(self) -> Optional[float]:
        return self.probability if self.probability is not None else self.confidence


class PredictionHistoryResponse(BaseModel):
    id: str
    user_id: str
    disease_type: str
    disease: str
    input_data: Dict[str, Any]
    input_values: Dict[str, Any]
    prediction: int
    status: str
    probability: Optional[float]
    confidence: Optional[float]
    shap_explanations: List[ShapFeatureContribution] = []
    created_at: datetime
    timestamp: datetime

    class Config:
        from_attributes = True


class PaginatedPredictionHistoryResponse(BaseModel):
    items: List[PredictionHistoryResponse]
    total: int
    page: int
    limit: int
    pages: int

