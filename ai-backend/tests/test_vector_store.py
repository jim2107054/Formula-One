"""
Tests for VectorStoreManager singleton class.
"""

import pytest
import shutil
from pathlib import Path
from langchain_core.documents import Document

from app.rag.vector_store.store import VectorStoreManager


@pytest.fixture
def test_persist_dir(tmp_path):
    """Create a temporary directory for testing."""
    test_dir = tmp_path / "test_chroma_db"
    yield str(test_dir)
    # Cleanup after test
    if test_dir.exists():
        shutil.rmtree(test_dir)


@pytest.fixture
def vector_store_manager(test_persist_dir):
    """Create a VectorStoreManager instance for testing."""
    # Reset singleton for testing
    VectorStoreManager._instance = None
    VectorStoreManager._initialized = False

    manager = VectorStoreManager(persist_directory=test_persist_dir)
    yield manager

    # Cleanup
    try:
        manager.delete_collection()
    except:
        pass
    VectorStoreManager._instance = None
    VectorStoreManager._initialized = False


def test_singleton_pattern():
    """Test that VectorStoreManager implements singleton pattern."""
    # Reset singleton
    VectorStoreManager._instance = None
    VectorStoreManager._initialized = False

    manager1 = VectorStoreManager()
    manager2 = VectorStoreManager()

    assert manager1 is manager2
    assert id(manager1) == id(manager2)

    # Cleanup
    VectorStoreManager._instance = None
    VectorStoreManager._initialized = False


def test_initialization(vector_store_manager):
    """Test that VectorStoreManager initializes correctly."""
    assert vector_store_manager is not None
    assert hasattr(vector_store_manager, 'embeddings')
    assert hasattr(vector_store_manager, 'vector_store')
    assert hasattr(vector_store_manager, 'persist_directory')


def test_get_vector_store(vector_store_manager):
    """Test getting the vector store instance."""
    vector_store = vector_store_manager.get_vector_store()
    assert vector_store is not None
    assert vector_store == vector_store_manager.vector_store


def test_add_documents_success(vector_store_manager):
    """Test adding documents successfully."""
    documents = [
        Document(
            page_content="This is a test document about Python programming.",
            metadata={"source": "test1", "type": "theory", "week": 1}
        ),
        Document(
            page_content="This is another document about data structures.",
            metadata={"source": "test2", "type": "lab", "week": 2}
        )
    ]

    ids = vector_store_manager.add_documents(documents)

    assert ids is not None
    assert len(ids) == 2
    assert all(isinstance(id, str) for id in ids)


def test_add_documents_empty_list(vector_store_manager):
    """Test that adding empty list raises ValueError."""
    with pytest.raises(ValueError, match="Documents list cannot be empty"):
        vector_store_manager.add_documents([])


def test_add_documents_invalid_type(vector_store_manager):
    """Test that adding invalid document type raises ValueError."""
    invalid_docs = ["not a document", "also not a document"]

    with pytest.raises(ValueError, match="All items must be LangChain Document objects"):
        vector_store_manager.add_documents(invalid_docs)


def test_similarity_search_basic(vector_store_manager):
    """Test basic similarity search."""
    # Add test documents
    documents = [
        Document(
            page_content="Python is a high-level programming language.",
            metadata={"source": "test1", "type": "theory"}
        ),
        Document(
            page_content="Java is an object-oriented programming language.",
            metadata={"source": "test2", "type": "theory"}
        ),
        Document(
            page_content="Binary search is an efficient algorithm.",
            metadata={"source": "test3", "type": "lab"}
        )
    ]
    vector_store_manager.add_documents(documents)

    # Search for Python-related content
    results = vector_store_manager.similarity_search("Python programming", k=2)

    assert results is not None
    assert len(results) <= 2
    assert all(isinstance(doc, Document) for doc in results)


def test_similarity_search_with_filter(vector_store_manager):
    """Test similarity search with metadata filter."""
    # Add test documents
    documents = [
        Document(
            page_content="Python programming basics.",
            metadata={"source": "test1", "type": "theory"}
        ),
        Document(
            page_content="Python code examples.",
            metadata={"source": "test2", "type": "lab"}
        )
    ]
    vector_store_manager.add_documents(documents)

    # Search with filter for lab type only
    results = vector_store_manager.similarity_search(
        "Python",
        k=2,
        filter={"type": "lab"}
    )

    assert results is not None
    assert len(results) >= 1
    # Check that results match the filter
    for doc in results:
        assert doc.metadata.get("type") == "lab"


def test_similarity_search_empty_query(vector_store_manager):
    """Test that empty query raises ValueError."""
    with pytest.raises(ValueError, match="Query cannot be empty"):
        vector_store_manager.similarity_search("")


def test_similarity_search_invalid_k(vector_store_manager):
    """Test that invalid k value raises ValueError."""
    with pytest.raises(ValueError, match="k must be a positive integer"):
        vector_store_manager.similarity_search("test query", k=0)

    with pytest.raises(ValueError, match="k must be a positive integer"):
        vector_store_manager.similarity_search("test query", k=-1)


def test_get_collection_count(vector_store_manager):
    """Test getting collection count."""
    # Initially should be 0
    initial_count = vector_store_manager.get_collection_count()

    # Add documents
    documents = [
        Document(page_content="Test doc 1", metadata={"id": "1"}),
        Document(page_content="Test doc 2", metadata={"id": "2"})
    ]
    vector_store_manager.add_documents(documents)

    # Count should increase
    new_count = vector_store_manager.get_collection_count()
    assert new_count == initial_count + 2


def test_delete_collection(vector_store_manager):
    """Test deleting the collection."""
    # Add some documents
    documents = [
        Document(page_content="Test document", metadata={"id": "1"})
    ]
    vector_store_manager.add_documents(documents)

    # Verify documents exist
    count_before = vector_store_manager.get_collection_count()
    assert count_before > 0

    # Delete collection
    vector_store_manager.delete_collection()

    # Collection should be empty after recreation
    # Note: After deletion, we need to reinitialize for further use


def test_persistence(test_persist_dir):
    """Test that vector store persists data across instances."""
    # Reset singleton
    VectorStoreManager._instance = None
    VectorStoreManager._initialized = False

    # Create first instance and add documents
    manager1 = VectorStoreManager(persist_directory=test_persist_dir)
    documents = [
        Document(
            page_content="Persistent test document",
            metadata={"source": "persistence_test"}
        )
    ]
    manager1.add_documents(documents)
    initial_count = manager1.get_collection_count()

    # Reset singleton to simulate app restart
    VectorStoreManager._instance = None
    VectorStoreManager._initialized = False

    # Create new instance - should load persisted data
    manager2 = VectorStoreManager(persist_directory=test_persist_dir)
    persisted_count = manager2.get_collection_count()

    # Should have the same count
    assert persisted_count == initial_count

    # Cleanup
    manager2.delete_collection()
    VectorStoreManager._instance = None
    VectorStoreManager._initialized = False
