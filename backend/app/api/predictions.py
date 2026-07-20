from datetime import datetime, timezone
from typing import List
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.database.mongodb import db
from app.auth.dependencies import get_current_user
from app.schemas.prediction import PredictionSaveRequest, PredictionHistoryResponse
from app.services.explainability_service import explainability_service

router = APIRouter()


def format_prediction_doc(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "user_id": str(doc["user_id"]),
        "disease_type": doc["disease_type"],
        "input_data": doc["input_data"],
        "prediction": doc["prediction"],
        "status": doc["status"],
        "probability": doc.get("probability"),
        "shap_explanations": doc.get("shap_explanations", []),
        "created_at": doc.get("created_at")
    }


@router.post(
    "/save",
    response_model=PredictionHistoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save a prediction record with SHAP explanations to user history"
)
async def save_prediction(
    req: PredictionSaveRequest,
    current_user: dict = Depends(get_current_user)
):
    # Auto-generate SHAP explanations if omitted in request
    shap_explanations = req.shap_explanations
    if not shap_explanations:
        shap_explanations = explainability_service.explain_prediction(
            req.disease_type,
            req.input_data
        )
    else:
        shap_explanations = [item.model_dump() for item in shap_explanations]

    record = {
        "user_id": ObjectId(current_user["id"]),
        "disease_type": req.disease_type,
        "input_data": req.input_data,
        "prediction": req.prediction,
        "status": req.status,
        "probability": req.probability,
        "shap_explanations": shap_explanations,
        "created_at": datetime.now(timezone.utc)
    }

    res = await db.predictions.insert_one(record)
    record["_id"] = res.inserted_id
    return format_prediction_doc(record)


@router.get(
    "/history",
    response_model=List[PredictionHistoryResponse],
    summary="Fetch current user's prediction history"
)
async def get_history(current_user: dict = Depends(get_current_user)):
    user_id = ObjectId(current_user["id"])
    cursor = db.predictions.find({"user_id": user_id}).sort("created_at", -1)
    history = []
    async for doc in cursor:
        history.append(format_prediction_doc(doc))
    return history


@router.delete(
    "/{prediction_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a prediction history record"
)
async def delete_prediction(
    prediction_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(prediction_id):
        raise HTTPException(status_code=400, detail="Invalid prediction ID format")

    res = await db.predictions.delete_one({
        "_id": ObjectId(prediction_id),
        "user_id": ObjectId(current_user["id"])
    })

    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Prediction record not found")
