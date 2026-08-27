import hashlib
import logging
import math
import re
from typing import List, Union
import httpx
import numpy as np

from app.core import config

logger = logging.getLogger("uvicorn")

EMBEDDING_DIM = 256


class EmbeddingService:
    def __init__(self):
        self.api_key = config.GEMINI_API_KEY

    def _fallback_dense_embedding(self, text: str, dim: int = EMBEDDING_DIM) -> List[float]:
        """
        Deterministic, dense semantic n-gram vector projector.
        Produces smooth normalized dense vector representations for offline use
        and high-speed similarity calculation without external network calls.
        """
        if not text or not text.strip():
            return [0.0] * dim

        cleaned = re.sub(r"[^\w\s]", " ", text.lower())
        tokens = cleaned.split()
        if not tokens:
            return [0.0] * dim

        vec = np.zeros(dim, dtype=np.float32)

        # Word-level & sub-word n-gram hashing into vector dimensions
        for i, word in enumerate(tokens):
            weight = 1.0 / math.sqrt(i + 1)
            # Full word hash
            h_word = int(hashlib.md5(word.encode("utf-8")).hexdigest(), 16)
            idx1 = h_word % dim
            idx2 = (h_word >> 8) % dim
            sign1 = 1.0 if ((h_word >> 16) & 1) else -1.0
            sign2 = 1.0 if ((h_word >> 17) & 1) else -1.0

            vec[idx1] += sign1 * 1.5 * weight
            vec[idx2] += sign2 * 0.8 * weight

            # Character 3-grams
            if len(word) >= 3:
                for j in range(len(word) - 2):
                    ngram = word[j:j + 3]
                    h_ng = int(hashlib.sha256(ngram.encode("utf-8")).hexdigest(), 16)
                    ng_idx = h_ng % dim
                    ng_sign = 1.0 if ((h_ng >> 4) & 1) else -1.0
                    vec[ng_idx] += ng_sign * 0.4 * weight

        # Semantic medical domain keywords boost
        medical_terms = {
            "glucose": 12, "insulin": 13, "diabetes": 14, "blood": 15, "pressure": 16,
            "cholesterol": 22, "angina": 23, "heart": 24, "st": 25, "thalach": 26,
            "creatinine": 32, "urea": 33, "kidney": 34, "albumin": 35, "gfr": 36,
            "bilirubin": 42, "sgpt": 43, "sgot": 44, "liver": 45, "alkphos": 46,
            "parkinson": 52, "jitter": 53, "shimmer": 54, "hnr": 55, "vocal": 56,
            "guideline": 62, "lifestyle": 63, "prevention": 64, "risk": 65, "symptom": 66
        }
        for kw, boost_idx in medical_terms.items():
            if kw in cleaned:
                vec[boost_idx % dim] += 2.0

        # L2 Normalization
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm

        return [round(float(x), 6) for x in vec]

    async def get_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a text string using Gemini API or fallback dense projector.
        """
        api_key = config.GEMINI_API_KEY
        if api_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={api_key}"
                payload = {
                    "model": "models/text-embedding-004",
                    "content": {
                        "parts": [{"text": text[:2000]}]
                    }
                }
                async with httpx.AsyncClient(timeout=8.0) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        values = data.get("embedding", {}).get("values")
                        if values and len(values) > 0:
                            # Normalize embedding
                            arr = np.array(values, dtype=np.float32)
                            norm = np.linalg.norm(arr)
                            if norm > 0:
                                arr = arr / norm
                            return [round(float(x), 6) for x in arr]
            except Exception as exc:
                logger.warning(f"Gemini embedding API call failed ({exc}), using resilient dense fallback.")

        return self._fallback_dense_embedding(text)

    def get_embedding_sync(self, text: str) -> List[float]:
        """Synchronous embedding generation for vector index building and offline tests."""
        return self._fallback_dense_embedding(text)

    def compute_cosine_similarity(self, vec1: Union[List[float], np.ndarray], vec2: Union[List[float], np.ndarray]) -> float:
        """Compute cosine similarity between two unit-normalized embedding vectors."""
        a = np.asarray(vec1, dtype=np.float32)
        b = np.asarray(vec2, dtype=np.float32)
        dot = np.dot(a, b)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return float(dot / (norm_a * norm_b))


embedding_service = EmbeddingService()
