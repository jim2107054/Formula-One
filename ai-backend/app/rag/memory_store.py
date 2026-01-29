"""
Memory Store

Persistent document storage and retrieval using Pinecone Cloud.
Processes PDFs and text files for semantic search.
Uses Pinecone's built-in inference for embeddings.
"""

import os
import uuid
from typing import List
from fastapi import UploadFile
from pinecone import Pinecone
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class MemoryStore:
    """
    Persistent memory store using Pinecone for document
    ingestion and semantic search.
    Uses Pinecone's inference API for embeddings.
    """

    def __init__(self, index_name: str = None):
        """
        Initialize the Memory Store with Pinecone.

        Args:
            index_name: Pinecone index name (defaults to env var).
        """
        # Get API key
        pinecone_api_key = os.getenv("PINECONE_API_KEY")

        if not pinecone_api_key:
            raise RuntimeError("PINECONE_API_KEY not found in environment")

        # Initialize Pinecone client
        self.pc = Pinecone(api_key=pinecone_api_key)

        # Get index name and host
        self.index_name = index_name or os.getenv(
            "PINECONE_INDEX_NAME", "hackathon-rag")

        # Use the host from your Pinecone dashboard
        host = os.getenv(
            "PINECONE_HOST", "https://hackathon-rag-ni0xwtw.svc.aped-4627-b74a.pinecone.io")
        self.index = self.pc.Index(self.index_name, host=host)

        # Embedding model - matches your Pinecone index configuration
        self.embedding_model = "llama-text-embed-v2"

        # Track sources in memory (Pinecone doesn't have easy metadata listing)
        self._sources: set = set()

        print(
            f"✅ MemoryStore initialized with Pinecone index: {self.index_name}")

    def _embed_text(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings using Pinecone's inference API.

        Args:
            texts: List of texts to embed.

        Returns:
            List of embedding vectors.
        """
        embeddings = self.pc.inference.embed(
            model=self.embedding_model,
            inputs=texts,
            parameters={"input_type": "passage"}
        )
        return [e['values'] for e in embeddings]

    def _embed_query(self, query: str) -> List[float]:
        """
        Generate embedding for a query using Pinecone's inference API.

        Args:
            query: The query text.

        Returns:
            Embedding vector.
        """
        embeddings = self.pc.inference.embed(
            model=self.embedding_model,
            inputs=[query],
            parameters={"input_type": "query"}
        )
        return embeddings[0]['values']

    async def ingest_document(self, file: UploadFile) -> dict:
        """
        Ingest a document into the memory store.

        Args:
            file: The uploaded file (PDF or text).

        Returns:
            dict: Ingestion result with status and chunk count.
        """
        # Read file content
        content = await file.read()
        filename = file.filename or "unknown"

        # Extract text based on file type
        if filename.lower().endswith(".pdf"):
            text = self._extract_pdf_text(content)
        else:
            # Assume text file
            text = content.decode("utf-8", errors="ignore")

        # Split into chunks
        chunks = self._split_text(text, chunk_size=1000, overlap=100)

        if not chunks:
            return {"status": "error", "message": "No text extracted from document"}

        # Generate embeddings for each chunk using Pinecone inference
        embeddings = self._embed_text(chunks)

        # Prepare vectors for Pinecone
        vectors = []
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            vector_id = f"{filename}_{uuid.uuid4().hex[:8]}_{i}"
            vectors.append({
                "id": vector_id,
                "values": embedding,
                "metadata": {
                    "source": filename,
                    "chunk_index": i,
                    "text": chunk
                }
            })

        # Upsert to Pinecone
        self.index.upsert(vectors=vectors)

        # Track the source
        self._sources.add(filename)

        return {
            "status": "success",
            "filename": filename,
            "chunks_added": len(chunks)
        }

    def search_context(self, query: str, n_results: int = 3) -> str:
        """
        Search the memory store for relevant context.

        Args:
            query: The search query.
            n_results: Number of results to return.

        Returns:
            str: Concatenated relevant context.
        """
        # Get index stats to check if empty
        stats = self.index.describe_index_stats()
        if stats.total_vector_count == 0:
            return ""

        # Generate query embedding using Pinecone inference
        query_embedding = self._embed_query(query)

        # Query Pinecone
        results = self.index.query(
            vector=query_embedding,
            top_k=n_results,
            include_metadata=True
        )

        # Extract and join documents from metadata
        documents = []
        for match in results.get("matches", []):
            metadata = match.get("metadata", {})
            text = metadata.get("text", "")
            if text:
                documents.append(text)
                # Track source
                source = metadata.get("source")
                if source:
                    self._sources.add(source)

        if not documents:
            return ""

        # Join with separators
        context = "\n\n---\n\n".join(documents)
        return context

    def get_all_sources(self) -> List[str]:
        """Get all unique source filenames in the store."""
        return list(self._sources)

    def get_vector_count(self) -> int:
        """Get total vector count in the index."""
        stats = self.index.describe_index_stats()
        return stats.total_vector_count

    def clear_all(self) -> dict:
        """Clear all documents from the store."""
        # Delete all vectors in the index
        self.index.delete(delete_all=True)
        self._sources.clear()
        return {"status": "success", "message": "All documents cleared"}

    def _extract_pdf_text(self, content: bytes) -> str:
        """Extract text from PDF bytes."""
        try:
            import PyPDF2
            from io import BytesIO

            pdf_file = BytesIO(content)
            reader = PyPDF2.PdfReader(pdf_file)

            text_parts = []
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)

            return "\n\n".join(text_parts)

        except ImportError:
            # PyPDF2 not installed, try alternative
            try:
                import pypdf
                from io import BytesIO

                pdf_file = BytesIO(content)
                reader = pypdf.PdfReader(pdf_file)

                text_parts = []
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)

                return "\n\n".join(text_parts)
            except ImportError:
                return "[PDF extraction requires PyPDF2 or pypdf package]"

        except Exception as e:
            return f"[Error extracting PDF: {str(e)}]"

    def _split_text(self, text: str, chunk_size: int = 1000, overlap: int = 100) -> List[str]:
        """
        Split text into overlapping chunks.

        Args:
            text: The text to split.
            chunk_size: Maximum size of each chunk.
            overlap: Overlap between chunks.

        Returns:
            List[str]: List of text chunks.
        """
        if not text or len(text) < chunk_size:
            return [text] if text else []

        chunks = []
        start = 0

        while start < len(text):
            end = start + chunk_size

            # Try to break at a sentence or paragraph
            if end < len(text):
                # Look for paragraph break
                para_break = text.rfind("\n\n", start, end)
                if para_break > start + chunk_size // 2:
                    end = para_break + 2
                else:
                    # Look for sentence break
                    for punct in [". ", "! ", "? ", "\n"]:
                        sent_break = text.rfind(punct, start, end)
                        if sent_break > start + chunk_size // 2:
                            end = sent_break + len(punct)
                            break

            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)

            start = end - overlap

        return chunks
