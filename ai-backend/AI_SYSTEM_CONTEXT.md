# AI System Context & RAG Architecture

## 🎯 Purpose

This document serves as the "Source of Truth" for the AI Backend's architecture. It tracks the implementation status of the RAG pipeline and Generation engine.
**Github Copilot Instruction:** Read this file before implementing features to understand the architectural constraints and current progress. Update the "Implementation Status" section below as features are completed. Write the techinal documentation in the README.md like what are the api endpoints, what are thier input and output expected formats and structure. how to connect them to the backend. How to run the ai system etc.

---

## 🏗 High-Level RAG Pipeline

We are building a **Modular RAG System** using **LangChain** and **ChromaDB**. The system must distinguish between **Theory** (slides, PDFs) and **Lab** (code files) to provide context-aware answers.

### The Pipeline Flow

1.  **Ingestion Layer (`/rag/ingest`)**
    - **Input:** Raw text from slides/PDFs or Code snippets.
    - **Processing:**
      - Clean whitespace/formatting.
      - **Chunking:** Split text into manageable pieces (e.g., 1000 chars).
      - **Metadata Tagging:** Tag chunks with `source_id`, `type` (Theory/Lab), and `week`.
    - **Embedding:** Convert text to vectors using `sentence-transformers/all-MiniLM-L6-v2` (Local, fast, free).
    - **Storage:** Save to `ChromaDB` (Local persistent directory).

2.  **Retrieval Layer (`/rag/search`)**
    - **Input:** User query (e.g., "How does binary search work?" or "Show me the lab code for sorting").
    - **Router:** Determine if the user needs _Theory_ or _Lab_ help.
    - **Search:** Query ChromaDB using Semantic Search (cosine similarity).
    - **Filtering:** Apply metadata filters (e.g., `filter={'type': 'lab'}`).
    - **Output:** Top-k relevant chunks.

3.  **Generation Layer (GenAI)**
    - **Input:** User Query + Retrieved Context (from RAG).
    - **Prompting:** Inject context into a strict prompt template.
    - **Validation:**
      - _Code:_ Run simple syntax checkers/linters.
      - _Theory:_ Ensure response is grounded in retrieved context (no hallucinations).

---

## 🛠 Tech Stack Constraints

- **Framework:** FastAPI (Python)
- **Orchestration:** LangChain
- **Vector Store:** ChromaDB (Persistent Client)
- **Embeddings:** HuggingFace `all-MiniLM-L6-v2` (CPU friendly)
- **Testing:** Pytest

---

## ✅ Implementation Status

_(Copilot: Mark as [x] when passing tests)_

### Phase 1: RAG Foundation (Local ChromaDB)

- [x] **Dependencies:** Installed `langchain`, `chromadb`, `sentence-transformers`.
- [x] **Vector Store:** Singleton class initialized for ChromaDB.
- [x] **Ingestion Service:** Logic to chunk and store text with metadata.
- [x] **Retrieval Service:** Logic to query and return results.
- [x] **API Endpoints:** `/ingest` and `/search` exposed via FastAPI.
- [x] **Tests:** Pytest passing for ingestion (11 tests), retrieval (15 tests), API (16 tests), flow (4 tests).

## Phase 2: GEMINI RAG SYSTEM

**Note:** We are using Gemini API for RAG functionality, with heavy lifting on Gemini's end, as the local RAG system is taking too much time to build. This provides faster development and better scalability.

### Phase 2: Gemini Integration

- [x] **Gemini Service:** Created `GeminiService` class for document upload and question answering.
- [x] **Document Upload:** `upload_document()` method to upload files to Gemini API.
- [x] **Question Answering:** `ask_question()` method to query with document context.
- [x] **Tests:** Pytest passing for Gemini service (11 tests).
- [x] **API Endpoints:** `/gemini/upload` and `/gemini/ask` exposed via FastAPI (14 tests passing).
- [ ] **Prompt Templates:** Created templates for "Theory Explanation" and "Code Generation".

### Phase 3: Validation

- [ ] **Code Validator:** Python syntax checker for generated code.
- [ ] **Hallucination Check:** Basic keyword overlap check.

---

## 📂 Folder Structure Reference

ai-backend/
├── app/
├── rag/  
│ ├── ingestion/ # Chunking & Cleaning logic
│ ├── vector_store/ # ChromaDB Singleton
│ └── retriever/ # Search logic
├── generation/ # LLM & Prompts
└── api/ # FastAPI Routers
└── tests/ # Pytest folder
