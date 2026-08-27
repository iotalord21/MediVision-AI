import logging
import os
import re
from pathlib import Path
from typing import List, Dict, Any, Optional

from app.utils.embeddings import embedding_service
from app.utils.vector_store import vector_store

logger = logging.getLogger("uvicorn")

KNOWLEDGE_BASE_DIR = Path(__file__).resolve().parents[2] / "knowledge_base"


class RAGService:
    def __init__(self):
        self.kb_dir = KNOWLEDGE_BASE_DIR
        self.vector_store = vector_store

        # Ensure index exists on startup
        if len(self.vector_store.chunks) == 0:
            self.index_knowledge_base()

    def _extract_disease_from_filename(self, filename: str) -> str:
        name = filename.lower()
        if "diabet" in name:
            return "diabetes"
        elif "heart" in name or "cardio" in name:
            return "heart"
        elif "kidney" in name or "renal" in name:
            return "kidney"
        elif "liver" in name or "hepat" in name:
            return "liver"
        elif "parkinson" in name:
            return "parkinsons"
        return "general"

    def _split_markdown_sections(self, content: str, filename: str) -> List[Dict[str, Any]]:
        """Split markdown content by Level 2 headers (##) while preserving context."""
        lines = content.split("\n")
        doc_title = filename.replace(".md", "").replace("_", " ").title()

        # Try to find # title
        for line in lines:
            if line.startswith("# ") and not line.startswith("## "):
                doc_title = line.replace("# ", "").strip()
                break

        chunks = []
        current_section = "Overview"
        current_lines = []

        for line in lines:
            if line.startswith("## "):
                if current_lines:
                    text_block = "\n".join(current_lines).strip()
                    if len(text_block) > 40:
                        chunks.append({
                            "section_title": current_section,
                            "text": f"[{doc_title} - {current_section}]\n{text_block}"
                        })
                current_section = line.replace("## ", "").strip()
                current_lines = []
            else:
                current_lines.append(line)

        if current_lines:
            text_block = "\n".join(current_lines).strip()
            if len(text_block) > 40:
                chunks.append({
                    "section_title": current_section,
                    "text": f"[{doc_title} - {current_section}]\n{text_block}"
                })

        return chunks

    def index_knowledge_base(self) -> Dict[str, Any]:
        """
        Ingest, clean, chunk, embed, and index all medical knowledge base documents.
        """
        if not self.kb_dir.exists():
            logger.warning(f"Knowledge base directory {self.kb_dir} does not exist.")
            return {"status": "error", "message": "Knowledge base directory not found", "indexed_chunks": 0}

        self.vector_store.clear()
        total_chunks = 0
        indexed_files = []

        for file_path in self.kb_dir.glob("*.md"):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()

                disease = self._extract_disease_from_filename(file_path.name)
                sections = self._split_markdown_sections(content, file_path.name)

                for idx, sec in enumerate(sections):
                    chunk_id = f"{file_path.stem}_{idx}"
                    text = sec["text"]

                    # Extract primary citation source if mentioned in section
                    source_ref = "Clinical Practice Guidelines"
                    if "ada" in text.lower():
                        source_ref = "American Diabetes Association (ADA) Guidelines"
                    elif "aha" in text.lower() or "acc" in text.lower():
                        source_ref = "AHA/ACC Cardiovascular Prevention Guidelines"
                    elif "kdigo" in text.lower():
                        source_ref = "KDIGO Clinical Practice Guidelines for CKD"
                    elif "aasld" in text.lower():
                        source_ref = "AASLD Hepatic Practice Guidance"
                    elif "mds" in text.lower():
                        source_ref = "Movement Disorder Society (MDS) Diagnostic Criteria"
                    elif "who" in text.lower():
                        source_ref = "World Health Organization (WHO) Clinical Standards"

                    metadata = {
                        "disease": disease,
                        "document_name": file_path.name,
                        "section_title": sec["section_title"],
                        "source_reference": source_ref
                    }

                    embedding = embedding_service.get_embedding_sync(text)
                    self.vector_store.add_chunk(
                        chunk_id=chunk_id,
                        text=text,
                        metadata=metadata,
                        embedding=embedding
                    )
                    total_chunks += 1

                indexed_files.append(file_path.name)
            except Exception as e:
                logger.error(f"Error indexing knowledge base file {file_path}: {e}")

        self.vector_store._rebuild_embedding_matrix()
        self.vector_store.save()

        logger.info(f"✅ RAG Knowledge Base indexed: {total_chunks} chunks across {len(indexed_files)} files.")
        return {
            "status": "success",
            "indexed_files": indexed_files,
            "indexed_chunks": total_chunks
        }

    async def retrieve_knowledge(
        self,
        query: str,
        disease_filter: Optional[str] = None,
        top_k: int = 4
    ) -> List[Dict[str, Any]]:
        """Retrieve relevant medical knowledge chunks matching a query."""
        if not query or not query.strip():
            return []

        query_embedding = await embedding_service.get_embedding(query)
        return self.vector_store.search(
            query_embedding=query_embedding,
            disease_filter=disease_filter,
            top_k=top_k
        )

    async def retrieve_for_prediction(
        self,
        disease: str,
        prediction: int,
        status: str,
        probability: Optional[float],
        shap_explanations: Optional[List[Dict[str, Any]]] = None,
        input_data: Optional[Dict[str, Any]] = None,
        top_k: int = 4
    ) -> Dict[str, Any]:
        """
        Prediction-aware retrieval:
        Constructs a rich contextual medical query using predicted disease risk
        and top contributing SHAP features to retrieve ground-truth literature.
        """
        disease_clean = disease.lower().strip()
        risk_label = status or ("Positive" if prediction == 1 else "Negative")

        # Collect top SHAP driver features
        top_factors = []
        if shap_explanations:
            for item in shap_explanations[:4]:
                feat_name = item.get("feature_name", "")
                feat_val = item.get("feature_value", "")
                impact = item.get("impact", "")
                top_factors.append(f"{feat_name} ({feat_val}, impact: {impact})")

        factors_str = ", ".join(top_factors) if top_factors else "standard clinical biomarkers"

        # Build prediction-aware semantic query
        query = (
            f"{disease_clean} risk prediction {risk_label} "
            f"clinical biomarkers {factors_str} prevention management guidelines"
        )

        retrieved_chunks = await self.retrieve_knowledge(
            query=query,
            disease_filter=disease_clean,
            top_k=top_k
        )

        # Structure citations
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
            "query": query,
            "disease": disease_clean,
            "retrieved_chunks": retrieved_chunks,
            "citations": citations
        }


rag_service = RAGService()
