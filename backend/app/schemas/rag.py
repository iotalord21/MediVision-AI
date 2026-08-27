from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class SourceCitation(BaseModel):
    document_name: str
    section_title: str
    source_reference: str
    similarity_score: float
    excerpt: str


class RAGChunkResponse(BaseModel):
    id: str
    text: str
    metadata: Dict[str, Any]
    score: float


class RAGRetrievalRequest(BaseModel):
    query: str = Field(..., example="What are normal fasting glucose levels and diabetes risk factors?")
    disease: Optional[str] = Field(None, example="diabetes")
    top_k: int = Field(4, ge=1, le=10)


class RAGRetrievalResponse(BaseModel):
    query: str
    disease: Optional[str]
    retrieved_chunks: List[RAGChunkResponse]
    citations: List[SourceCitation]


class RAGIndexResponse(BaseModel):
    status: str
    indexed_files: List[str]
    indexed_chunks: int
