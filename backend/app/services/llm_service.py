import json
import logging
from typing import Dict, Any, List, Optional
import httpx

from app.core import config

logger = logging.getLogger("uvicorn")


class LLMService:
    def __init__(self):
        self.api_key = config.GEMINI_API_KEY

    def _generate_fallback_report(
        self,
        disease: str,
        prediction: int,
        status: str,
        probability: Optional[float],
        shap_explanations: List[Dict[str, Any]],
        input_data: Dict[str, Any],
        retrieved_chunks: List[Dict[str, Any]],
        citations: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        High-quality, grounded clinical synthesis fallback generator
        when Gemini API is offline or unconfigured.
        """
        disease_name = disease.replace("_", " ").title()
        risk_str = status or ("High Risk" if prediction == 1 else "Low Risk")
        prob_pct = f"{round((probability or 0.5) * 100, 1)}%" if probability is not None else "N/A"

        # Format top SHAP factors
        shap_bullet_points = []
        for feat in shap_explanations[:5]:
            fname = feat.get("feature_name", "")
            fval = feat.get("feature_value", "")
            impact = feat.get("impact", "positive")
            direction_desc = "elevated the estimated risk" if impact == "positive" else "reduced the estimated risk"
            shap_bullet_points.append(
                f"- **{fname}** (Value: `{fval}`): Identified as a key contributor that {direction_desc} based on trained cohort patterns."
            )
        shap_analysis_text = "\n".join(shap_bullet_points) if shap_bullet_points else "Standard clinical parameters were evaluated across the feature distribution."

        # Extract medical context from retrieved chunks
        context_excerpts = []
        for c in retrieved_chunks[:3]:
            sec = c.get("metadata", {}).get("section_title", "Clinical Guidelines")
            txt = c.get("text", "").split("\n", 1)[-1].strip()[:350]
            context_excerpts.append(f"**From {sec}:**\n{txt}")
        medical_context_text = "\n\n".join(context_excerpts) if context_excerpts else f"Clinical guidelines emphasize regular monitoring of biomarkers for {disease_name}."

        summary_text = (
            f"The machine learning risk assessment model evaluated the clinical inputs for **{disease_name}** "
            f"and classified the overall profile as **{risk_str}** with a model probability score of **{prob_pct}**. "
            f"This prediction is an automated statistical estimation derived from clinical training patterns."
        )

        recommendations_text = (
            f"1. **Physician Follow-up**: Schedule a formal consultation with a licensed healthcare provider to review these lab values.\n"
            f"2. **Routine Biomarker Monitoring**: Re-evaluate key parameters (such as blood pressure, glycemic metrics, or organ function tests) as advised by clinical guidelines.\n"
            f"3. **Evidence-Based Lifestyle Optimization**: Maintain a balanced, nutrient-dense dietary pattern, engage in regular age-appropriate physical activity, and avoid known risk exacerbators."
        )

        disclaimer_text = (
            "IMPORTANT MEDICAL DISCLAIMER: MediVision AI is a clinical decision-support research prototype. "
            "This output is an automated statistical risk prediction and does NOT constitute a medical diagnosis, "
            "prognosis, or treatment prescription. Always consult a qualified physician or healthcare professional for clinical decisions."
        )

        return {
            "summary": summary_text,
            "shap_analysis": shap_analysis_text,
            "medical_context": medical_context_text,
            "recommendations": recommendations_text,
            "citations": citations,
            "disclaimer": disclaimer_text,
            "is_ai_generated": True
        }

    async def generate_grounded_report(
        self,
        disease: str,
        prediction: int,
        status: str,
        probability: Optional[float],
        shap_explanations: List[Dict[str, Any]],
        input_data: Dict[str, Any],
        retrieved_chunks: List[Dict[str, Any]],
        citations: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Synthesize ML prediction + SHAP feature attributions + RAG medical literature
        into a structured, grounded clinical decision support report using Gemini LLM.
        """
        if not self.api_key:
            return self._generate_fallback_report(
                disease, prediction, status, probability,
                shap_explanations, input_data, retrieved_chunks, citations
            )

        disease_name = disease.replace("_", " ").title()
        risk_str = status or ("Positive (High Risk)" if prediction == 1 else "Negative (Low Risk)")
        prob_str = f"{(probability * 100):.1f}%" if probability is not None else "N/A"

        # Format context for prompt
        rag_context = "\n\n".join([
            f"[Source: {c.get('metadata', {}).get('source_reference', 'Guideline')} - {c.get('metadata', {}).get('section_title', 'Section')}]\n{c.get('text', '')}"
            for c in retrieved_chunks
        ])

        shap_summary = json.dumps(shap_explanations[:6], indent=2)
        patient_inputs = json.dumps(input_data, indent=2)

        prompt = f"""
You are an expert, compassionate Medical AI Synthesizer for MediVision AI.
Your task is to generate a comprehensive, grounded, explainable clinical decision-support report by synthesizing an ML model prediction, SHAP feature attributions, and retrieved authoritative medical literature.

CRITICAL CLINICAL & ETHICAL RULES:
1. DO NOT change or override the ML prediction. The machine learning model has already determined:
   - Target Condition: {disease_name}
   - Prediction Result: {risk_str}
   - Model Confidence / Probability: {prob_str}
2. The ML model is the source of truth for the prediction.
3. SHAP is the source of truth for which features influenced the prediction.
4. The retrieved medical literature is the source of truth for clinical medical facts.
5. All medical explanations MUST be strictly grounded in the retrieved literature. Do NOT fabricate clinical statistics or unsupported medical claims.
6. The report MUST emphasize that this is decision support and risk prediction, NOT a diagnostic certainty or medical prescription.

INPUT DATA:
- Patient Health Inputs:
{patient_inputs}

- Top SHAP Contributing Features:
{shap_summary}

- Retrieved Authoritative Medical Knowledge Chunks:
{rag_context}

Respond ONLY with a valid JSON object with the following exact keys:
{{
  "summary": "Clear, objective 2-3 sentence overview of the model prediction, risk status, and probability score.",
  "shap_analysis": "Detailed plain-English explanation of why the top SHAP features increased or decreased the risk, referencing the patient's specific lab values.",
  "medical_context": "Explanation of what the retrieved medical literature and clinical guidelines state about these biomarkers and disease mechanisms.",
  "recommendations": "Structured, non-prescriptive, evidence-based lifestyle and preventive recommendations grounded in the guidelines.",
  "disclaimer": "Standard clinical decision support disclaimer emphasizing that this is a risk prediction model and not a medical diagnosis."
}}
"""

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.2
            }
        }

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.api_key}"

        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    candidates = resp.json().get("candidates", [])
                    if candidates:
                        raw_text = candidates[0]["content"]["parts"][0]["text"].strip()
                        if raw_text.startswith("```"):
                            lines = raw_text.splitlines()
                            if lines[0].startswith("```json"):
                                raw_text = "\n".join(lines[1:-1])
                            elif lines[0].startswith("```"):
                                raw_text = "\n".join(lines[1:-1])
                        data = json.loads(raw_text)
                        return {
                            "summary": data.get("summary", ""),
                            "shap_analysis": data.get("shap_analysis", ""),
                            "medical_context": data.get("medical_context", ""),
                            "recommendations": data.get("recommendations", ""),
                            "citations": citations,
                            "disclaimer": data.get("disclaimer", "MediVision AI is a decision support tool, not a medical diagnosis."),
                            "is_ai_generated": True
                        }
        except Exception as e:
            logger.warning(f"Gemini LLM generation encountered error: {e}. Utilizing grounded fallback synthesizer.")

        return self._generate_fallback_report(
            disease, prediction, status, probability,
            shap_explanations, input_data, retrieved_chunks, citations
        )

    async def generate_chat_response(
        self,
        user_question: str,
        disease: str,
        prediction: int,
        status: str,
        probability: Optional[float],
        shap_explanations: List[Dict[str, Any]],
        input_data: Dict[str, Any],
        retrieved_chunks: List[Dict[str, Any]],
        citations: List[Dict[str, Any]],
        chat_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Generate grounded conversational answer for user questions regarding their prediction.
        """
        disease_name = disease.replace("_", " ").title()
        risk_str = status or ("High Risk" if prediction == 1 else "Low Risk")
        prob_pct = f"{round((probability or 0.5) * 100, 1)}%" if probability is not None else "N/A"

        if not self.api_key:
            # Smart fallback response generator
            q_lower = user_question.lower()
            if "why" in q_lower or "high" in q_lower or "reason" in q_lower or "factor" in q_lower:
                top_3 = ", ".join([f"{f.get('feature_name')} ({f.get('feature_value')})" for f in shap_explanations[:3]])
                answer = (
                    f"Your {disease_name} prediction is categorized as **{risk_str}** (probability: {prob_pct}) "
                    f"primarily because the model identified **{top_3}** as significant contributing factors. "
                    f"According to clinical literature, these biomarkers are closely associated with physiological risk patterns for this condition."
                )
            elif "glucose" in q_lower or "sugar" in q_lower:
                answer = (
                    "Glucose levels directly indicate how effectively your body regulates blood sugar. "
                    "Elevated fasting glucose is a primary biomarker for impaired insulin signaling and metabolic risk."
                )
            elif "recommend" in q_lower or "lifestyle" in q_lower or "diet" in q_lower or "do" in q_lower:
                answer = (
                    f"Clinical guidelines for {disease_name} recommend maintaining a nutrient-dense diet, engaging in at least "
                    f"150 minutes of moderate aerobic activity weekly, managing blood pressure and stress, and scheduling a follow-up with your physician."
                )
            else:
                answer = (
                    f"Based on your {disease_name} assessment ({risk_str}, {prob_pct} probability) and the retrieved clinical literature, "
                    f"your results reflect the collective impact of your health readings. Always review specific health questions with your doctor."
                )

            return {
                "answer": answer,
                "citations": citations[:2],
                "disclaimer": "MediVision AI is a clinical decision-support prototype. Please consult a qualified doctor for personalized medical advice."
            }

        # Build prompt with Gemini
        rag_context = "\n\n".join([
            f"[Source: {c.get('metadata', {}).get('source_reference', 'Guideline')} - {c.get('metadata', {}).get('section_title', 'Section')}]\n{c.get('text', '')}"
            for c in retrieved_chunks
        ])

        shap_summary = json.dumps(shap_explanations[:5], indent=2)
        patient_inputs = json.dumps(input_data, indent=2)

        history_str = ""
        if chat_history:
            for turn in chat_history[-4:]:
                role = turn.get("role", "user")
                msg = turn.get("message", turn.get("content", ""))
                history_str += f"{role.capitalize()}: {msg}\n"

        prompt = f"""
You are the conversational clinical assistant for MediVision AI.
A patient is asking follow-up questions about their disease risk prediction.

PREDICTION CONTEXT (DO NOT OVERRIDE OR CONTRADICT):
- Condition: {disease_name}
- Prediction: {risk_str}
- Probability: {prob_str}
- Patient Lab Inputs: {patient_inputs}
- Top Contributing SHAP Features: {shap_summary}

RETRIEVED MEDICAL GUIDELINES & CLINICAL LITERATURE:
{rag_context}

RECENT CONVERSATION:
{history_str}

USER QUESTION:
"{user_question}"

INSTRUCTIONS:
1. Answer the user's question clearly, empethetically, and concisely.
2. Ground your explanations directly in their prediction values, SHAP feature importances, and the retrieved medical knowledge.
3. If they ask why their risk is high/low, cite the specific SHAP factors and their lab values.
4. Do NOT make definitive diagnostic statements or prescribe specific prescription drug dosages.
5. Provide non-diagnostic lifestyle guidance when asked.
6. Provide a concise reminder to discuss findings with a qualified physician.

Format your response as a JSON object:
{{
  "answer": "Your comprehensive, grounded response formatted with clean markdown.",
  "disclaimer": "Short medical disclaimer"
}}
"""

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.3
            }
        }

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.api_key}"

        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    candidates = resp.json().get("candidates", [])
                    if candidates:
                        raw_text = candidates[0]["content"]["parts"][0]["text"].strip()
                        if raw_text.startswith("```"):
                            lines = raw_text.splitlines()
                            if lines[0].startswith("```json"):
                                raw_text = "\n".join(lines[1:-1])
                            elif lines[0].startswith("```"):
                                raw_text = "\n".join(lines[1:-1])
                        data = json.loads(raw_text)
                        return {
                            "answer": data.get("answer", ""),
                            "citations": citations[:2],
                            "disclaimer": data.get("disclaimer", "Consult your physician for personal medical decisions.")
                        }
        except Exception as e:
            logger.warning(f"Gemini chat generation failed ({e}), using fallback.")

        # Fallback
        return {
            "answer": f"Based on your {disease_name} prediction ({risk_str}), key parameters contributed to your risk score. Please review these findings with your healthcare provider.",
            "citations": citations[:2],
            "disclaimer": "MediVision AI provides informational decision support only."
        }


llm_service = LLMService()
