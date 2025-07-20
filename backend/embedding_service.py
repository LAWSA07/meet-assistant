import numpy as np
from sentence_transformers import SentenceTransformer
import os
from typing import List

# Load a lightweight embedding model for speed
EMBEDDING_MODEL = SentenceTransformer('all-MiniLM-L6-v2')  # 384 dimensions, fast

def get_embedding(text: str) -> np.ndarray:
    """Generate embedding for a text chunk."""
    if not text.strip():
        return np.zeros(384)  # Return zero vector for empty text
    
    try:
        embedding = EMBEDDING_MODEL.encode(text, convert_to_numpy=True)
        return embedding
    except Exception as e:
        print(f"[Embedding] Error generating embedding: {e}")
        return np.zeros(384)

def get_embeddings_batch(texts: List[str]) -> List[np.ndarray]:
    """Generate embeddings for multiple text chunks efficiently."""
    try:
        embeddings = EMBEDDING_MODEL.encode(texts, convert_to_numpy=True)
        return embeddings
    except Exception as e:
        print(f"[Embedding] Error generating batch embeddings: {e}")
        return [np.zeros(384) for _ in texts] 