# Nexus

**A project-centric AI operating system.**

One prompt → multiple AI models in parallel → centralized memory. Replaces browser-tab juggling with a single local workspace.

---

## Architecture

```
React (Vite)          localhost:5173
      │ REST
      ▼
FastAPI               localhost:8000
      │
      ├── SQLite       nexus.db
      │   ├── projects  (workspace metadata, Google account index)
      │   ├── history   (all prompts + responses)
      │   └── FTS5      (project notes — auto-injected as context)
      │
      └── Model Router
            ├── Groq (Llama 3.3 70B)
            └── Gemini 1.5 Flash
```

No PostgreSQL. No ChromaDB. No OAuth token storage. Single `nexus.db` file.

---

## Features (v0.2)

- **Project workspaces** — create/switch projects; all history is project-scoped
- **Multi-model parallel fan-out** — Groq + Gemini respond simultaneously, displayed side-by-side
- **Persistent history** — every query auto-saved to SQLite; loads on project switch
- **Clear history** — frontend clear action deletes project history via backend endpoint
- **Dark/light theme toggle** — persisted in `localStorage` across reloads
- **FTS5 context injection** — save notes to a project; they're silently prepended as context when relevant
- **Google account routing** — each project maps to a Google account index (`/u/0`, `/u/1`); sidebar links open Gmail/Drive/Calendar for the right account directly
- **Multi-key rotation** — comma-separated key pools per model; auto-retries on 429/401

---

## Setup

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # Linux/Mac

pip install -r requirements.txt

cp .env.example .env
# Edit .env — add your GROQ_API_KEYS and GEMINI_API_KEYS

uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

### One-click start

From the repo root, run:

```bat
start-nexus.bat
```

This launches the backend, frontend, and opens the browser automatically.

### .env format

```env
GROQ_API_KEYS=gsk_key1,gsk_key2
GEMINI_API_KEYS=AIza_key1,AIza_key2
```

---

## API

| Method | Route | Purpose |
|---|---|---|
| GET | `/models` | Available model IDs |
| GET | `/projects` | All projects |
| POST | `/projects` | Create project |
| GET | `/projects/{id}/messages` | Message history |
| POST | `/query` | Fan-out prompt |
| POST | `/notes` | Add project note (FTS5-indexed) |

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite) |
| Backend | FastAPI + asyncio |
| Storage | SQLite (built-in) + FTS5 |
| HTTP client | httpx (async) |
| Config | python-dotenv |

---

## Google Account Routing

No OAuth. Each project stores a `g_index` (0, 1, 2…) matching your Chrome Google account order. The sidebar generates direct links:

```
g_index = 0 → https://mail.google.com/mail/u/0/
g_index = 1 → https://mail.google.com/mail/u/1/
```

Set `g_index` when creating a project. Your browser's existing sessions handle authentication.

---

## Roadmap

| Version | Focus |
|---|---|
| v0.2 | Current — SQLite + FTS5 + Google routing |
| v0.5 | Notes UI · project system prompt editor · cost/token tracker |
| v1.0 | Agent mode · Ollama · task-aware routing |

---

*Built by [Aaradhya Dev Tamrakar](https://github.com/AaradhyaDT)*
