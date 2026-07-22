import math
from datetime import datetime, timezone
from typing import List, Optional, Union
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

import app.database.mongodb as mongodb_module
from app.auth.dependencies import get_current_user
from app.schemas.prediction import (
    PredictionSaveRequest,
    PredictionHistoryResponse,
    PaginatedPredictionHistoryResponse
)
from app.services.explainability_service import explainability_service

router = APIRouter()


def format_prediction_doc(doc: dict) -> dict:
    created_at = doc.get("created_at") or datetime.now(timezone.utc)
    if isinstance(created_at, str):
        try:
            created_at = datetime.fromisoformat(created_at)
        except ValueError:
            created_at = datetime.now(timezone.utc)

    disease_type = doc.get("disease_type") or doc.get("disease", "unknown")
    input_data = doc.get("input_data") if doc.get("input_data") is not None else doc.get("input_values", {})
    prob = doc.get("probability") if doc.get("probability") is not None else doc.get("confidence")
    status_val = doc.get("status") or ("Positive" if doc.get("prediction") == 1 else "Negative")

    return {
        "id": str(doc["_id"]),
        "user_id": str(doc["user_id"]),
        "disease_type": disease_type,
        "disease": disease_type,
        "input_data": input_data,
        "input_values": input_data,
        "prediction": doc.get("prediction", 0),
        "status": status_val,
        "probability": prob,
        "confidence": prob,
        "shap_explanations": doc.get("shap_explanations", []),
        "created_at": created_at,
        "timestamp": created_at
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
    disease_type = req.get_disease_type()
    input_data = req.get_input_data()
    status_val = req.get_status()
    probability = req.get_probability()

    # Auto-generate SHAP explanations if omitted in request
    shap_explanations = req.shap_explanations
    if not shap_explanations:
        shap_explanations = explainability_service.explain_prediction(
            disease_type,
            input_data
        )
    else:
        shap_explanations = [item.model_dump() for item in shap_explanations]

    record = {
        "user_id": ObjectId(current_user["id"]),
        "disease_type": disease_type,
        "disease": disease_type,
        "input_data": input_data,
        "prediction": req.prediction,
        "status": status_val,
        "probability": probability,
        "shap_explanations": shap_explanations,
        "created_at": datetime.now(timezone.utc)
    }

    res = await mongodb_module.db.predictions.insert_one(record)
    record["_id"] = res.inserted_id
    return format_prediction_doc(record)


@router.get(
    "/history",
    response_model=Union[PaginatedPredictionHistoryResponse, List[PredictionHistoryResponse]],
    summary="Fetch current user's prediction history with pagination and search/filtering"
)
async def get_history(
    page: int = Query(1, ge=1, description="Page number starting from 1"),
    limit: int = Query(10, ge=1, le=100, description="Number of items per page"),
    disease: Optional[str] = Query(None, description="Filter by disease type (e.g. diabetes, heart, kidney, liver, parkinsons)"),
    disease_type: Optional[str] = Query(None, description="Alias for disease filter"),
    prediction_result: Optional[str] = Query(None, description="Filter by prediction status (e.g. Positive, Negative)"),
    status: Optional[str] = Query(None, description="Alias for prediction status filter"),
    prediction: Optional[int] = Query(None, description="Filter by raw prediction integer (1 or 0)"),
    date: Optional[str] = Query(None, description="Filter by specific date (YYYY-MM-DD)"),
    start_date: Optional[str] = Query(None, description="Filter created_at on or after start_date"),
    end_date: Optional[str] = Query(None, description="Filter created_at on or before end_date"),
    paginate: bool = Query(True, description="Whether to return a paginated response wrapper"),
    current_user: dict = Depends(get_current_user)
):
    user_id = ObjectId(current_user["id"])
    filter_query = {"user_id": user_id}

    # Disease filter
    target_disease = disease_type or disease
    if target_disease and target_disease.strip() and target_disease.lower() != "all":
        filter_query["disease_type"] = {"$regex": f"^{target_disease.strip()}$", "$options": "i"}

    # Status/prediction result filter
    target_status = status or prediction_result
    if target_status and target_status.strip() and target_status.lower() != "all":
        status_str = target_status.strip()
        if status_str.isdigit():
            filter_query["prediction"] = int(status_str)
        elif status_str.lower() in ("positive", "1", "high"):
            filter_query["status"] = {"$regex": "^positive$", "$options": "i"}
        elif status_str.lower() in ("negative", "0", "low"):
            filter_query["status"] = {"$regex": "^negative$", "$options": "i"}
        else:
            filter_query["status"] = {"$regex": status_str, "$options": "i"}

    if prediction is not None:
        filter_query["prediction"] = prediction

    # Date filter
    if date and date.strip():
        try:
            dt = datetime.strptime(date.strip(), "%Y-%m-%d")
            start_dt = datetime(dt.year, dt.month, dt.day, 0, 0, 0, tzinfo=timezone.utc)
            end_dt = datetime(dt.year, dt.month, dt.day, 23, 59, 59, 999999, tzinfo=timezone.utc)
            filter_query["created_at"] = {"$gte": start_dt, "$lte": end_dt}
        except ValueError:
            pass
    elif start_date or end_date:
        date_filter = {}
        if start_date and start_date.strip():
            try:
                s_dt = datetime.fromisoformat(start_date.strip())
                if s_dt.tzinfo is None:
                    s_dt = s_dt.replace(tzinfo=timezone.utc)
                date_filter["$gte"] = s_dt
            except ValueError:
                pass
        if end_date and end_date.strip():
            try:
                e_dt = datetime.fromisoformat(end_date.strip())
                if e_dt.tzinfo is None:
                    e_dt = e_dt.replace(tzinfo=timezone.utc)
                date_filter["$lte"] = e_dt
            except ValueError:
                pass
        if date_filter:
            filter_query["created_at"] = date_filter

    total_count = await mongodb_module.db.predictions.count_documents(filter_query)

    skip = (page - 1) * limit
    cursor = mongodb_module.db.predictions.find(filter_query).sort("created_at", -1).skip(skip).limit(limit)
    history = []
    async for doc in cursor:
        history.append(format_prediction_doc(doc))

    if not paginate:
        return history

    total_pages = math.ceil(total_count / limit) if total_count > 0 else 1

    return {
        "items": history,
        "total": total_count,
        "page": page,
        "limit": limit,
        "pages": total_pages
    }


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

    res = await mongodb_module.db.predictions.delete_one({
        "_id": ObjectId(prediction_id),
        "user_id": ObjectId(current_user["id"])
    })

    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Prediction record not found")

