import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List

from app.services.prediction_service import prediction_service
from app.services.explainability_service import explainability_service
from app.services.rag_service import rag_service
from app.services.llm_service import llm_service

logger = logging.getLogger("uvicorn")


class ReportService:
    async def generate_full_ai_report(
        self,
        disease: str,
        input_data: Dict[str, Any],
        prediction: Optional[int] = None,
        status: Optional[str] = None,
        probability: Optional[float] = None,
        shap_explanations: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Orchestrate the complete explainable AI decision support pipeline:
        1. (If not already provided) Execute ML Model Prediction
        2. (If not already provided) Execute SHAP Feature Explainability
        3. Perform Prediction-Aware RAG Knowledge Retrieval
        4. Synthesize Grounded Clinical Report with LLM
        5. Attach Source Citations and Medical Disclaimers
        """
        disease_clean = disease.lower().strip()

        # Step 1: Ensure ML Prediction is available
        if prediction is None or status is None:
            pred_result = prediction_service.predict(disease_clean, input_data)
            prediction = pred_result.get("prediction", 0)
            status = pred_result.get("status", "Negative")
            probability = pred_result.get("probability", 0.5)

        # Step 2: Ensure SHAP explanation is available
        if not shap_explanations:
            shap_explanations = explainability_service.explain_prediction(disease_clean, input_data)

        # Step 3: Retrieve Grounded Medical Literature (Prediction-Aware)
        rag_result = await rag_service.retrieve_for_prediction(
            disease=disease_clean,
            prediction=prediction,
            status=status,
            probability=probability,
            shap_explanations=shap_explanations,
            input_data=input_data,
            top_k=4
        )

        retrieved_chunks = rag_result.get("retrieved_chunks", [])
        citations = rag_result.get("citations", [])

        # Step 4: Synthesize Grounded AI Report via LLM
        ai_report = await llm_service.generate_grounded_report(
            disease=disease_clean,
            prediction=prediction,
            status=status,
            probability=probability,
            shap_explanations=shap_explanations,
            input_data=input_data,
            retrieved_chunks=retrieved_chunks,
            citations=citations
        )

        ai_report["generated_at"] = datetime.now(timezone.utc).isoformat()
        ai_report["disease"] = disease_clean
        ai_report["prediction"] = prediction
        ai_report["status"] = status
        ai_report["probability"] = probability
        ai_report["shap_explanations"] = shap_explanations

        return ai_report


report_service = ReportService()
