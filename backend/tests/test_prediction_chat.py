import sys
import os
import asyncio

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from app.services.chat_service import chat_service


async def test_prediction_chat():
    print("\n--- 🧪 Testing Conversational Prediction Q&A ---")

    shap_factors = [
        {"feature_name": "Glucose", "feature_value": 140.0, "shap_value": 28.4, "impact": "positive"},
        {"feature_name": "Insulin", "feature_value": 120.0, "shap_value": 6.8, "impact": "positive"}
    ]

    question = "Why was my risk predicted as high? What does glucose mean?"

    response = await chat_service.answer_prediction_question(
        user_question=question,
        disease="diabetes",
        prediction=1,
        status="Positive",
        probability=0.78,
        shap_explanations=shap_factors,
        input_data={"glucose": 140, "insulin": 120, "age": 42}
    )

    print("1. Verifying Conversational Q&A Response...")
    assert "answer" in response and len(response["answer"]) > 20
    assert "citations" in response
    assert "disclaimer" in response

    print("   ✅ Question:", question)
    print("   ✅ Answer:", response["answer"][:160], "...")
    print("   ✅ Citations Count:", len(response["citations"]))

    print("🎉 Conversational Prediction Q&A Test Passed!\n")


if __name__ == "__main__":
    asyncio.run(test_prediction_chat())
