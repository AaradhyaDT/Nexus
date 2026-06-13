# Nexus — Master Task Plan v2
*Synthesized from all Plan/* docs · June 13, 2026*

---

## Architecture (Locked)

```
React (Vite)          localhost:5173
      │ REST
      ▼
FastAPI               localhost:8000
      │
      ├── SQLite       nexus.db
      │   ├── projects  (id, name, g_index, g_email, prompt)
      │   ├── history   (id, project_id, prompt, responses, models_used, timestamp)
      │   └── FTS5      (project_notes_fts — auto context injection on /query)
      │
      └── Model Router
            ├── Groq · llama-3.3-70b-versatile    [live ✅]
            └── Gemini · gemini-2.5-flash          [live ✅]
```

**No PostgreSQL. No ChromaDB. No OAuth. No Redis.**  
Single `nexus.db` file. Multi-key rotation. `contextmanager` DB pattern.

---

## Completion Legend

| Symbol | Meaning |
|---|---|
| ✅ | Done and verified |
| 🔲 | Done, not DB/end-to-end verified |
| ⬜ | Not started |

---

## Phase 1 — Local Backbone & MVP (Days 1–2)

### T1 · Repo scaffold ✅
- `backend/` + `frontend/` directories
- `README.md`, `LICENSE` (MIT), `.gitignore`
- `start-nexus.bat` launcher

### T2 · Backend skeleton ✅
- FastAPI + CORS (`allow_origins=["*"]`)
- Pydantic request models (`QueryRequest`, `ProjectCreate`, `NoteCreate`)
- `.env` loading via `python-dotenv`
- `requirements.txt`: `fastapi`, `uvicorn[standard]`, `httpx`, `python-dotenv`

### T3 · SQLite DB init ✅
- `init_db()` on lifespan startup
- `projects` table with `g_index`, `g_email`, `prompt`
- `history` table with `responses` (JSON string), `models_used` (JSON array)
- `project_notes_fts` virtual FTS5 table (graceful fallback if FTS5 unavailable)
- Auto-seeds `Default` project on first boot

### T4 · Model adapters ✅
- `call_groq()` — Groq OpenAI-compat endpoint, `llama-3.3-70b-versatile`
- `call_gemini()` — Google Generative Language API, `gemini-2.5-flash`
- `MODEL_ADAPTERS` registry dict for dynamic dispatch
- Robust Gemini response parser (handles multiple response shapes)

### T5 · Key rotation ✅
- `GROQ_API_KEYS=key1,key2,...` in `.env`
- `GEMINI_API_KEYS=key1,key2,...` in `.env`
- `with_rotation()` iterates on 429/401/403, raises after all exhausted

### T6 · `/query` route ✅
- Accepts `{prompt, project_id, models[]}`
- Fetches project system prompt from DB
- Runs `fts_context()` to prepend relevant notes
- `asyncio.gather()` parallel fan-out to selected adapters
- Persists result to `history` table

### T7 · Route completeness ✅
- `GET /models`
- `GET /projects`
- `POST /projects`
- `GET /projects/{id}/messages`
- `POST /query`
- `POST /notes`
- `DELETE /projects/{project_id}/history`

### T8 · Frontend MVP ✅
- Project sidebar (create/switch, `g_email` display)
- Model selection pills (Groq + Gemini, dynamic from `/models`)
- Textarea + Ctrl+Enter send
- Side-by-side results grid (dynamic column count via `--cols` CSS var)
- History panel (collapse/expand, click-to-load)
- Clear history button
- Dark/light theme toggle (`localStorage` persistence)
- Google account links (Gmail/Drive/Calendar via `g_index`)
- Loading dots animation
- Error display

---

## Phase 2 — Validation (Day 3 — Current)

### T9 · Gemini endpoint validation ✅
- `gemini-2.5-flash` confirmed responding with configured keys
- Response parser confirmed against live shape

### T10 · History deletion DB verification 🔲
- Backend route `DELETE /projects/{id}/history` exists
- UI calls it and resets state
- **Pending:** confirm `history` table row count drops to 0 after clear

  ```sql
  -- Run in sqlite3 nexus.db after clearing history for project 1
  SELECT COUNT(*) FROM history WHERE project_id = 1;
  -- Expected: 0
  ```

### T11 · `start-nexus.bat` cold launch 🔲
- Path: `..\.venv\Scripts\activate` (relative to `backend/`)
- **Pending:** confirm end-to-end cold start from `.bat` (not just manual `uvicorn`)
- **Pending:** confirm frontend HMR doesn't conflict with backend restart

### T12 · Theme persistence 🔲
- `localStorage.setItem("theme", ...)` implemented
- **Pending:** confirm reload preserves theme (dark vs light)

---

## Phase 3 — v0.5 Features (Days 4–6)

### T13 · Project notes UI ⬜
The FTS5 table and `POST /notes` backend route already exist. This is frontend-only.

- Add a "Notes" panel below the history section (collapsible)
- Textarea + "Save note" button → `POST /notes` with `{project_id, content}`
- Notes saved are silently injected into system prompt on next `/query` (already wired)
- Display saved notes count in sidebar per project (optional)

  ```jsx
  // New state
  const [note, setNote] = useState("")
  const [noteSaved, setNoteSaved] = useState(false)

  async function saveNote() {
    await fetch(`${API}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: active.id, content: note })
    })
    setNote("")
    setNoteSaved(true)
    setTimeout(() => setNoteSaved(false), 2000)
  }
  ```

### T14 · Project system prompt editor ⬜
Each project has a `prompt` column (default: `"You are a helpful expert assistant."`). Expose it in the UI.

- Add "Settings" or gear icon per project in the sidebar
- Inline editable textarea for project system prompt
- `PATCH /projects/{id}` backend route:

  ```python
  class ProjectUpdate(BaseModel):
      prompt: str | None = None
      g_index: int | None = None
      g_email: str | None = None

  @app.patch("/projects/{project_id}")
  def update_project(project_id: int, p: ProjectUpdate):
      fields, vals = [], []
      if p.prompt is not None: fields.append("prompt=?"); vals.append(p.prompt)
      if p.g_index is not None: fields.append("g_index=?"); vals.append(p.g_index)
      if p.g_email is not None: fields.append("g_email=?"); vals.append(p.g_email)
      if not fields:
          raise HTTPException(400, "Nothing to update")
      vals.append(project_id)
      with get_db() as conn:
          conn.execute(f"UPDATE projects SET {', '.join(fields)} WHERE id=?", vals)
      return {"status": "updated"}
  ```

### T15 · Cost / token tracker ⬜
Groq and Gemini both return usage metadata in their responses. Capture it.

**Backend:**
- Add `tokens_in INTEGER`, `tokens_out INTEGER` columns to `history`:

  ```sql
  ALTER TABLE history ADD COLUMN tokens_in INTEGER DEFAULT 0;
  ALTER TABLE history ADD COLUMN tokens_out INTEGER DEFAULT 0;
  ```

- Extract from Groq response: `usage.prompt_tokens`, `usage.completion_tokens`
- Extract from Gemini response: `usageMetadata.promptTokenCount`, `usageMetadata.candidatesTokenCount`
- Store per model in responses JSON or as separate aggregate columns

**Frontend:**
- Per-session token count displayed in col header (e.g. `↑ 142 / ↓ 388`)
- Per-project cumulative total in sidebar tooltip

### T16 · In-project message search ⬜
FTS5 is already on `project_notes_fts`. Add a simple search over `history.prompt`.

- Backend: `GET /projects/{id}/search?q=keyword`

  ```python
  @app.get("/projects/{project_id}/search")
  def search_history(project_id: int, q: str):
      with get_db() as conn:
          rows = conn.execute(
              "SELECT id, prompt, responses, timestamp FROM history "
              "WHERE project_id=? AND prompt LIKE ? ORDER BY timestamp DESC LIMIT 20",
              (project_id, f"%{q}%")
          ).fetchall()
      return [{"id": r["id"], "prompt": r["prompt"],
               "responses": json.loads(r["responses"]),
               "timestamp": r["timestamp"]} for r in rows]
  ```

- Frontend: search input above history list, debounced 300ms

### T17 · Export project history as Markdown ⬜
- Backend: `GET /projects/{id}/export` returns rendered Markdown string
- Frontend: "Export ↓" button → triggers download as `{project_name}_{date}.md`

  ```python
  @app.get("/projects/{project_id}/export")
  def export_history(project_id: int):
      with get_db() as conn:
          proj = conn.execute("SELECT name FROM projects WHERE id=?", (project_id,)).fetchone()
          rows = conn.execute(
              "SELECT prompt, responses, timestamp FROM history "
              "WHERE project_id=? ORDER BY timestamp ASC", (project_id,)
          ).fetchall()
      lines = [f"# {proj['name']} — Export\n"]
      for r in rows:
          lines.append(f"## {r['timestamp']}\n**Prompt:** {r['prompt']}\n")
          for model, text in json.loads(r['responses']).items():
              lines.append(f"### {model}\n{text}\n")
      return {"markdown": "\n".join(lines)}
  ```

  ```jsx
  // Frontend download
  async function exportHistory() {
    const r = await fetch(`${API}/projects/${active.id}/export`)
    const { markdown } = await r.json()
    const blob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `${active.name}_export.md`; a.click()
  }
  ```

### T18 · Toast / success notifications ⬜
Currently silent on history clear, note save, project create.

- Lightweight toast state: `{message, type}` with auto-dismiss (2s)
- No library — pure CSS + React state

  ```jsx
  const [toast, setToast] = useState(null)
  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }
  // Usage: showToast("History cleared")
  ```

---

## Phase 4 — v1.0 Features (Days 7–10)

### T19 · Ollama local model adapter ⬜
Already planned in Day 2 but deferred. DeepSeek R1 7B is running on Arc iGPU via ipex-llm.

  ```python
  OLLAMA_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
  OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "deepseek-r1:7b")

  async def call_ollama(prompt: str, system: str, client: httpx.AsyncClient) -> str:
      try:
          r = await client.post(
              f"{OLLAMA_URL}/api/generate",
              json={"model": OLLAMA_MODEL, "prompt": f"{system}\n\n{prompt}", "stream": False},
              timeout=60
          )
          r.raise_for_status()
          return r.json()["response"]
      except Exception as e:
          return f"[Ollama offline — {e}]"
  ```

- Register in `MODEL_ADAPTERS`
- Add `OLLAMA_MODEL` pill to frontend (grayed when offline)
- `GET /models` should return health flag: `{"id": "ollama", "online": bool}`

### T20 · Task-aware routing ⬜
Rule-based router: classify prompt → assign best model.

  ```python
  def route_prompt(prompt: str) -> list[str]:
      p = prompt.lower()
      if any(w in p for w in ["code", "function", "debug", "script", "implement"]):
          return ["groq"]  # Llama faster for code
      if any(w in p for w in ["summarize", "explain", "compare", "write"]):
          return ["gemini"]  # Gemini better for long-form
      return ["groq", "gemini"]  # default fan-out
  ```

- Expose as `POST /route` → returns suggested model list
- Frontend: "Auto" mode pill; when active, overrides manual selection with router output

### T21 · Project deletion ⬜
- Backend: `DELETE /projects/{id}` (cascades to history via `ON DELETE CASCADE` — already in schema intent, verify in SQLite)
- Frontend: right-click or long-press context menu on project → "Delete" with confirmation dialog

### T22 · Project rename ⬜
- Uses T14's `PATCH /projects/{id}` route
- Frontend: double-click project name in sidebar → inline edit

### T23 · Agent mode skeleton ⬜
Multi-turn within a session: model response feeds back as context for next turn.

- Add `conversation_id` to `history` (UUID, groups turns)
- Frontend: toggle "Agent mode" — sends full conversation history to model, not just single prompt
- Backend: `GET /projects/{id}/conversation/{conv_id}` reconstructs ordered turns

### T24 · MCP integration consideration ⬜
- Claude-side tooling only (Gemini/Groq don't speak MCP natively)
- Use case: when `groq`/`gemini` is deselected and Claude API is added as adapter, MCP tools become available
- Deferred until Claude adapter added to `MODEL_ADAPTERS`

---

## Deferred / Out of Scope

| Item | Reason |
|---|---|
| PostgreSQL | Replaced by SQLite — no re-introduction |
| ChromaDB | Replaced by FTS5 — zero embedding latency is preferred |
| OAuth token storage | Replaced by `g_index` direct routing |
| Knowledge graph (NetworkX / Neo4j) | v2+ only if relationship queries needed |
| GitHub integration | v2+ |
| Claude API adapter | Possible future addition — adds MCP compatibility |

---

## Verification Checklist (Before Phase 3 → Phase 4)

- [ ] `start-nexus.bat` cold launches both servers cleanly
- [ ] `SELECT COUNT(*) FROM history WHERE project_id=?` returns 0 after UI clear
- [ ] Theme (dark/light) persists across hard reload
- [ ] Groq key rotation tested: first key 429 → second key succeeds silently
- [ ] Gemini key rotation tested similarly
- [ ] Creating 3+ projects and switching between them loads correct history

---

## 8-Week Nightly Build Tracker

| Week | Focus | Status |
|---|---|---|
| W1 | Repo scaffold + backend skeleton + model adapters | ✅ |
| W2 | SQLite DB + routes + `/query` fan-out | ✅ |
| W3 | React frontend + workspace UI + model pills | ✅ |
| W4 | Dark/light theme + history panel + clear + Google routing | ✅ |
| W5 | Phase 3 verification + T13 notes UI + T14 prompt editor | ⬜ |
| W6 | T15 token tracker + T16 search + T17 export + T18 toasts | ⬜ |
| W7 | T19 Ollama + T20 task router + T21/T22 project CRUD | ⬜ |
| W8 | T23 agent mode skeleton + polish + demo video + writeup | ⬜ |

---

## Files of Record

| File | Purpose |
|---|---|
| `Plan/Nexus_MasterPlan_v2.md` | **This document — canonical plan** |
| `Plan/Claude_Nexus_Session.md` | Day 1 architecture decisions (archived) |
| `Plan/nexus_v2_workspace_blueprint.md` | SQLite pivot rationale (archived) |
| `backend/main.py` | Single-file FastAPI backend |
| `backend/nexus.db` | SQLite database (gitignored) |
| `frontend/src/App.jsx` | React app |
| `frontend/src/style.css` | Dark editorial CSS |
| `start-nexus.bat` | One-click launcher |

---

## Strategic Note

Nexus is PrakopNet's (HimalGuard) development infrastructure. The project notes + FTS5 context layer is the same architecture needed for sensor logs, LSTM experiment records, and literature references. Building Nexus nightly **is** building PrakopNet's dev environment.

---

*Master profile ref: AARADHYA_MASTER_v95 · Repo: github.com/AaradhyaDT/nexus*
