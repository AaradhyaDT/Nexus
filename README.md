# Nexus

**A project-centric AI operating system.**

Nexus unifies multiple AI models, shared memory, and development tools into a single workspace — replacing the browser-switching, account-juggling, context-losing workflow that comes with using Claude, Gemini, and ChatGPT separately.

Not a chatbot. An orchestration layer.

---

## The Problem

Modern AI-assisted development means constantly context-switching:

- 3 different AI providers, each in a separate browser tab
- No shared memory between sessions or models
- Responses from Claude, Gemini, and ChatGPT live in separate silos
- Every new project starts from scratch

Nexus fixes this by giving every project a persistent workspace where all models share the same context.

---

## How It Works

```
You ask one question
        ↓
Nexus routes it to Claude + Gemini (+ others) in parallel
        ↓
Responses appear side-by-side
        ↓
Everything is saved to the project's memory
        ↓
Next session picks up exactly where you left off
```

---

## Features

### ✅ MVP (v0.1)
- **Project workspaces** — create and switch between projects; all history is project-scoped
- **Multi-model chat** — Claude and Gemini in one interface
- **Parallel fan-out** — one prompt, both models respond simultaneously, displayed side-by-side
- **Persistent history** — every query and response saved to PostgreSQL
- **Semantic memory** — ChromaDB RAG over project notes and past outputs

### 🔜 v0.5
- Task-aware router (auto-selects best model per task type)
- GitHub integration
- Knowledge graph
- Study Mode (syllabus → HTML study portal)

### 🔜 v1.0
- Full agent mode with MCP tool support
- Aider integration for multi-file code edits
- Local Ollama model support
- Shareable workspaces

---

## Architecture

```
React (Vite)          localhost:5173
      │
      │  REST / WebSocket
      ▼
FastAPI               localhost:8000
      │
      ├── PostgreSQL   (project metadata, message history)
      ├── ChromaDB     (vector memory, semantic search)
      └── Model Router
            ├── Claude API
            ├── Gemini API
            ├── OpenAI API
            └── Ollama (local)
```

## Local Setup

### Backend
1. `cd backend`
2. `python -m pip install -r requirements.txt`
3. Copy `backend/.env.example` to `backend/.env` and fill in `ANTHROPIC_API_KEY` and `GEMINI_API_KEY`
4. `uvicorn main:app --reload --host 0.0.0.0 --port 8000`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

The frontend sends prompts to `http://localhost:8000/query` and displays Claude and Gemini responses side-by-side.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite) |
| Backend | FastAPI + asyncio |
| Database | PostgreSQL |
| Vector DB | ChromaDB |
| HTTP client | httpx (async) |
| Config | python-dotenv |

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL running locally
- API keys for Claude and/or Gemini

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Add your API keys to .env

uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

### Environment Variables

```env
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...
DATABASE_URL=postgresql://user:password@localhost/nexus
```

---

## Project Structure

```
nexus/
├── backend/
│   ├── main.py          # FastAPI app, routes, model adapters
│   ├── models.py        # SQLAlchemy models
│   ├── memory.py        # ChromaDB integration
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── components/
│   └── package.json
├── docs/
│   └── architecture.md
├── README.md
└── LICENSE
```

---

## Roadmap

| Version | Focus |
|---|---|
| v0.1 | Parallel fan-out + persistent history + ChromaDB RAG |
| v0.5 | Task router + GitHub + knowledge graph + Study Mode |
| v1.0 | Agent mode + MCP tools + Ollama + shareable workspaces |

---

## License

MIT — see [LICENSE](LICENSE).

---

*Built by [Aaradhya Dev Tamrakar](https://github.com/AaradhyaDT)*