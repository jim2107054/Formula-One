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

# System Architectures

eraser.io style code 
## frontend-architecture
```
title Frontend Architecture – Student-Centric Learning Platform
direction top

Users {
  Guest User [color: lightgray, icon: user]
  Registered Student [color: lightblue, icon: user-check]
}

Frontend Application {

  Landing & Auth [color: blue, icon: home, shape: circle]
  Login Page [color: blue, icon: log-in, shape: circle]
  Registration Page [color: blue, icon: user-plus, shape: circle]

  Student Dashboard [color: teal, icon: layout-dashboard, shape: circle]

  Core Learning Features {

    CMS Browser [color: green, icon: folder-open, shape: circle]
    Content Viewer [color: green, icon: file-text, shape: circle]

    Chat Interface [color: purple, icon: message-circle, shape: circle]
    Chat History Panel [color: purple, icon: clock, shape: circle]

    AI Generation Panel [color: pink, icon: sparkles, shape: circle]
    Generated Content Viewer [color: pink, icon: book-open, shape: circle]
  }

  Community Features (Phase 2) {

    Community Explorer [color: orange, icon: users, shape: circle]
    Community Page [color: orange, icon: layers, shape: circle]

    Community Feed [color: orange, icon: rss, shape: circle]
    Resource Sharing [color: orange, icon: share-2, shape: circle]

    Prompt & Result Reuse [color: orange, icon: repeat, shape: circle]
  }

  UI State & Services {

    Auth State Manager [color: gray, icon: shield, shape: circle]
    API Client [color: gray, icon: send, shape: circle]
    Notification System [color: gray, icon: bell, shape: circle]
  }
}

Backend API [color: darkblue, icon: server]

%% -------- User Flow --------

Guest User <> Landing & Auth: Visit Platform
Landing & Auth <> Login Page: Login
Landing & Auth <> Registration Page: Sign Up

Login Page <> Auth State Manager: Auth Token
Registration Page <> Auth State Manager: Create Account

Auth State Manager <> Student Dashboard: Authenticated Session

%% -------- Core Learning Flow --------

Student Dashboard <> CMS Browser: Browse Course Content
CMS Browser <> Content Viewer: Open Material

Student Dashboard <> Chat Interface: Ask Questions
Chat Interface <> Chat History Panel: Persist Conversation

Chat Interface <> AI Generation Panel: Generate Notes / Code
AI Generation Panel <> Generated Content Viewer: Display Output

%% -------- Community Flow (Phase 2) --------

Student Dashboard <> Community Explorer: Discover Communities
Community Explorer <> Community Page: Join / View Group

Community Page <> Community Feed: Discussions & Posts
Community Feed <> Resource Sharing: Share Files & Notes

Resource Sharing <> Prompt & Result Reuse: Reuse / Extend AI Results

%% -------- Backend Communication --------

API Client <> Backend API: REST / Streaming APIs

CMS Browser <> API Client
Chat Interface <> API Client
AI Generation Panel <> API Client
Community Features <> API Client

Notification System <> API Client: Status & Updates

```

## backend-architecture 
```
title Backend Architecture – AI-Powered Learning Platform
direction top

External Entities {
  Frontend UI [color: lightblue, icon: layout]
  AI Backend [color: orange, icon: cpu]
}

Backend System (Protected) {

  API Gateway [color: blue, icon: server, shape: circle]

  Auth & Access Control [color: green, icon: shield, shape: circle]

  CMS Service [color: teal, icon: folder, shape: circle]
  File Upload Service [color: teal, icon: upload, shape: circle]
  Metadata Manager [color: teal, icon: tag, shape: circle]

  Chat Orchestrator [color: purple, icon: message-square, shape: circle]
  Intent Classifier [color: purple, icon: compass, shape: circle]
  Context Manager [color: purple, icon: layers, shape: circle]
  AI Request Builder [color: purple, icon: send, shape: circle]
  AI Response Handler [color: purple, icon: check-circle, shape: circle]

  Data Stores (Restricted) {
    User & Role DB [color: green, icon: database, shape: cylinder]
    Content Metadata DB [color: teal, icon: database, shape: cylinder]
    Chat History DB [color: purple, icon: database, shape: cylinder]
    File Storage [color: gray, icon: hard-drive, shape: cylinder]
  }
}

%% -------- Data Flows --------

Frontend UI <> API Gateway: HTTP Requests / Responses

API Gateway <> Auth & Access Control: Auth & Role Validation
Auth & Access Control <> User & Role DB: User Credentials

API Gateway <> CMS Service: Content Management Requests
CMS Service <> File Upload Service: Upload Files
CMS Service <> Metadata Manager: Content Metadata
File Upload Service <> File Storage: Store / Retrieve Files
Metadata Manager <> Content Metadata DB: Save / Query Metadata

API Gateway <> Chat Orchestrator: Chat Requests
Chat Orchestrator <> Intent Classifier: Classify User Intent
Chat Orchestrator <> Context Manager: Build Conversation Context
Context Manager <> Chat History DB: Read / Write Context

Chat Orchestrator <> AI Request Builder: Structured AI Request
AI Request Builder <> AI Backend: Prompt + Context
AI Backend <> AI Response Handler: Generated & Validated Output

AI Response Handler <> Chat History DB: Persist Responses
API Gateway <> Frontend UI: Final Response

```

## ai-backend architecture
```
title AI Backend Architecture – RAG + Generation System
direction top

External Systems {
  Backend API [color: blue, icon: server]
  Evaluator Service [color: red, icon: check-circle]
}

AI Backend (Sandboxed) {

  Prompt Router [color: purple, icon: shuffle, shape: circle]

  RAG System [color: orange, icon: search] {
    Document Ingestor [color: orange, icon: upload, shape: circle]
    Chunking Engine [color: orange, icon: scissors, shape: circle]
    Embedding Generator [color: orange, icon: hash, shape: circle]
    Retriever [color: orange, icon: filter, shape: circle]
    Context Builder [color: orange, icon: layers, shape: circle]

    Vector Store (Restricted) {
      Theory Index [color: orange, icon: database, shape: cylinder]
      Lab Code Index [color: orange, icon: database, shape: cylinder]
    }
  }

  Generation System [color: pink, icon: sparkles] {
    Prompt Templates [color: pink, icon: file-text, shape: circle]
    Theory Generator [color: pink, icon: book-open, shape: circle]
    Lab Code Generator [color: pink, icon: code, shape: circle]
    Tool Controller [color: pink, icon: wrench, shape: circle]
  }

  Response Packager [color: teal, icon: package, shape: circle]
}

%% -------- Data Flows --------

Backend API <> Prompt Router: Task Request

Prompt Router <> RAG System: Context Request
Document Ingestor <> Chunking Engine: Raw Content
Chunking Engine <> Embedding Generator: Text Chunks
Embedding Generator <> Theory Index: Store Embeddings
Embedding Generator <> Lab Code Index: Store Embeddings

Prompt Router <> Retriever: Search Query
Retriever <> Theory Index: Semantic Search
Retriever <> Lab Code Index: Code Search
Retriever <> Context Builder: Retrieved Chunks

Context Builder <> Generation System: Grounded Context

Prompt Router <> Generation System: Generation Command
Prompt Templates <> Theory Generator: Structured Prompt
Prompt Templates <> Lab Code Generator: Code Prompt

Theory Generator <> Tool Controller: Controlled Generation
Lab Code Generator <> Tool Controller: Controlled Generation

Generation System <> Response Packager: Generated Content
Response Packager <> Evaluator Service: Output for Validation
Evaluator Service <> Backend API: Validation Result

```