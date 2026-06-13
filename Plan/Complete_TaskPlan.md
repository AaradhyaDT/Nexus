# Nexus Complete Task Plan
*Date: June 13, 2026*

---

## Project Summary
Nexus is a local AI workflow hub designed to route one prompt through multiple large-model backends, provide project-scoped history, and surface parallel model outputs in a unified UI.

Current stack:
- Frontend: React + Vite
- Backend: FastAPI + SQLite
- Model adapters: Groq + Gemini (and optional future adapters)
- Local app launcher: `start-nexus.bat`

Core MVP value:
- project-centric workspace switching
- parallel multi-model prompt comparison
- persistent history and project notes
- lightweight local deploy on localhost

---

## Architecture

### Local architecture
- `frontend/` hosts the React app on `localhost:5173`
- `backend/` hosts FastAPI on `localhost:8000`
- `backend/nexus.db` stores projects, history, and FTS notes
- `start-nexus.bat` launches backend and frontend together

### Model routing
- Groq via OpenAI-compatible endpoint
- Gemini via Google Generative Language API
- Parallel fan-out using `asyncio.gather`

### Storage model
- `projects` table holds workspaces with `g_index`, `g_email`, and project prompt
- `history` table stores prompt/responses/responses metadata by project
- `project_notes_fts` uses SQLite FTS5 for note search

---

## MVP Scope

### Included
- Project create/switch UI
- Multi-model chat with Groq and Gemini
- Side-by-side result display
- Persistent SQLite-backed history
- Dark/light UI toggle
- Clear history button
- Local startup via batch script

### Deferred / v2
- PostgreSQL / ChromaDB
- Ollama / additional model adapters
- Agents / MCP integration
- GitHub integration
- Knowledge graph
- Search/export flows

---

## Task Plan

### Phase 1 — Local backbone and MVP launch

T1. Repo scaffold
- [x] `backend/` + `frontend/` directories
- [x] `README.md`, `LICENSE`, `.gitignore`
- [x] `start-nexus.bat` launcher

T2. Backend skeleton
- [x] FastAPI app with CORS
- [x] Pydantic request models
- [x] `.env` loading via `python-dotenv`
- [x] `requirements.txt` with `fastapi`, `uvicorn`, `httpx`, `python-dotenv`
- [x] SQLite DB bootstrap and schema init

T3. Model adapters
- [x] `call_groq()` using `llama-3.3-70b-versatile`
- [x] `call_gemini()` using Google Generative Language
- [x] key rotation across multiple API keys
- [x] robust Gemini response parsing

T4. Query route
- [x] `/query` fans out to selected adapters
- [x] results returned as JSON keyed by model
- [x] history persisted after query

T5. Frontend MVP
- [x] textarea + send button
- [x] model selection pills
- [x] results grid with dynamic columns
- [x] sidebar project list
- [x] history panel with load behavior
- [x] theme toggle
- [x] clear history action

### Phase 2 — Persistence & workspace polish

T6. Project workspace layer
- [x] project list loading from backend
- [x] create project flow
- [x] active project switch
- [x] workspace-specific history retrieval

T7. History deletion
- [x] backend `DELETE /projects/{project_id}/history`
- [x] frontend clear history calls backend and resets UI

T8. Frontend theming
- [x] light/dark mode toggle
- [x] theme persistence with `localStorage`
- [x] style updates for both themes

### Phase 3 — Validation and open issues

T9. Gemini endpoint validation
- [ ] confirm Gemini endpoint model/key combination works reliably
- [ ] confirm API permission/endpoint selection for `gemini-2.5-flash`

T10. History persistence validation
- [ ] verify deletion removes records from SQLite `history`
- [ ] confirm history load matches active project

T11. Startup validation
- [ ] confirm `start-nexus.bat` launches backend and frontend
- [ ] confirm backend starts without path errors
- [ ] confirm frontend runs on `localhost:5173`

---

## Current Status

### Completed
- backend `.venv` path fix in `start-nexus.bat`
- dark/light theme toggle
- clear history button and backend delete endpoint
- Gemini payload restructuring and response parsing
- frontend history state and model selection behavior

### Pending
- Gemini live API validation with configured keys
- persistent deletion verification in SQLite
- final `start-nexus.bat` end-to-end launch test

---

## Verification Checklist

- [ ] `backend/main.py` starts cleanly with `uvicorn main:app --reload`
- [ ] `frontend` loads in browser and displays UI
- [ ] send prompt successfully returns Groq + Gemini results
- [ ] clear history removes records for the active project
- [ ] light/dark toggle persists after reload
- [ ] API key rotation handles 429/401/403 failures gracefully

---

## Risks and Mitigations

- **Gemini endpoint mismatch** — keep `generateContent` payload shape and add parser fallback
- **Credential scope issue** — if UNIMPLEMENTED persists, the key may not support the selected model
- **Frontend/backed startup mismatch** — use `start-nexus.bat` plus direct startup commands for debugging
- **History inconsistency** — validate both UI state and SQLite row counts

---

## Next Actions
1. Run and verify the Gemini adapter with valid keys; adjust endpoint if necessary.
2. Test the backend delete history route against the SQLite database.
3. Add a small UI notification for successful history deletion.
4. If stable, add Day 3 tasks for search, export, and project notes.

---

## Files of Record
- `Plan/Claude_Nexus_Session.md`
- `Plan/Nexus_Day1_TaskPlan.md`
- `Plan/Nexus_Day2_TaskPlan.md`
- `Plan/nexus_v2_workspace_blueprint.md`
- `Plan/TaskProgress.md`
- `backend/main.py`
- `frontend/src/App.jsx`
- `frontend/src/style.css`
- `start-nexus.bat`
