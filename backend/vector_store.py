import numpy as np
from annoy import AnnoyIndex
from typing import List, Dict, Tuple
import uuid

class SessionVectorStore:
    def __init__(self, dimension=384):
        self.dimension = dimension
        self.index = AnnoyIndex(dimension, 'angular')  # 'angular' for cosine similarity
        self.texts = []  # Store original text chunks
        self.embeddings = []  # Store embeddings for Annoy lookup
        self.session_id = str(uuid.uuid4())
        self.counter = 0  # Annoy requires integer keys

    def add_text(self, text: str, embedding: np.ndarray):
        """Add a text chunk and its embedding to the vector store."""
        if len(text.strip()) == 0:
            return
        # Normalize embedding for cosine similarity
        embedding = embedding / np.linalg.norm(embedding)
        embedding = embedding.astype('float32')
        self.index.add_item(self.counter, embedding)
        self.texts.append(text)
        self.embeddings.append(embedding)
        self.counter += 1
        self.index.build(1)  # Rebuild index after each add (for small datasets)

    def search_relevant_context(self, query_embedding: np.ndarray, k: int = 5) -> List[str]:
        """Search for the k most semantically relevant text chunks."""
        if self.counter == 0:
            return []
        # Normalize query embedding
        query_embedding = query_embedding / np.linalg.norm(query_embedding)
        query_embedding = query_embedding.astype('float32')
        indices = self.index.get_nns_by_vector(query_embedding, min(k, self.counter), include_distances=False)
        relevant_texts = [self.texts[i] for i in indices]
        return relevant_texts

    def get_all_texts(self) -> str:
        """Get all stored texts concatenated (fallback for short conversations)."""
        return " ".join(self.texts)

# Global session store
session_vector_stores: Dict[str, SessionVectorStore] = {}

def get_or_create_session_store(session_id: str) -> SessionVectorStore:
    """Get existing or create new vector store for a session."""
    if session_id not in session_vector_stores:
        session_vector_stores[session_id] = SessionVectorStore()
    return session_vector_stores[session_id]

def cleanup_session(session_id: str):
    """Clean up vector store when session ends."""
    if session_id in session_vector_stores:
        del session_vector_stores[session_id] 