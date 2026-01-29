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

### Phase 3:  Generation Engine Architecture (Part 3)

## 🎯 Goal
[cite_start]Generate structured learning materials (Theory & Lab) grounded in the uploaded course content[cite: 30, 31, 37].
**Core Constraint:** All generation must prioritize uploaded documents. [cite_start]External tools (Wikipedia) are used only for definitions or when context is missing[cite: 26].

## 🧩 High-Level Flow

1.  **User Request:** "Explain Binary Search with slides."
2.  **Router:** Identifies intent -> `Theory` vs `Lab`.
3.  **Context Assembly:**
    * **Internal:** Existing uploaded files (already in Gemini's cache).
    * **External:** Fetch Wikipedia summary (if term is obscure).
4.  **Prompt Engineering:** Wrap user query in a strict System Prompt.
    * *Theory Prompt:* "You are a Professor. Output JSON for slides..."
    * *Lab Prompt:* "You are a Coding Tutor. Output Python code with comments..."
5.  **Generation:** Call Gemini 1.5 Flash.
6.  **Validation:** JSON parsing check (ensure output is valid JSON).

---

## 🛠 Component Design

### 1. External Context Tool (`app/generation/tools/wiki.py`)
* **Purpose:** Fetch definitions for concepts not fully covered in slides.
* **Implementation:** Use `wikipedia` python library.
* **Function:** `get_wiki_summary(topic: str) -> str`

### 2. Theory Generator (`app/generation/theory_generator.py`)
* **Endpoint:** `POST /generation/theory`
* **Input:** `topic`, `format` (notes | slides | pdf_content)
* **Logic:**
    * Constructs a prompt: *"Based on the uploaded files, generate [format] for [topic]. if the topic is not in the files, use this external context: [wiki_summary]."*
    * **Output Format:** Strict JSON or Markdown.
        * *Slides:* JSON Array `[{title: "...", bullets: [...]}]`
        * *Notes:* Markdown `# Title \n ## Section...`

### 3. Lab Generator (`app/generation/lab_code_generator.py`)
* **Endpoint:** `POST /generation/lab`
* **Input:** `topic`, `language` (default: python)
* **Logic:**
    * Constructs a prompt: *"Generate a lab exercise for [topic]. Include a problem statement, solution code, and line-by-line explanation."*
    * [cite_start]**Constraints:** Code must be syntactically correct[cite: 40].

---

## 🚀 Step-by-Step Implementation Plan

1.  **External Tool:** Implement the Wikipedia wrapper.
2.  **Theory Endpoint:** Create the prompt templates and API for generating Notes/Slides.
3.  **Lab Endpoint:** Create the prompt templates and API for generating Code.

### Phase 4: Validation

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
