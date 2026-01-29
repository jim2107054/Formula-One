"""
Ingestion Service

Handles document ingestion, chunking, and storage in the vector database.
"""

import logging
from typing import List

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

from app.rag.vector_store.store import VectorStoreManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def ingest_text(content: str, metadata: dict) -> bool:
    """
    Ingest text content by chunking it and storing in the vector database.

    Args:
        content (str): The raw text content to ingest
        metadata (dict): Metadata to attach to each document chunk
                        (e.g., {'source_id': 'slide_1', 'type': 'theory', 'week': 1})

    Returns:
        bool: True if ingestion was successful, False otherwise

    Raises:
        Exception: Logs exceptions but returns False instead of raising
    """
    try:
        logger.info(f"Starting ingestion with metadata: {metadata}")

        # Validate inputs
        if not content or not content.strip():
            logger.warning("Empty content provided for ingestion")
            return False

        if not isinstance(metadata, dict):
            logger.error("Metadata must be a dictionary")
            return False

        # Initialize text splitter
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )

        # Split content into chunks and create Document objects with metadata
        # Using create_documents method which automatically attaches metadata to all chunks
        documents: List[Document] = text_splitter.create_documents(
            texts=[content],
            metadatas=[metadata]
        )
        logger.info(f"Created {len(documents)} document chunks")

        if not documents:
            logger.warning("No documents created from content")
            return False

        # Get vector store instance and add documents
        vector_store_manager = VectorStoreManager()
        vector_store = vector_store_manager.get_vector_store()
        vector_store.add_documents(documents)

        logger.info(f"Successfully ingested {len(documents)} document chunks")
        return True

    except Exception as e:
        logger.error(
            f"Error during ingestion: {type(e).__name__}: {str(e)}", exc_info=True)
        return False


def ingest_multiple_texts(texts: List[tuple[str, dict]]) -> dict:
    """
    Ingest multiple texts in batch.

    Args:
        texts (List[tuple[str, dict]]): List of (content, metadata) tuples

    Returns:
        dict: Summary with 'successful', 'failed', and 'total' counts
    """
    try:
        successful = 0
        failed = 0

        for content, metadata in texts:
            if ingest_text(content, metadata):
                successful += 1
            else:
                failed += 1

        summary = {
            "successful": successful,
            "failed": failed,
            "total": len(texts)
        }

        logger.info(f"Batch ingestion complete: {summary}")
        return summary

    except Exception as e:
        logger.error(
            f"Error during batch ingestion: {type(e).__name__}: {str(e)}", exc_info=True)
        return {
            "successful": 0,
            "failed": len(texts) if texts else 0,
            "total": len(texts) if texts else 0,
            "error": str(e)
        }
