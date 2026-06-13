# Nexus v2 — Workspace State & MVP Blueprint

This document serves as your file-based context anchor. Feed this file directly to any AI development agent to resume the project instantly without losing tokens on redundant explanation cycles.

---

## 🗒️ Session Markdown (Session Log)

### Project Status: Architecture Pivot
* **Current Phase:** Transitioning from an over-engineered distributed architecture to an ultra-lean, localized, token-efficient workspace paradigm.
* **Core Goal:** Minimize context drift and boilerplate code to keep development lightning-fast for single-operator AI workflows.

### Key Architectural Decisions
1. **Unified Storage Layer:** Eliminated PostgreSQL and ChromaDB. Replaced entirely with a single local SQLite database file (`nexus.db`). Relational workspace configurations and metadata live in standard tables, while semantic/historical log indexing is offloaded to a native SQLite-FTS5 (Full-Text Search) virtual table.
2. **Session Isolation:** Stripped out server-side Google OAuth token encryption, storage, and renewal layers. Replaced with browser-level **Index-Swapped Direct Session Routing**, mapping project workspaces directly to Google's multi-login path parameters (`/u/0`, `/u/1`, etc.).
3. **Backend Footprint:** Consolidated core multi-model orchestration logic into a single async FastAPI file (`main.py`) leveraging `httpx.AsyncClient` and `asyncio.gather` for concurrent model dispatching (Groq, Gemini).

### Current Code & Database State
* **Database Schema Layout:**
```sql
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    g_index INTEGER DEFAULT 0,
    g_email TEXT,
    prompt TEXT
);

CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    prompt TEXT,
    responses TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE VIRTUAL TABLE IF NOT EXISTS project_notes_fts USING fts5(
    project_id,
    content
);
```

---

## 🚀 Future Plan (8-Week MVP Roadmap)

This execution timeline keeps coding objectives isolated into tight, predictable modules to prevent structural feature creep.

### Phase 1: Local Backbone (Weeks 1-2)
* [ ] **Task 1.1:** Setup local file architecture footprint. Initialize a single-file FastAPI server (`main.py`) with complete environment variable parsing.
* [ ] **Task 1.2:** Write a clean SQLite bootstrapper script to verify and auto-provision schema tables on backend boot.
* [ ] **Task 1.3:** Test concurrency logic—execute sample HTTP requests triggering simultaneous backend calls across API routes to ensure JSON formatting matches expected workspace layouts.

### Phase 2: Front-End Foundation & Direct Routing (Weeks 3-4)
* [ ] **Task 2.1:** Scaffold an ultra-minimalist, sleek dark editorial user interface using Vite + React and Tailwind CSS.
* [ ] **Task 2.2:** Build out the workspace navigation selector. Integrate native browser routing to swap active Google Workspace account parameters dynamically (`/u/0`, `/u/1`) when switching between projects.
* [ ] **Task 2.3:** Bind text-input fields to the `/query` endpoint, displaying concurrent multi-model streams side-by-side in high-contrast view panels.

### Phase 3: Context Infusion & Keyword Indexing (Weeks 5-6)
* [ ] **Task 3.1:** Implement the project-specific engineering notebook UI. Save text snippets or logs directly into the `project_notes_fts` table.
* [ ] **Task 3.2:** Write the automated keyword-interception hook. Before dispatching prompts to LLMs, run a fast `MATCH` execution across local logs to append historical tracking text directly into hidden system prompts.

### Phase 4: Optimization, Hardening, & Handoff (Weeks 7-8)
* [ ] **Task 4.1:** Profile latency windows under heavy multi-model data payload generation.
* [ ] **Task 4.2:** Hardcode foundational system text rules into production parameters to prevent prompt fragmentation during long sessions.
* [ ] **Task 4.3:** Freeze the production baseline and run standard local instances for daily production use.

---

### Instructions for Next Development Session:
> Begin work strictly on **Phase 1 (Task 1.1 & 1.2)**. Keep your implementation self-contained within a centralized `backend/main.py` setup. Avoid adding complex model abstractions, keeping paths lean for maximum agent-readability.
