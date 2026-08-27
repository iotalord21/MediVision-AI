import sys
import os
import asyncio
from pathlib import Path

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from app.utils.embeddings import embedding_service
from app.utils.vector_store import VectorStore
from app.services.rag_service import rag_service


async def test_rag_pipeline():
    print("\n--- 🧪 Testing RAG Pipeline ---")

    # 1. Test embedding service
    print("1. Testing Dense Embedding Generation...")
    text = "Fasting plasma glucose elevated above 126 mg/dL indicates diabetes risk."
    emb = await embedding_service.get_embedding(text)
    assert len(emb) == 256, f"Expected embedding length 256, got {len(emb)}"
    print(f"   ✅ Generated normalized embedding vector (dim: {len(emb)})")

    # 2. Test knowledge base indexing
    print("2. Testing Medical Knowledge Base Indexing...")
    index_res = rag_service.index_knowledge_base()
    assert index_res["status"] == "success"
    assert index_res["indexed_chunks"] > 0
    print(f"   ✅ Indexed {index_res['indexed_chunks']} chunks across {len(index_res['indexed_files'])} documents.")

    # 3. Test semantic search retrieval
    print("3. Testing Semantic Retrieval for Diabetes...")
    results = await rag_service.retrieve_knowledge("elevated glucose and insulin resistance", disease_filter="diabetes", top_k=3)
    assert len(results) > 0, "Expected search results"
    top_result = results[0]
    print(f"   ✅ Top match score: {top_result['score']} | Section: {top_result['metadata'].get('section_title')}")
    assert "glucose" in top_result["text"].lower() or "insulin" in top_result["text"].lower() or "diabetes" in top_result["text"].lower()

    # 4. Test prediction-aware retrieval
    print("4. Testing Prediction-Aware RAG Retrieval...")
    pred_rag = await rag_service.retrieve_for_prediction(
        disease="diabetes",
        prediction=1,
        status="Positive",
        probability=0.85,
        shap_explanations=[
            {"feature_name": "Glucose", "feature_value": 145.0, "shap_value": 32.5, "impact": "positive"},
            {"feature_name": "BMI", "feature_value": 31.2, "shap_value": 8.1, "impact": "positive"}
        ],
        top_k=3
    )
    assert len(pred_rag["retrieved_chunks"]) > 0
    assert len(pred_rag["citations"]) > 0
    print(f"   ✅ Citations extracted: {len(pred_rag['citations'])}")
    for cit in pred_rag["citations"][:2]:
        print(f"      - {cit['document_name']} ({cit['section_title']}): {cit['source_reference']}")

    print("🎉 RAG Pipeline Test Completed Successfully!\n")


if __name__ == "__main__":
    asyncio.run(test_rag_pipeline())
