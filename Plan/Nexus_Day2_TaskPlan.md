# Nexus Day 2 — Complete Task Plan
*Date: June 11, 2026*

---

## Scope

Three parallel tracks:
1. **Model layer** — Replace Claude API with Groq + keep Gemini + add Ollama; model selector UI
2. **Postgres layer** — DB schema, startup init, save every query
3. **Project layer** — Create/switch projects; history per project

---

## Files Changed

| File | Change Type |
|---|---|
| `backend/requirements.txt` | Add `asyncpg`, `databases[asyncpg]` |
| `backend/.env.example` | Add `GROQ_API_KEY`, update `DATABASE_URL` |
| `backend/main.py` | Full rewrite — adapters + DB + new routes |
| `frontend/src/App.jsx` | Full rewrite — project selector + model picker + history |
| `frontend/src/style.css` | Extend — sidebar, history panel, model checkboxes |

---

## DB Schema

```sql
CREATE TABLE IF NOT EXISTS projects (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
    id           SERIAL PRIMARY KEY,
    project_id   INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    prompt       TEXT NOT NULL,
    responses    JSONB NOT NULL,   -- {"groq": "...", "gemini": "...", "ollama": "..."}
    models_used  TEXT[] NOT NULL,  -- ["groq", "gemini"]
    created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

Seed: insert `Default` project on first startup if `projects` table is empty.

---

## API Routes

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/models` | Return list of available models with status (online/offline) |
| `GET` | `/projects` | List all projects (id, name, created_at) |
| `POST` | `/projects` | Create project — body: `{"name": "string"}` |
| `GET` | `/projects/{id}/messages` | Message history for a project |
| `POST` | `/query` | Fan-out query — body: `{prompt, project_id, models[]}` |

---

## Task Sequence

### T1 — `requirements.txt`
Add:
```
asyncpg
databases[asyncpg]
```

### T2 — `.env.example`
Add:
```
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AIza...
OLLAMA_BASE_URL=http://localhost:11434
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost/nexus
```

### T3 — `main.py` — Model Adapters
Three async functions:

**`call_groq(prompt, client)`**
- URL: `https://api.groq.com/openai/v1/chat/completions`
- Auth: `Bearer GROQ_API_KEY`
- Model: `llama-3.1-70b-versatile`
- Parse: `choices[0].message.content`

**`call_gemini(prompt, client)`**
- Existing — keep as-is (already `gemini-1.5-flash`)

**`call_ollama(prompt, client)`**
- URL: `http://localhost:11434/api/generate`
- Body: `{"model": "deepseek-r1:7b", "prompt": prompt, "stream": false}`
- Parse: `response` field
- Fail gracefully if Ollama not running (return `"[Ollama offline]"`)

Model registry dict:
```python
MODEL_REGISTRY = {
    "groq":   call_groq,
    "gemini": call_gemini,
    "ollama": call_ollama,
}
```

### T4 — `main.py` — DB Init
- On app startup (`@app.on_event("startup")`):
  - Connect to DB via `databases` library
  - `CREATE TABLE IF NOT EXISTS` for both tables
  - Insert `Default` project if zero projects exist

### T5 — `main.py` — Routes
- `GET /models` — return `["groq", "gemini", "ollama"]` with health flags
- `GET /projects` — `SELECT id, name, created_at FROM projects ORDER BY created_at DESC`
- `POST /projects` — insert, return new row
- `GET /projects/{id}/messages` — `SELECT * FROM messages WHERE project_id=$1 ORDER BY created_at DESC LIMIT 50`
- `POST /query` — fan-out only to selected models, `asyncio.gather`, save to `messages`, return `{responses, message_id}`

### T6 — `App.jsx` — State
New state vars:
```js
const [projects, setProjects]         = useState([])
const [activeProject, setActiveProject] = useState(null)
const [selectedModels, setSelectedModels] = useState(["groq", "gemini"])
const [history, setHistory]           = useState([])
const [newProjectName, setNewProjectName] = useState("")
```

### T7 — `App.jsx` — Project Sidebar
Left sidebar (240px):
- Header: "Projects" + "+" button
- Inline new-project input (shows on "+" click, hides on Enter/blur)
- Scrollable list of projects — click to switch
- Active project highlighted

On project switch: fetch `/projects/{id}/messages` → update `history`

### T8 — `App.jsx` — Model Selector
Horizontal checkbox row above textarea:
- `[ ] Groq`  `[ ] Gemini`  `[ ] Ollama`
- At least one must stay checked (disable unchecking last)
- Default: Groq + Gemini checked

### T9 — `App.jsx` — Results + History
**Results panel** (current query): dynamic columns, one per selected model (not hardcoded Claude/Gemini)

**History panel** (below results or toggle): past messages for active project
- Each row: truncated prompt + timestamp
- Click row → expand to see all model responses

### T10 — `style.css` — Layout
New layout: `display: grid; grid-template-columns: 240px 1fr`
- Left: project sidebar (dark bg, scrollable)
- Right: main panel (existing layout, extended)
- Model checkbox row styling
- History list item styling
- Active project highlight

---

## Done State (end of Day 2)

- [ ] Groq + Gemini + Ollama fan-out working
- [ ] Model selector controls which models fire
- [ ] Every query auto-saved to Postgres
- [ ] Projects create/switch working
- [ ] History loads on project switch
- [ ] `Default` project exists on first boot
- [ ] Ollama fails gracefully if offline

---

## Day 3 Preview
- Message search within project
- Cost/token tracker per model per project
- Export project history as markdown
