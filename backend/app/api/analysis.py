from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from typing import Dict, Any
from app.auth.dependencies import get_current_user
from app.services.document_analysis_service import document_analysis_service

router = APIRouter()

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post(
    "/extract-readings",
    summary="Extract disease-specific clinical readings from an uploaded medical report (PDF/Image)",
    response_model=Dict[str, Any],
    status_code=status.HTTP_200_OK
)
async def extract_readings(
    disease_type: str = Form(..., description="The type of disease (diabetes, heart, kidney, liver, parkinsons)"),
    file: UploadFile = File(..., description="Medical report PDF or image file (max 10MB)"),
    current_user: dict = Depends(get_current_user)
):
    # Validate mime type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{file.content_type}'. Only PDFs and images (JPEG, PNG, WEBP) are supported."
        )

    # Validate file size
    try:
        file_bytes = await file.read()
        if len(file_bytes) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File exceeds maximum allowed size of 10MB."
            )
        
        # Reset pointer just in case
        await file.seek(0)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to read the uploaded file."
        )

    # Perform analysis
    try:
        extracted_data = await document_analysis_service.extract_readings(
            file_bytes=file_bytes,
            mime_type=file.content_type,
            disease_type=disease_type.lower().strip()
        )
        return extracted_data
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI extraction failed: {str(e)}"
        )
