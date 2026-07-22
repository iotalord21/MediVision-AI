from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel, Field

import app.database.mongodb as mongodb_module
from app.auth.dependencies import get_current_user
from app.services.pdf_service import pdf_service

router = APIRouter()


class PDFReportRequest(BaseModel):
    disease_name: Optional[str] = Field(None, example="diabetes")
    disease_type: Optional[str] = Field(None, example="diabetes")
    input_data: Optional[Dict[str, Any]] = None
    input_values: Optional[Dict[str, Any]] = None
    prediction: int = Field(..., example=1)
    status: Optional[str] = Field(None, example="Positive")
    probability: Optional[float] = Field(None, example=0.88)
    confidence: Optional[float] = Field(None, example=0.88)
    shap_explanations: Optional[List[Dict[str, Any]]] = None
    patient_name: Optional[str] = None
    patient_email: Optional[str] = None
    created_at: Optional[Any] = None


@router.post(
    "/pdf",
    summary="Generate and download a branded clinical prediction PDF report",
    response_class=Response
)
async def generate_pdf_report(
    req: PDFReportRequest,
    current_user: Optional[dict] = Depends(get_current_user)
):
    disease = req.disease_name or req.disease_type or "Medical"
    inputs = req.input_data if req.input_data is not None else (req.input_values or {})
    prob = req.probability if req.probability is not None else req.confidence
    status_str = req.status or ("Positive" if req.prediction == 1 else "Negative")

    patient_name = req.patient_name or (current_user.get("full_name") if current_user else "Patient")
    patient_email = req.patient_email or (current_user.get("email") if current_user else "N/A")

    pdf_bytes = pdf_service.generate_prediction_pdf(
        disease_name=disease,
        input_data=inputs,
        prediction=req.prediction,
        status=status_str,
        probability=prob,
        shap_explanations=req.shap_explanations,
        patient_name=patient_name,
        patient_email=patient_email,
        created_at=req.created_at or datetime.now(timezone.utc)
    )

    filename = f"MediVision_{disease.capitalize()}_Report.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )


@router.get(
    "/pdf/{prediction_id}",
    summary="Download PDF report for a saved prediction record by ID",
    response_class=Response
)
async def download_prediction_pdf_by_id(
    prediction_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(prediction_id):
        raise HTTPException(status_code=400, detail="Invalid prediction record ID")

    doc = await mongodb_module.db.predictions.find_one({
        "_id": ObjectId(prediction_id),
        "user_id": ObjectId(current_user["id"])
    })

    if not doc:
        raise HTTPException(status_code=404, detail="Prediction record not found")

    disease = doc.get("disease_type") or doc.get("disease") or "Medical"
    inputs = doc.get("input_data") if doc.get("input_data") is not None else doc.get("input_values", {})
    prob = doc.get("probability") if doc.get("probability") is not None else doc.get("confidence")
    status_str = doc.get("status") or ("Positive" if doc.get("prediction") == 1 else "Negative")

    pdf_bytes = pdf_service.generate_prediction_pdf(
        disease_name=disease,
        input_data=inputs,
        prediction=doc.get("prediction", 0),
        status=status_str,
        probability=prob,
        shap_explanations=doc.get("shap_explanations"),
        patient_name=current_user.get("full_name", "Patient"),
        patient_email=current_user.get("email", "N/A"),
        created_at=doc.get("created_at")
    )

    filename = f"MediVision_{disease.capitalize()}_Report.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )
