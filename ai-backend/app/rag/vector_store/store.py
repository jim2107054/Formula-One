"""
Vector Store Manager - Singleton for Pinecone Cloud

This module implements a singleton pattern for managing the vector store
using Pinecone with built-in inference for embeddings.
"""

import os
from typing import List, Optional

from langchain_core.documents import Document
from pinecone import Pinecone
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class VectorStoreManager:
    """
    Singleton class for managing Pinecone vector store.

    Uses Pinecone's built-in inference API for embeddings.
    Connects to Pinecone cloud service for vector storage.
    """

    _instance: Optional['VectorStoreManager'] = None
    _initialized: bool = False

    def __new__(cls, index_name: str = None) -> 'VectorStoreManager':
        """
        Implement singleton pattern.

        Args:
            index_name: Pinecone index name (ignored if instance exists)

        Returns:
            VectorStoreManager: The single instance of the class
        """
        if cls._instance is None:
            cls._instance = super(VectorStoreManager, cls).__new__(cls)
        return cls._instance

    def __init__(self, index_name: str = None) -> None:
        """
        Initialize the VectorStoreManager with Pinecone.

        Only initializes once due to singleton pattern.

        Args:
            index_name: Pinecone index name (defaults to env var PINECONE_INDEX_NAME)

        Raises:
            RuntimeError: If initialization fails
        """
        # Only initialize once
        if VectorStoreManager._initialized:
            return

        try:
            # Get API key from environment
            pinecone_api_key = os.getenv("PINECONE_API_KEY")

            if not pinecone_api_key:
                raise RuntimeError("PINECONE_API_KEY not found in environment")

            # Initialize Pinecone client
            self.pc = Pinecone(api_key=pinecone_api_key)

            # Get index name from parameter or environment
            self.index_name = index_name or os.getenv(
                "PINECONE_INDEX_NAME", "hackathon-rag")

            # Get host from environment
            host = os.getenv(
                "PINECONE_HOST", "https://hackathon-rag-ni0xwtw.svc.aped-4627-b74a.pinecone.io")

            # Get the index with host
            self.index = self.pc.Index(self.index_name, host=host)

            # Embedding model - matches Pinecone index configuration
            self.embedding_model = "llama-text-embed-v2"

            VectorStoreManager._initialized = True
            print(
                f"✅ VectorStoreManager initialized with Pinecone index: {self.index_name}")

        except Exception as e:
            raise RuntimeError(
                f"Failed to initialize VectorStoreManager: {str(e)}") from e

    def _embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for documents using Pinecone inference."""
        embeddings = self.pc.inference.embed(
            model=self.embedding_model,
            inputs=texts,
            parameters={"input_type": "passage"}
        )
        return [e['values'] for e in embeddings]

    def _embed_query(self, query: str) -> List[float]:
        """Generate embedding for a query using Pinecone inference."""
        embeddings = self.pc.inference.embed(
            model=self.embedding_model,
            inputs=[query],
            parameters={"input_type": "query"}
        )
        return embeddings[0]['values']

    def get_index(self):
        """
        Get the Pinecone index instance.

        Returns:
            Index: The Pinecone index instance

        Raises:
            RuntimeError: If index is not initialized
        """
        if not hasattr(self, 'index') or self.index is None:
            raise RuntimeError("Pinecone index not initialized")
        return self.index

    def add_documents(self, documents: List[Document]) -> List[str]:
        """
        Add documents to the vector store.

        Args:
            documents: List of LangChain Document objects with page_content and metadata

        Returns:
            List[str]: List of document IDs that were added

        Raises:
            ValueError: If documents list is empty or invalid
            RuntimeError: If adding documents fails
        """
        if not documents:
            raise ValueError("Documents list cannot be empty")

        if not all(isinstance(doc, Document) for doc in documents):
            raise ValueError("All items must be LangChain Document objects")

        try:
            import uuid

            # Extract texts from documents
            texts = [doc.page_content for doc in documents]

            # Generate embeddings using Pinecone inference
            embeddings = self._embed_documents(texts)

            # Prepare vectors for Pinecone
            vectors = []
            ids = []
            for i, (doc, embedding) in enumerate(zip(documents, embeddings)):
                vector_id = f"doc_{uuid.uuid4().hex[:8]}_{i}"
                ids.append(vector_id)
                vectors.append({
                    "id": vector_id,
                    "values": embedding,
                    "metadata": {
                        "text": doc.page_content,
                        **doc.metadata
                    }
                })

            # Upsert to Pinecone
            self.index.upsert(vectors=vectors)
            return ids
        except Exception as e:
            raise RuntimeError(
                f"Failed to add documents to vector store: {str(e)}") from e

    def similarity_search(
        self,
        query: str,
        k: int = 4,
        filter: Optional[dict] = None
    ) -> List[Document]:
        """
        Perform similarity search on the vector store.

        Args:
            query: The search query string
            k: Number of results to return (default: 4)
            filter: Optional metadata filter dictionary

        Returns:
            List[Document]: List of relevant documents with metadata

        Raises:
            ValueError: If query is empty or k is invalid
            RuntimeError: If search fails
        """
        if not query or not query.strip():
            raise ValueError("Query cannot be empty")

        if k <= 0:
            raise ValueError("k must be a positive integer")

        try:
            # Generate query embedding using Pinecone inference
            query_embedding = self._embed_query(query)

            # Query Pinecone
            results = self.index.query(
                vector=query_embedding,
                top_k=k,
                include_metadata=True,
                filter=filter
            )

            # Convert to LangChain Documents
            documents = []
            for match in results.get("matches", []):
                metadata = match.get("metadata", {})
                text = metadata.pop("text", "")
                doc = Document(page_content=text, metadata=metadata)
                documents.append(doc)

            return documents
        except Exception as e:
            raise RuntimeError(f"Similarity search failed: {str(e)}") from e

    def delete_all(self) -> None:
        """
        Delete all vectors from the Pinecone index.

        Useful for testing or resetting the database.

        Raises:
            RuntimeError: If deletion fails
        """
        try:
            # Delete all vectors in the index
            self.index.delete(delete_all=True)
            print(f"✅ Deleted all vectors from index: {self.index_name}")
        except Exception as e:
            raise RuntimeError(f"Failed to delete vectors: {str(e)}") from e

    def get_collection_count(self) -> int:
        """
        Get the number of vectors in the index.

        Returns:
            int: Number of vectors in the Pinecone index

        Raises:
            RuntimeError: If count retrieval fails
        """
        try:
            stats = self.index.describe_index_stats()
            return stats.total_vector_count
        except Exception as e:
            raise RuntimeError(
                f"Failed to get collection count: {str(e)}") from e


# Convenience function for getting the singleton instance
def get_vector_store_manager() -> VectorStoreManager:
    """Get the VectorStoreManager singleton instance."""
    return VectorStoreManager()
