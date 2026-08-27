from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.rag import SourceCitation
from app.schemas.prediction import ShapFeatureContribution


class AIReportRequest(BaseModel):
    disease: str = Field(..., example="diabetes")
    input_data: Dict[str, Any] = Field(..., example={"glucose": 130, "bmi": 28.5, "age": 45})
    prediction: Optional[int] = Field(None, example=1)
    status: Optional[str] = Field(None, example="Positive")
    probability: Optional[float] = Field(None, example=0.75)
    shap_explanations: Optional[List[ShapFeatureContribution]] = None


class AIReportResponse(BaseModel):
    summary: str
    shap_analysis: str
    medical_context: str
    recommendations: str
    citations: List[SourceCitation] = []
    disclaimer: str
    is_ai_generated: bool = True
    generated_at: Optional[str] = None
    disease: Optional[str] = None
    prediction: Optional[int] = None
    status: Optional[str] = None
    probability: Optional[float] = None
    shap_explanations: Optional[List[Dict[str, Any]]] = None
