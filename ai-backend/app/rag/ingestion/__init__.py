"""
RAG Ingestion Package

Handles document ingestion, chunking, and storage.
"""

from app.rag.ingestion.service import ingest_text, ingest_multiple_texts

__all__ = ["ingest_text", "ingest_multiple_texts"]
