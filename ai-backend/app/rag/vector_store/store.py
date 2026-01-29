"""
Vector Store Manager - Singleton for ChromaDB

This module implements a singleton pattern for managing the vector store
using ChromaDB with HuggingFace embeddings.
"""

import os
from typing import List, Optional
from pathlib import Path

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.schema import Document


class VectorStoreManager:
    """
    Singleton class for managing ChromaDB vector store.

    Uses HuggingFace embeddings (all-MiniLM-L6-v2) for local, CPU-friendly operations.
    Maintains a persistent vector store in ./chroma_db directory.
    """

    _instance: Optional['VectorStoreManager'] = None
    _initialized: bool = False

    def __new__(cls, persist_directory: str = "./chroma_db") -> 'VectorStoreManager':
        """
        Implement singleton pattern.

        Args:
            persist_directory: Directory path for ChromaDB persistence (ignored if instance exists)

        Returns:
            VectorStoreManager: The single instance of the class
        """
        if cls._instance is None:
            cls._instance = super(VectorStoreManager, cls).__new__(cls)
        return cls._instance

    def __init__(self, persist_directory: str = "./chroma_db") -> None:
        """
        Initialize the VectorStoreManager with embeddings and ChromaDB.

        Only initializes once due to singleton pattern.

        Args:
            persist_directory: Directory path for ChromaDB persistence

        Raises:
            RuntimeError: If initialization fails
        """
        # Only initialize once
        if VectorStoreManager._initialized:
            return

        try:
            # Initialize HuggingFace embeddings
            self.embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/all-MiniLM-L6-v2",
                model_kwargs={'device': 'cpu'},
                encode_kwargs={'normalize_embeddings': True}
            )

            # Set up persistent directory
            self.persist_directory = persist_directory
            Path(persist_directory).mkdir(parents=True, exist_ok=True)

            # Initialize ChromaDB vector store
            self.vector_store = Chroma(
                persist_directory=self.persist_directory,
                embedding_function=self.embeddings,
                collection_name="course_materials"
            )

            VectorStoreManager._initialized = True

        except Exception as e:
            raise RuntimeError(
                f"Failed to initialize VectorStoreManager: {str(e)}") from e

    def get_vector_store(self) -> Chroma:
        """
        Get the ChromaDB vector store instance.

        Returns:
            Chroma: The vector store instance

        Raises:
            RuntimeError: If vector store is not initialized
        """
        if not hasattr(self, 'vector_store') or self.vector_store is None:
            raise RuntimeError("Vector store not initialized")
        return self.vector_store

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
            # Add documents and return IDs
            ids = self.vector_store.add_documents(documents)
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
            # Perform similarity search
            if filter:
                results = self.vector_store.similarity_search(
                    query=query,
                    k=k,
                    filter=filter
                )
            else:
                results = self.vector_store.similarity_search(
                    query=query,
                    k=k
                )
            return results
        except Exception as e:
            raise RuntimeError(f"Similarity search failed: {str(e)}") from e

    def delete_collection(self) -> None:
        """
        Delete the entire collection from the vector store.

        Useful for testing or resetting the database.

        Raises:
            RuntimeError: If deletion fails
        """
        try:
            self.vector_store.delete_collection()
        except Exception as e:
            raise RuntimeError(f"Failed to delete collection: {str(e)}") from e

    def get_collection_count(self) -> int:
        """
        Get the number of documents in the collection.

        Returns:
            int: Number of documents in the vector store

        Raises:
            RuntimeError: If count retrieval fails
        """
        try:
            collection = self.vector_store._collection
            return collection.count()
        except Exception as e:
            raise RuntimeError(
                f"Failed to get collection count: {str(e)}") from e
