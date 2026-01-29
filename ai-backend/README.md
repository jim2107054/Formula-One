# Formula One AI Backend

FastAPI + Python backend for AI-powered features.

## Purpose

Sandboxed and stateless AI service responsible for:
- RAG-based retrieval over course materials
- Theory and lab code generation
- Prompt templates and controlled tools
- Mandatory validation (code syntax, grounding, rule-based checks)

## Features

- ✅ **Health Check API**: Service health and readiness monitoring
- ✅ **RAG Router**: Document retrieval and context augmentation (placeholder)
- ✅ **Generation Router**: Theory and lab code generation (placeholder)
- ✅ **Validation Router**: Code validation, grounding checks, and rubric evaluation (placeholder)
- ✅ **CORS Configured**: Ready for backend service communication
- ✅ **Comprehensive Testing**: Full pytest test suite

## Tech Stack

- **Framework**: FastAPI 0.109.0
- **Server**: Uvicorn with auto-reload
- **Validation**: Pydantic 2.5.3
- **Testing**: Pytest with coverage
- **Python**: 3.10+

## Project Structure

```
ai-backend/
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration and settings
│   ├── api/                 # API routers
│   │   ├── health.py        # Health check endpoints ✅
│   │   ├── rag.py           # RAG endpoints (placeholder)
│   │   ├── generation.py    # Generation endpoints (placeholder)
│   │   └── validation.py    # Validation endpoints (placeholder)
│   ├── generation/          # Generation logic (future)
│   ├── rag/                 # RAG logic (future)
│   └── validation/          # Validation logic (future)
├── tests/
│   ├── conftest.py          # Pytest configuration
│   ├── test_health.py       # Health endpoint tests ✅
│   ├── test_rag.py          # RAG endpoint tests ✅
│   ├── test_generation.py   # Generation endpoint tests ✅
│   └── test_validation.py   # Validation endpoint tests ✅
├── .env.example             # Environment variables template
├── requirements.txt         # Python dependencies
├── pyproject.toml          # Pytest configuration
└── run.py                  # Development server script
```

## Quick Start

### 1. Setup Virtual Environment

```bash
cd ai-backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env if needed (default values work for development)
```

### 4. Run Development Server

```bash
# Using run script
python run.py

# Or using uvicorn directly
uvicorn app.main:app --reload --port 8001
```

The service will be available at:
- **API**: http://localhost:8001
- **Docs**: http://localhost:8001/api/v1/docs
- **ReDoc**: http://localhost:8001/api/v1/redoc

## API Endpoints

### Health Endpoints ✅

- `GET /api/v1/health` - Health check
- `GET /api/v1/health/ready` - Readiness check

### RAG Endpoints (Placeholder)

- `POST /api/v1/rag/retrieve` - Retrieve documents
- `GET /api/v1/rag/status` - RAG system status

### Generation Endpoints (Placeholder)

- `POST /api/v1/generation/generate` - Generate content
- `GET /api/v1/generation/status` - Generation system status

### Validation Endpoints (Placeholder)

- `POST /api/v1/validation/validate` - Validate content
- `GET /api/v1/validation/status` - Validation system status

## Testing

### Run All Tests

```bash
pytest
```

### Run with Coverage

```bash
pytest --cov=app --cov-report=html
```

### Run Specific Test File

```bash
pytest tests/test_health.py -v
```

## Communication with Backend Service

The AI backend is configured to accept requests from the main backend service (port 3000) via CORS.

### From Backend (TypeScript)

```typescript
// Example: Call AI backend from the main backend service
const response = await fetch('http://localhost:8001/api/v1/rag/retrieve', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'User query here',
    top_k: 5
  })
});

const data = await response.json();
```

### Configuration

The AI backend accepts requests from these origins (configurable in `.env`):
- `http://localhost:3000` - Backend service
- `http://localhost:3001` - Frontend
- `http://localhost:8001` - Self (for testing)

## Environment Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_NAME` | "Formula One AI Backend" | Application name |
| `APP_VERSION` | "0.1.0" | Application version |
| `API_PREFIX` | "/api/v1" | API route prefix |
| `HOST` | "0.0.0.0" | Server host |
| `PORT` | 8001 | Server port |
| `DEBUG` | True | Debug mode (auto-reload) |
| `CORS_ORIGINS` | "http://localhost:3000,..." | Allowed CORS origins |
| `ENVIRONMENT` | "development" | Environment name |

## Development Workflow

1. **Make changes** to code in `app/` directory
2. **Server auto-reloads** (if debug=True)
3. **Run tests** to verify changes: `pytest`
4. **Check coverage**: `pytest --cov=app`

## Next Implementation Steps

The following components are ready for implementation:

### 1. RAG System
- [ ] Vector store integration (Pinecone/Weaviate/ChromaDB)
- [ ] Document embeddings (OpenAI/Cohere)
- [ ] Chunking strategies
- [ ] Retrieval logic

### 2. Generation System
- [ ] LLM integration (OpenAI/Anthropic/Azure)
- [ ] Prompt templates
- [ ] Theory generation
- [ ] Lab code generation

### 3. Validation System
- [ ] Code syntax validation
- [ ] Grounding verification
- [ ] Rubric-based evaluation

## Architecture

This service is sandboxed and stateless. It receives requests from the backend service only and returns structured results with validation.

```
Backend (Node.js:3000) ─── HTTP ──→ AI Backend (FastAPI:8001)
                                         │
                                         ├─→ RAG System
                                         ├─→ Generation System
                                         └─→ Validation System
```

