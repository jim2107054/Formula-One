"""
Smart Agent API

Provides intelligent routing and context-aware responses
using intent classification and persistent memory.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.intelligence.router import IntentRouter
from app.rag.memory_store import MemoryStore
from app.generation.theory_generator import TheoryGenerator
from app.generation.lab_code_generator import LabGenerator
from app.gemini_rag.service import get_gemini_service


router = APIRouter()

# Lazy initialization of services
_intent_router: Optional[IntentRouter] = None
_memory_store: Optional[MemoryStore] = None
_theory_generator: Optional[TheoryGenerator] = None
_lab_generator: Optional[LabGenerator] = None


def get_intent_router() -> IntentRouter:
    """Get or create IntentRouter instance."""
    global _intent_router
    if _intent_router is None:
        _intent_router = IntentRouter()
    return _intent_router


def get_memory_store() -> MemoryStore:
    """Get or create MemoryStore instance."""
    global _memory_store
    if _memory_store is None:
        _memory_store = MemoryStore()
    return _memory_store


def get_theory_generator() -> TheoryGenerator:
    """Get or create TheoryGenerator instance."""
    global _theory_generator
    if _theory_generator is None:
        _theory_generator = TheoryGenerator()
    return _theory_generator


def get_lab_generator() -> LabGenerator:
    """Get or create LabGenerator instance."""
    global _lab_generator
    if _lab_generator is None:
        _lab_generator = LabGenerator()
    return _lab_generator


# Request/Response Models
class AgentQuery(BaseModel):
    """Request model for smart agent queries."""
    query: str = Field(..., description="Natural language query")


class AgentResponse(BaseModel):
    """Response model for smart agent."""
    intent: dict = Field(..., description="Classified intent")
    response: dict = Field(..., description="Generated response")
    sources_used: int = Field(
        default=0, description="Number of context sources used")
    sources: list = Field(
        default=[], description="List of source document names used")


class UploadResponse(BaseModel):
    """Response model for document upload."""
    status: str
    filename: str
    chunks_added: int


class MemoryStatusResponse(BaseModel):
    """Response model for memory status."""
    documents: list
    total_chunks: int


# Endpoints
@router.get("/")
async def agent_root():
    """Agent service information."""
    memory = get_memory_store()
    return {
        "service": "smart-agent",
        "description": "Intelligent routing with persistent memory",
        "documents_loaded": len(memory.get_all_sources()),
        "status": "ready"
    }


@router.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a document to persistent memory.

    Supports PDF and text files. Documents are chunked and stored
    in ChromaDB for semantic search.
    """
    memory = get_memory_store()

    try:
        result = await memory.ingest_document(file)

        if result["status"] != "success":
            raise HTTPException(status_code=400, detail=result.get(
                "message", "Upload failed"))

        return UploadResponse(
            status="success",
            filename=result["filename"],
            chunks_added=result["chunks_added"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to upload: {str(e)}")


@router.post("/ask", response_model=AgentResponse)
async def smart_ask(request: AgentQuery):
    """
    Smart endpoint that classifies intent and routes to appropriate generator.

    1. Classifies the query (theory/lab/chat)
    2. Retrieves relevant context from memory
    3. Routes to appropriate generator
    4. Returns structured response
    """
    intent_router = get_intent_router()
    memory = get_memory_store()
    theory_gen = get_theory_generator()
    lab_gen = get_lab_generator()
    gemini = get_gemini_service()

    try:
        # Step 1: Classify the intent
        intent = await intent_router.classify_request(request.query)

        # Step 2: Get relevant documents from memory
        docs = memory.search_documents(
            intent.get("topic", request.query), n_results=5)

        # Extract context text by joining document contents
        context = "\n\n---\n\n".join(
            doc.page_content for doc in docs) if docs else ""
        sources_count = len(docs)

        # Extract unique sources from document metadata
        sources = list(set(doc.metadata.get("source", "unknown")
                       for doc in docs))

        # Step 3: Route based on intent type
        intent_type = intent.get("type", "chat")
        format_type = intent.get("format", "text")
        topic = intent.get("topic", request.query)

        if intent_type == "theory":
            # Map format to material type
            material_type = "notes"
            if format_type == "slides":
                material_type = "slides"
            elif format_type == "summary":
                material_type = "summary"

            if context:
                result = await theory_gen.generate_with_context(topic, context, material_type)
            else:
                result = await theory_gen.generate_material(topic, material_type)

            response = {
                "type": "theory",
                "format": material_type,
                "content": result["content"]
            }

        elif intent_type == "lab":
            if context:
                result = await lab_gen.generate_with_context(topic, context)
            else:
                result = await lab_gen.generate_lab(topic)

            response = {
                "type": "lab",
                "format": "code",
                "content": result["lab_content"]
            }

        else:  # chat
            if context:
                answer = await gemini.chat_with_context(request.query, context)
            else:
                answer = await gemini.generate_without_files(request.query)

            response = {
                "type": "chat",
                "format": "text",
                "content": answer
            }

        return AgentResponse(
            intent=intent,
            response=response,
            sources_used=sources_count,
            sources=sources
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")


@router.get("/memory/status", response_model=MemoryStatusResponse)
async def memory_status():
    """Get the status of persistent memory."""
    memory = get_memory_store()

    return MemoryStatusResponse(
        documents=memory.get_all_sources(),
        total_chunks=memory.get_vector_count()
    )


@router.delete("/memory/clear")
async def clear_memory():
    """Clear all documents from persistent memory."""
    memory = get_memory_store()
    result = memory.clear_all()
    return result


@router.post("/classify")
async def classify_only(request: AgentQuery):
    """
    Classify a query without generating a response.
    Useful for debugging or understanding how queries are routed.
    """
    intent_router = get_intent_router()

    try:
        intent = await intent_router.classify_request(request.query)
        return {"query": request.query, "intent": intent}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Classification error: {str(e)}")
