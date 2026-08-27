import json
import logging
import os
from pathlib import Path
from typing import List, Dict, Any, Optional
import numpy as np

from app.utils.embeddings import embedding_service

logger = logging.getLogger("uvicorn")


class VectorStore:
    """
    Lightweight, persistent, self-contained Vector Store with dense cosine similarity indexing.
    Ideal for student projects and local deployments with zero remote database subscription cost.
    """

    def __init__(self, storage_dir: Optional[Path] = None):
        if storage_dir is None:
            self.storage_dir = Path(__file__).resolve().parents[2] / "data" / "vector_store"
        else:
            self.storage_dir = storage_dir

        self.storage_dir.mkdir(parents=True, exist_ok=True)
        self.index_file = self.storage_dir / "knowledge_index.json"
        self.chunks: List[Dict[str, Any]] = []
        self.embeddings: Optional[np.ndarray] = None

        self.load()

    def add_chunk(
        self,
        chunk_id: str,
        text: str,
        metadata: Dict[str, Any],
        embedding: List[float]
    ):
        """Add a single chunk and its embedding to memory."""
        self.chunks.append({
            "id": chunk_id,
            "text": text,
            "metadata": metadata,
            "embedding": embedding
        })

    def add_chunks(self, items: List[Dict[str, Any]]):
        """Batch add chunks."""
        for item in items:
            self.add_chunk(
                chunk_id=item["id"],
                text=item["text"],
                metadata=item.get("metadata", {}),
                embedding=item["embedding"]
            )
        self._rebuild_embedding_matrix()

    def _rebuild_embedding_matrix(self):
        """Rebuild dense numpy matrix for fast vectorized matrix-vector dot product search."""
        if not self.chunks:
            self.embeddings = None
            return

        emb_list = [c["embedding"] for c in self.chunks]
        self.embeddings = np.array(emb_list, dtype=np.float32)

    def save(self):
        """Persist vector index to disk as JSON."""
        try:
            with open(self.index_file, "w", encoding="utf-8") as f:
                json.dump(self.chunks, f, indent=2, ensure_ascii=False)
            logger.info(f"✅ Vector index saved successfully: {len(self.chunks)} chunks persisted.")
        except Exception as e:
            logger.error(f"❌ Failed to save vector store index: {e}")

    def load(self):
        """Load vector index from disk if it exists."""
        if not self.index_file.exists():
            self.chunks = []
            self.embeddings = None
            return

        try:
            with open(self.index_file, "r", encoding="utf-8") as f:
                self.chunks = json.load(f)
            self._rebuild_embedding_matrix()
            logger.info(f"✅ Vector store loaded: {len(self.chunks)} chunks active.")
        except Exception as e:
            logger.warning(f"⚠️ Failed to load vector store index ({e}), initializing empty.")
            self.chunks = []
            self.embeddings = None

    def search(
        self,
        query_embedding: List[float],
        disease_filter: Optional[str] = None,
        top_k: int = 4,
        min_score: float = 0.05
    ) -> List[Dict[str, Any]]:
        """
        Execute cosine similarity search over vector store with optional disease filtering.
        """
        if not self.chunks or self.embeddings is None:
            return []

        q_vec = np.array(query_embedding, dtype=np.float32)
        q_norm = np.linalg.norm(q_vec)
        if q_norm == 0:
            return []
        q_vec = q_vec / q_norm

        # Compute cosine similarities via dot product
        scores = np.dot(self.embeddings, q_vec)

        results = []
        for idx, (score, chunk) in enumerate(zip(scores, self.chunks)):
            # Apply disease filter if requested
            chunk_disease = chunk.get("metadata", {}).get("disease", "").lower()
            if disease_filter:
                filter_val = disease_filter.lower().strip()
                # Match disease specifically or match general clinical guidelines
                if chunk_disease and chunk_disease != filter_val and chunk_disease != "general":
                    continue

            if score >= min_score:
                results.append({
                    "id": chunk["id"],
                    "text": chunk["text"],
                    "metadata": chunk.get("metadata", {}),
                    "score": round(float(score), 4)
                })

        # Sort by similarity score descending
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

    def clear(self):
        """Clear the vector store."""
        self.chunks = []
        self.embeddings = None
        if self.index_file.exists():
            try:
                os.remove(self.index_file)
            except Exception:
                pass


vector_store = VectorStore()
