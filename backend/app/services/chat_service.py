import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from bson import ObjectId

import app.database.mongodb as mongodb_module
from app.services.rag_service import rag_service
from app.services.llm_service import llm_service

logger = logging.getLogger("uvicorn")


class ChatService:
    async def answer_prediction_question(
        self,
        user_question: str,
        disease: str,
        prediction: int,
        status: str,
        probability: Optional[float],
        shap_explanations: Optional[List[Dict[str, Any]]] = None,
        input_data: Optional[Dict[str, Any]] = None,
        prediction_id: Optional[str] = None,
        chat_history: Optional[List[Dict[str, str]]] = None,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Grounded conversational decision-support Q&A.
        Answers user follow-up questions grounded in their specific prediction,
        SHAP feature importances, and relevant retrieved clinical guidelines.
        """
        disease_clean = disease.lower().strip()
        shap_list = shap_explanations or []
        inputs = input_data or {}

        # If a prediction_id is given, try loading details from MongoDB
        if prediction_id and ObjectId.is_valid(prediction_id):
            try:
                doc = await mongodb_module.db.predictions.find_one({"_id": ObjectId(prediction_id)})
                if doc:
                    disease_clean = doc.get("disease_type", doc.get("disease", disease_clean))
                    prediction = doc.get("prediction", prediction)
                    status = doc.get("status", status)
                    probability = doc.get("probability", doc.get("confidence", probability))
                    shap_list = doc.get("shap_explanations", shap_list)
                    inputs = doc.get("input_data", doc.get("input_values", inputs))
            except Exception as exc:
                logger.warning(f"Failed to lookup prediction record {prediction_id}: {exc}")

        # Semantic RAG query combining user question + disease context
        retrieval_query = f"{disease_clean} {user_question}"
        retrieved_chunks = await rag_service.retrieve_knowledge(
            query=retrieval_query,
            disease_filter=disease_clean,
            top_k=3
        )

        citations = []
        for c in retrieved_chunks:
            meta = c.get("metadata", {})
            citations.append({
                "document_name": meta.get("document_name", "Clinical Reference"),
                "section_title": meta.get("section_title", "Medical Guidelines"),
                "source_reference": meta.get("source_reference", "Authoritative Guidelines"),
                "similarity_score": c.get("score", 0.0),
                "excerpt": c.get("text", "")[:250] + ("..." if len(c.get("text", "")) > 250 else "")
            })

        response = await llm_service.generate_chat_response(
            user_question=user_question,
            disease=disease_clean,
            prediction=prediction,
            status=status,
            probability=probability,
            shap_explanations=shap_list,
            input_data=inputs,
            retrieved_chunks=retrieved_chunks,
            citations=citations,
            chat_history=chat_history
        )

        timestamp = datetime.now(timezone.utc)
        response["timestamp"] = timestamp.isoformat()

        # If linked to saved prediction in MongoDB, persist chat interaction
        if prediction_id and ObjectId.is_valid(prediction_id):
            try:
                chat_entry = {
                    "question": user_question,
                    "answer": response.get("answer", ""),
                    "citations": response.get("citations", []),
                    "timestamp": timestamp
                }
                await mongodb_module.db.predictions.update_one(
                    {"_id": ObjectId(prediction_id)},
                    {"$push": {"chat_history": chat_entry}}
                )
            except Exception as e:
                logger.error(f"Failed to persist chat message to prediction {prediction_id}: {e}")

        return response


chat_service = ChatService()
