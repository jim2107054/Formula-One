# Formula One - AI-Powered Learning Platform

A comprehensive AI-powered supplementary learning platform for university courses. The system organizes fragmented course materials, enables intelligent retrieval, generates grounded learning content, and provides a conversational interface for students.

## Project Information

- **Project Name:** Formula One Learning Platform
- **Version:** 1.0.0
- **Production Branch:** main
- **Team:** Formula One Development Team
- **License:** MIT

---

## Quick Start

### Prerequisites

- Node.js (v18+)
- Python (v3.9+)
- npm or pnpm
- pip
- MongoDB (Atlas or local)

### Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/jim2107054/Formula-One.git
   cd Formula-One
   ```

2. Set up environment variables for each service (copy `.env.example` to `.env` in each folder)

### Running the Services

**Terminal 1 - AI Backend (Python/FastAPI):**
```bash
cd ai-backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```
Runs on: http://localhost:8001

**Terminal 2 - Backend (Node.js/Express):**
```bash
cd backend
npm install
npm run dev
```
Runs on: http://localhost:3000

**Terminal 3 - Frontend (Next.js):**
```bash
cd frontend
pnpm install
pnpm dev
```
Runs on: http://localhost:3001

---

## Architecture Overview

```
Frontend (Next.js) --> Backend (Node.js) --> AI Backend (FastAPI)
     |                      |                      |
     v                      v                      v
  User UI            Orchestration           AI Services
                     & Auth                  RAG, Generation
                     MongoDB                 Validation
