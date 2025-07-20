import numpy as np
import faiss
from typing import List, Dict, Tuple
import uuid

class SessionVectorStore:
    def __init__(self, dimension=384):  # Using a smaller embedding dimension for speed
        self.dimension = dimension
        self.index = faiss.IndexFlatIP(dimension)  # Inner product for cosine similarity
        self.texts = []  # Store original text chunks
        self.session_id = str(uuid.uuid4())
    
    def add_text(self, text: str, embedding: np.ndarray):
        """Add a text chunk and its embedding to the vector store."""
        if len(text.strip()) == 0:
            return
        
        # Normalize embedding for cosine similarity
        embedding = embedding / np.linalg.norm(embedding)
        embedding = embedding.reshape(1, -1)
        
        # Add to FAISS index
        self.index.add(embedding.astype('float32'))
        self.texts.append(text)
    
    def search_relevant_context(self, query_embedding: np.ndarray, k: int = 5) -> List[str]:
        """Search for the k most semantically relevant text chunks."""
        if self.index.ntotal == 0:
            return []
        
        # Normalize query embedding
        query_embedding = query_embedding / np.linalg.norm(query_embedding)
        query_embedding = query_embedding.reshape(1, -1)
        
        # Search FAISS index
        scores, indices = self.index.search(query_embedding.astype('float32'), min(k, self.index.ntotal))
        
        # Return relevant texts
        relevant_texts = [self.texts[i] for i in indices[0]]
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