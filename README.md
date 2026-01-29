# AI-Powered Supplementary Learning Platform

This project is an AI-powered supplementary learning platform for university courses.
It organizes fragmented course materials, enables intelligent retrieval,
generates grounded learning content, and provides a conversational interface for students.

The system is designed as a modular monorepo with strict separation between:

- Frontend (UI)
- Backend (control plane)
- AI Backend (retrieval, generation, validation)

---

## 🏗 High-Level Architecture

Frontend → Backend (Node.js) → AI Backend (FastAPI) → Evaluator → Backend → Frontend

### Core Rules

- Frontend NEVER talks to AI services directly
- Backend is the single orchestration layer
- AI backend is sandboxed and stateless
- All AI outputs must be validated before returning to users

---

## 🧩 System Components

### Frontend (Next.js)

- Student-centric web UI
- AI chat interface
- CMS browsing & content viewing
- Phase-2 community features (groups, shared resources)

### Backend (Node.js / TypeScript)

- Authentication & authorization
- CMS APIs (upload, tag, browse)
- Chat orchestration & intent routing
- AI request construction and response handling
- Session & conversation persistence

### AI Backend (FastAPI / Python)

- RAG-based retrieval over course materials
- Theory and lab code generation
- Prompt templates and controlled tools
- Mandatory validation:
  - Code syntax & linting
  - Grounding against course content
  - Rule-based and rubric-based checks

---

## 🤖 AI Design Constraints

The AI backend must:

- Use retrieval-augmented generation (RAG)
- Separate theory and lab generation
- Never hallucinate unsupported content
- Return structured validation results

All prompts must be modular, testable, and stored as files.

---

## 👥 Team Development Model

This repository supports parallel development:

- `/frontend` → Frontend developer
- `/backend` → Backend developer (Node.js)
- `/ai-backend` → AI systems developer(s)

Shared schemas and contracts live in `/shared`.
No service should assume internal logic of another service.

---

## 🧪 Testing Strategy

- Frontend: UI & integration tests
- Backend: API & service-level tests
- AI backend:
  - RAG retrieval correctness tests
  - Prompt output validation tests
  - Code linting and execution tests

---

## 🚀 Development Workflow

1. Each service runs independently
2. APIs follow shared schemas
3. Docker Compose is used for local integration
4. Changes are merged via feature branches

See service-level README files for setup instructions.

# Github monorepo stcuture
Subject to change during project development if necessary. Ask before updating. 

ai-supplementary-learning-platform/
│
├── frontend/                         # Person 1 (Frontend)
│   ├── app/                          # Next.js App Router
│   ├── components/
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── chat/
│   │   ├── cms/
│   │   └── community/               # Phase 2
│   ├── services/                    # API client, auth helpers
│   ├── styles/
│   ├── tests/
│   ├── package.json
│   └── README.md
│
├── backend/                          # Person 2 (Node.js Backend)
│   ├── src/
│   │   ├── api/                      # Express/Nest routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── cms.routes.ts
│   │   │   ├── chat.routes.ts
│   │   │   └── health.routes.ts
│   │   ├── controllers/
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── cms.service.ts
│   │   │   └── chat-orchestrator.service.ts
│   │   ├── models/                  # ORM models
│   │   ├── middlewares/
│   │   ├── config/
│   │   └── app.ts
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── ai-backend/                       # Person 3 (AI / Python)
│   ├── app/
│   │   ├── api/                      # FastAPI routers
│   │   ├── rag/
│   │   │   ├── ingestion/
│   │   │   ├── chunking/
│   │   │   ├── embeddings/
│   │   │   ├── retriever/
│   │   │   └── vector_store/
│   │   ├── generation/
│   │   │   ├── prompts/
│   │   │   ├── theory_generator.py
│   │   │   ├── lab_code_generator.py
│   │   │   └── tool_controller.py
│   │   ├── validation/
│   │   │   ├── code_validator.py
│   │   │   ├── grounding_checker.py
│   │   │   └── rubric_evaluator.py
│   │   └── main.py
│   ├── tests/
│   ├── requirements.txt
│   └── README.md
│
├── shared/                           # Cross-service contracts
│   ├── schemas/                     # OpenAPI / JSON schema
│   ├── constants/
│   └── utils/
│
├── docs/                             # Architecture & design
│   ├── architecture-level-0.md
│   ├── backend-architecture.md
│   ├── ai-backend-architecture.md
│   ├── frontend-architecture.md
│   └── eraser-diagrams/
│
├── docker/
│   ├── docker-compose.yml
│   ├── frontend.Dockerfile
│   ├── backend.Dockerfile
│   └── ai-backend.Dockerfile
│
├── .env.example
├── .gitignore
└── README.md                         # MAIN README (below)