```

### Data Flow

1. User interacts with Frontend
2. Frontend sends requests to Backend
3. Backend orchestrates and routes to AI Backend
4. AI Backend processes (RAG retrieval, content generation, validation)
5. Response flows back through Backend to Frontend

### Core Rules

- Frontend NEVER talks to AI services directly
- Backend is the single orchestration layer
- AI Backend is sandboxed and stateless
- All AI outputs are validated before returning to users

---

## Service Details

### Frontend (Next.js/React)

**Location:** `/frontend`

**Features:**
- Student-centric web UI
- AI chat interface with history
- CMS browsing and content viewing
- Authentication (login/register)
- Responsive design with Tailwind CSS

**Tech Stack:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Zustand (state management)
- React Query (data fetching)

**Key Endpoints Used:**
- `POST /api/ai/agent/ask` - Smart AI queries
- `GET /api/cms/*` - Content management
- `POST /api/auth/*` - Authentication

### Backend (Node.js/Express)

**Location:** `/backend`

**Features:**
- RESTful API server
- Authentication & authorization (JWT)
- CMS APIs (upload, tag, browse)
- Chat orchestration & session management
- AI Backend proxy layer

**Tech Stack:**
- Node.js
- Express.js
- TypeScript
- MongoDB/Mongoose
- JWT authentication

**API Routes:**

| Route | Description |
|-------|-------------|
| `/api/health` | Health check |
| `/api/auth` | Authentication (login, register) |
| `/api/cms` | Content management |
| `/api/chat` | Chat sessions |
| `/api/ai/*` | AI Backend proxy |
| `/api/users` | User management |
| `/api/categories` | Content categories |
| `/api/tags` | Content tagging |

**AI Proxy Routes:**

| Backend Route | AI Backend Route | Method |
|---------------|------------------|--------|
| `/api/ai/health` | `/health` | GET |
| `/api/ai/agent` | `/api/v1/agent/` | GET |
| `/api/ai/agent/upload` | `/api/v1/agent/upload` | POST |
| `/api/ai/agent/ask` | `/api/v1/agent/ask` | POST |
| `/api/ai/agent/classify` | `/api/v1/agent/classify` | POST |
| `/api/ai/agent/memory/status` | `/api/v1/agent/memory/status` | GET |
| `/api/ai/agent/memory/clear` | `/api/v1/agent/memory/clear` | DELETE |
| `/api/ai/gemini/upload` | `/api/v1/upload` | POST |
| `/api/ai/gemini/ask` | `/api/v1/ask` | POST |
| `/api/ai/gemini/files` | `/api/v1/files` | GET/DELETE |
| `/api/ai/generation` | `/api/v1/generation/` | GET |
| `/api/ai/generation/theory` | `/api/v1/generation/theory` | POST |
| `/api/ai/generation/lab` | `/api/v1/generation/lab` | POST |
| `/api/ai/validation/code` | `/api/v1/validation/code` | POST |

### AI Backend (Python/FastAPI)

**Location:** `/ai-backend`

**Features:**
- Smart Agent with intent classification
- RAG-based document retrieval (ChromaDB)
- Theory content generation (slides, notes, summary)
- Lab code generation (Python, JavaScript)
- Code validation with AI review
- Gemini API integration

**Tech Stack:**
- Python 3.9+
- FastAPI
- LangChain
- ChromaDB (vector store)
- Google Gemini API
- Pydantic

**API Endpoints:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/v1/agent/` | GET | Agent status |
| `/api/v1/agent/upload` | POST | Upload document to memory |
| `/api/v1/agent/ask` | POST | Smart query (auto-routes to theory/lab/chat) |
| `/api/v1/agent/classify` | POST | Classify intent only |
| `/api/v1/agent/memory/status` | GET | Memory status |
| `/api/v1/agent/memory/clear` | DELETE | Clear all memory |
| `/api/v1/upload` | POST | Upload to Gemini |
| `/api/v1/ask` | POST | Ask Gemini directly |
| `/api/v1/files` | GET/DELETE | List/clear Gemini files |
| `/api/v1/generation/theory` | POST | Generate theory content |
| `/api/v1/generation/lab` | POST | Generate lab exercise |
| `/api/v1/validation/code` | POST | Validate code |

---

## Environment Variables

### Backend (.env)
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/formula-one
JWT_SECRET=your-secret-key
AI_BACKEND_URL=http://localhost:8001
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_AI_BACKEND_URL=http://localhost:8001/api/v1
```

### AI Backend (.env)
```env
GEMINI_API_KEY=your-gemini-api-key
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=your-environment
```

---

## Project Structure

```
Formula-One/
|
|-- frontend/                 # Next.js Frontend
|   |-- src/
|   |   |-- app/              # App Router pages
|   |   |-- components/       # React components
|   |   |-- services/         # API services
|   |   |-- hooks/            # Custom hooks
|   |   |-- zustand/          # State management
|   |   |-- lib/              # Utilities
|   |-- public/               # Static assets
|   |-- package.json
|   |-- README.md
|
|-- backend/                  # Node.js Backend
|   |-- src/
|   |   |-- api/              # Express routes
|   |   |-- controllers/      # Request handlers
|   |   |-- services/         # Business logic
|   |   |-- models/           # MongoDB models
|   |   |-- middlewares/      # Express middlewares
|   |   |-- config/           # Configuration
|   |   |-- app.ts            # Main application
|   |-- tests/                # Test files
|   |-- package.json
|   |-- README.md
|
|-- ai-backend/               # Python AI Backend
|   |-- app/
|   |   |-- api/              # FastAPI routers
|   |   |-- rag/              # RAG components
|   |   |-- generation/       # Content generators
|   |   |-- validation/       # Code validators
|   |   |-- intelligence/     # Intent routing
|   |   |-- gemini_rag/       # Gemini service
|   |   |-- main.py           # FastAPI app
|   |-- tests/                # Test files
|   |-- requirements.txt
|   |-- README.md
|
|-- shared/                   # Shared schemas/contracts
|-- docs/                     # Documentation
|-- docker/                   # Docker configuration
|-- README.md                 # This file
```

---

## Development Workflow

### Branch Strategy

- `main` - Production branch (protected)
- `internal` - Development/staging branch
- `feature/*` - Feature branches

### Making Changes

1. Create a feature branch from `internal`
2. Make changes and test locally
3. Submit PR to `internal`
4. After review, merge to `internal`
5. Release to `main` when ready

### Running Tests

**Backend:**
```bash
cd backend
npm test
```

**AI Backend:**
```bash
cd ai-backend
pytest
```

**Frontend:**
```bash
cd frontend
pnpm test
```

---

## Docker Support

Run all services with Docker Compose:

```bash
cd docker
docker-compose up --build
```

Services will be available at:
- Frontend: http://localhost:3001
- Backend: http://localhost:3000
- AI Backend: http://localhost:8001

---

## API Testing

Import the Postman collection from `/ai-backend/postman_collection.json` for testing AI Backend endpoints.

### Example Requests

**Smart Ask (Theory):**
```bash
curl -X POST http://localhost:3000/api/ai/agent/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "Explain binary search algorithm with slides"}'
```

**Smart Ask (Lab):**
```bash
curl -X POST http://localhost:3000/api/ai/agent/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "Write Python code for bubble sort algorithm"}'
```

**Generate Theory:**
```bash
curl -X POST http://localhost:3000/api/ai/generation/theory \
  -H "Content-Type: application/json" \
  -d '{"topic": "Binary Search Trees", "type": "notes"}'
```

**Validate Code:**
```bash
curl -X POST http://localhost:3000/api/ai/validation/code \
  -H "Content-Type: application/json" \
  -d '{"code": "def hello():\n    print(\"Hello World\")"}'
```

---

## Team

| Role | Responsibility |
|------|----------------|
| Frontend Developer | `/frontend` - UI/UX, React components |
| Backend Developer | `/backend` - API, orchestration, auth |
| AI Developer | `/ai-backend` - RAG, generation, validation |

---

## License

MIT License - See LICENSE file for details.

---

## Support

For issues and questions, please open an issue on GitHub or contact the development team.
