
# AI Backend

FastAPI + Python backend for AI-powered features.

## Purpose

Sandboxed and stateless AI service responsible for:

- RAG-based retrieval over course materials
- Theory and lab code generation
- Prompt templates and controlled tools
- Mandatory validation (code syntax, grounding, rule-based checks)

## Current Implementation Status

✅ **Implemented:**

- FastAPI application bootstrap
- Health check endpoint (`/health`)
- Root endpoint (`/`)
- Empty routers:
  - RAG router (`/rag`)
  - Generation router (`/generation`)
  - Validation router (`/validation`)
- Pytest test suite for all endpoints
- CORS middleware configuration

🚧 **Not Yet Implemented:**

- LLM integration
- Vector database
- RAG pipeline
- Content generation logic
- Validation logic

## Setup

1. Create and activate virtual environment:

```bash
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run the development server:

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

4. Access the API:

- Interactive API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health
- Alternative docs: http://localhost:8000/redoc

## Testing

Run all tests:

```bash
pytest
```

Run with verbose output:

```bash
pytest -v
```

Run specific test file:

```bash
pytest tests/test_main.py -v
```

## API Endpoints

### Health Check

- **GET** `/health` - Service health status

### Root

- **GET** `/` - API information

### RAG (Placeholder)

- **GET** `/rag/` - RAG service information

### Generation (Placeholder)

- **GET** `/generation/` - Generation service information

### Validation (Placeholder)

- **GET** `/validation/` - Validation service information

## Architecture

This service is sandboxed and stateless. It receives requests from the backend service only and returns structured results with validation.

**Core Principle:** Frontend NEVER calls this service directly - all requests flow through the Node.js backend.
