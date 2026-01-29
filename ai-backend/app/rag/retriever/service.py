"""
Retrieval Service

Handles semantic search and retrieval from the vector database.
"""

import logging
from typing import List, Dict, Optional

from app.rag.vector_store.store import VectorStoreManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def query_rag(query_text: str, k: int = 4, filter: Optional[Dict] = None) -> List[Dict]:
    """
    Query the RAG system to retrieve relevant document chunks.

    Args:
        query_text (str): The search query text
        k (int): Number of results to return (default: 4)
        filter (Optional[Dict]): Metadata filter for the search
                                (e.g., {'type': 'theory'} or {'week': 1})

    Returns:
        List[Dict]: List of dictionaries containing:
                   - "content": The document text content
                   - "metadata": Associated metadata (source_id, type, week, etc.)

    Example:
        >>> results = query_rag("binary search algorithm", k=3)
        >>> for result in results:
        ...     print(result["content"])
        ...     print(result["metadata"])
    """
    try:
        # Validate inputs
        if not query_text or not query_text.strip():
            logger.warning("Empty query text provided")
            return []

        if k <= 0:
            logger.warning(f"Invalid k value: {k}. Must be positive.")
            return []

        logger.info(
            f"Querying RAG with: '{query_text}' (k={k}, filter={filter})")

        # Get vector store instance
        vector_store_manager = VectorStoreManager()
        vector_store = vector_store_manager.get_vector_store()

        # Perform similarity search
        documents = vector_store.similarity_search(
            query=query_text,
            k=k,
            filter=filter
        )

        # Convert Document objects to dictionaries
        results = [
            {
                "content": doc.page_content,
                "metadata": doc.metadata
            }
            for doc in documents
        ]

        logger.info(f"Retrieved {len(results)} results")
        return results

    except Exception as e:
        logger.error(
            f"Error during retrieval: {type(e).__name__}: {str(e)}", exc_info=True)
        return []


def query_by_type(query_text: str, content_type: str, k: int = 4) -> List[Dict]:
    """
    Query the RAG system filtered by content type (theory/lab).

    Args:
        query_text (str): The search query text
        content_type (str): Type of content to search ('theory' or 'lab')
        k (int): Number of results to return (default: 4)

    Returns:
        List[Dict]: List of dictionaries with content and metadata

    Example:
        >>> # Get only theory explanations
        >>> results = query_by_type("sorting algorithms", "theory", k=5)
        >>> 
        >>> # Get only lab code examples
        >>> results = query_by_type("merge sort implementation", "lab", k=3)
    """
    try:
        if content_type not in ['theory', 'lab']:
            logger.warning(
                f"Invalid content_type: {content_type}. Must be 'theory' or 'lab'.")
            return []

        logger.info(f"Querying {content_type} content for: '{query_text}'")

        # Use the main query_rag function with type filter
        return query_rag(
            query_text=query_text,
            k=k,
            filter={'type': content_type}
        )

    except Exception as e:
        logger.error(
            f"Error during type-filtered retrieval: {type(e).__name__}: {str(e)}", exc_info=True)
        return []


def query_by_week(query_text: str, week: int, k: int = 4) -> List[Dict]:
    """
    Query the RAG system filtered by week number.

    Args:
        query_text (str): The search query text
        week (int): Week number to filter by
        k (int): Number of results to return (default: 4)

    Returns:
        List[Dict]: List of dictionaries with content and metadata

    Example:
        >>> # Get content from week 3 only
        >>> results = query_by_week("recursion", week=3, k=4)
    """
    try:
        if week <= 0:
            logger.warning(f"Invalid week: {week}. Must be positive.")
            return []

        logger.info(f"Querying week {week} content for: '{query_text}'")

        # Use the main query_rag function with week filter
        return query_rag(
            query_text=query_text,
            k=k,
            filter={'week': week}
        )

    except Exception as e:
        logger.error(
            f"Error during week-filtered retrieval: {type(e).__name__}: {str(e)}", exc_info=True)
        return []
