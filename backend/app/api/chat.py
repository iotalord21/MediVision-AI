from typing import Optional
from fastapi import APIRouter, Depends, status

from app.auth.dependencies import get_optional_current_user
from app.schemas.chat import (
    PredictionChatRequest,
    PredictionChatResponse
)
from app.services.chat_service import chat_service

router = APIRouter()


@router.post(
    "/ask-prediction",
    response_model=PredictionChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Ask follow-up questions grounded in ML prediction, SHAP factors, and medical knowledge"
)
async def ask_about_prediction(
    req: PredictionChatRequest,
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    user_id = str(current_user["id"]) if current_user and "id" in current_user else None

    # Format SHAP explanations list
    shap_list = None
    if req.shap_explanations:
        shap_list = [item.model_dump() for item in req.shap_explanations]

    # Format chat history list
    history_list = None
    if req.chat_history:
        history_list = [turn.model_dump() for turn in req.chat_history]

    res = await chat_service.answer_prediction_question(
        user_question=req.user_question,
        disease=req.disease,
        prediction=req.prediction,
        status=req.status or ("Positive" if req.prediction == 1 else "Negative"),
        probability=req.probability,
        shap_explanations=shap_list,
        input_data=req.input_data or {},
        prediction_id=req.prediction_id,
        chat_history=history_list,
        user_id=user_id
    )

    return res
