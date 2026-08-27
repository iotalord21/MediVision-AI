from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.rag import SourceCitation
from app.schemas.prediction import ShapFeatureContribution


class ChatMessageTurn(BaseModel):
    role: str = Field(..., example="user")
    content: Optional[str] = None
    message: Optional[str] = None


class PredictionChatRequest(BaseModel):
    user_question: str = Field(..., example="Why is my glucose level considered high risk?")
    disease: str = Field(..., example="diabetes")
    prediction: int = Field(1, example=1)
    status: Optional[str] = Field("Positive", example="Positive")
    probability: Optional[float] = Field(0.75, example=0.75)
    shap_explanations: Optional[List[ShapFeatureContribution]] = None
    input_data: Optional[Dict[str, Any]] = None
    prediction_id: Optional[str] = Field(None, example="60c72b2f9b1d8b2bad8e9f1a")
    chat_history: Optional[List[ChatMessageTurn]] = None


class PredictionChatResponse(BaseModel):
    answer: str
    citations: List[SourceCitation] = []
    disclaimer: str
    timestamp: str
