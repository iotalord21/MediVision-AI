from typing import Optional
from fastapi import APIRouter, Depends, Query, status

from app.auth.dependencies import get_optional_current_user, get_current_user
from app.schemas.rag import (
    RAGRetrievalRequest,
    RAGRetrievalResponse,
    RAGIndexResponse
)
from app.services.rag_service import rag_service

router = APIRouter()


@router.post(
    "/retrieve",
    response_model=RAGRetrievalResponse,
    summary="Retrieve grounded medical knowledge chunks and source citations using semantic search"
)
async def retrieve_medical_knowledge(
    req: RAGRetrievalRequest,
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    retrieved_chunks = await rag_service.retrieve_knowledge(
        query=req.query,
        disease_filter=req.disease,
        top_k=req.top_k
    )

    citations = []
    for chunk in retrieved_chunks:
        meta = chunk.get("metadata", {})
        citations.append({
            "document_name": meta.get("document_name", "Clinical Reference"),
            "section_title": meta.get("section_title", "Medical Guidelines"),
            "source_reference": meta.get("source_reference", "Authoritative Guidelines"),
            "similarity_score": chunk.get("score", 0.0),
            "excerpt": chunk.get("text", "")[:280] + ("..." if len(chunk.get("text", "")) > 280 else "")
        })

    return {
        "query": req.query,
        "disease": req.disease,
        "retrieved_chunks": retrieved_chunks,
        "citations": citations
    }


@router.post(
    "/reindex",
    response_model=RAGIndexResponse,
    summary="Re-index medical knowledge base documents into vector store"
)
def reindex_knowledge_base(
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    result = rag_service.index_knowledge_base()
    return result


@router.get(
    "/status",
    summary="Check status of RAG vector store and indexed medical documents"
)
def get_rag_status():
    chunks = rag_service.vector_store.chunks
    diseases = set(c.get("metadata", {}).get("disease") for c in chunks if c.get("metadata", {}).get("disease"))
    return {
        "status": "online",
        "total_chunks": len(chunks),
        "indexed_diseases": list(diseases),
        "knowledge_base_dir": str(rag_service.kb_dir)
    }
