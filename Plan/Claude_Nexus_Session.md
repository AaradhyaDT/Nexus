# Claude Session — Nexus AI Workflow Hub

*June 10, 2026 — Aaradhya Dev Tamrakar*

---

## Session Summary

Two-session arc (ChatGPT ideation → Claude deep-dive + implementation start).

**Project confirmed:** `Nexus` — a project-centric AI operating system.  
**Repo name:** `nexus` (under primary GitHub: `AaradhyaDT`)  
**License:** MIT  
**Stack:** React (Vite) + FastAPI + PostgreSQL + ChromaDB

---

## Project Vision

Not a chatbot. A unified orchestration layer for an existing multi-model, multi-account, multi-tool AI workflow.

**Core concept:** One prompt → one project context → multiple model outputs → centralized memory.

**Differentiation from existing tools (Open WebUI, LibreChat, AnythingLLM):**  
None do *project-centric multi-model parallel routing with shared persistent context*. That gap is the value prop.

---

## Architecture Decision

**Local web app (localhost)** — not desktop app, not extension, not hosted.

```
React Frontend (localhost:5173)
        ↓ REST / WebSocket
FastAPI Backend (localhost:8000)
        ↓
┌──────────┬──────────┬─────────┐
│ Postgres │ ChromaDB │ Redis*  │
│ (meta,   │ (vector  │ (cache) │
│ history) │ memory)  │        │
└──────────┴──────────┴─────────┘
        ↓
   Model Router
Claude · Gemini · OpenAI · Ollama
```

*Redis optional — use in-memory dict for MVP.*

**MCP:** Integration layer for Claude-side tools, NOT the backbone. Gemini/OpenAI don't speak MCP natively.

**Knowledge graph:** ChromaDB + project-namespaced collections for MVP. NetworkX (in-memory → JSON) in v2 if relationship queries needed. Neo4j = overkill.

---

## Orchestration Patterns

**Pattern A — Parallel Fan-Out** (use for comparison/validation):

```python
async def fan_out(prompt, models=["claude", "gemini", "gpt"]):
    tasks = [call_model(m, prompt) for m in models]
    return await asyncio.gather(*tasks)
```

**Pattern B — Sequential Pipeline** (use for complex tasks):

```
Router → Model A (analysis) → Model B (implementation) → Model C (review)
```

Routing: rule-based (task_type → model) for MVP. LLM meta-router in v2.

---

## MVP Scope (8 weeks, nightly sessions)

| Feature | MVP |
|---|---|
| Project workspaces (create/switch) | ✅ |
| Multi-model chat (Claude + Gemini) | ✅ |
| Parallel fan-out, side-by-side results | ✅ |
| Persistent history (Postgres) | ✅ |
| Basic RAG on project notes (ChromaDB) | ✅ |
| GitHub integration | ❌ v2 |
| Agent mode / Aider integration | ❌ v2 |
| Study Mode | ❌ v2 |
| Knowledge graph | ❌ v2 |
| Automatic task routing | ❌ v2 |

**8-week breakdown:**

- W1–2: FastAPI + DB schema + model adapter layer
- W3–4: React frontend + workspace UI + multi-model chat
- W5–6: Parallel fan-out + ChromaDB RAG
- W7–8: Polish + demo video + writeup

---

## Day 1 Implementation (Tonight — Done ✅ / In Progress)

### Repo structure

```
nexus/
├── backend/
│   ├── main.py
│   ├── .env
│   └── venv/
├── frontend/
│   └── (Vite React)
├── README.md
└── LICENSE
```

### Backend skeleton (`backend/main.py`)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio, httpx, os
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY")
GEMINI_KEY = os.getenv("GEMINI_API_KEY")

class PromptRequest(BaseModel):
    prompt: str

async def call_claude(prompt: str, client: httpx.AsyncClient):
    r = await client.post(
        "https://api.anthropic.com/v1/messages",
        headers={"x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01"},
        json={"model": "claude-sonnet-4-20250514", "max_tokens": 1000,
              "messages": [{"role": "user", "content": prompt}]},
        timeout=30
    )
    return r.json()["content"][0]["text"]

async def call_gemini(prompt: str, client: httpx.AsyncClient):
    r = await client.post(
        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_KEY}",
        json={"contents": [{"parts": [{"text": prompt}]}]},
        timeout=30
    )
    return r.json()["candidates"][0]["content"]["parts"][0]["text"]

@app.post("/query")
async def query(req: PromptRequest):
    async with httpx.AsyncClient() as client:
        claude_out, gemini_out = await asyncio.gather(
            call_claude(req.prompt, client),
            call_gemini(req.prompt, client)
        )
    return {"claude": claude_out, "gemini": gemini_out}
```

### Frontend skeleton (`frontend/src/App.jsx`)

```jsx
import { useState } from "react"

export default function App() {
  const [prompt, setPrompt] = useState("")
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleQuery() {
    setLoading(true)
    const res = await fetch("http://localhost:8000/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    })
    setResults(await res.json())
    setLoading(false)
  }

  return (
    <div style={{ padding: 32, fontFamily: "sans-serif" }}>
      <h2>Nexus</h2>
      <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
        rows={4} style={{ width: "100%", fontSize: 16 }} />
      <br />
      <button onClick={handleQuery} disabled={loading}>
        {loading ? "Querying..." : "Ask both"}
      </button>
      {results && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 24 }}>
          <div><h3>Claude</h3><pre style={{ whiteSpace: "pre-wrap" }}>{results.claude}</pre></div>
          <div><h3>Gemini</h3><pre style={{ whiteSpace: "pre-wrap" }}>{results.gemini}</pre></div>
        </div>
      )}
    </div>
  )
}
```

### Day 1 done state

- `localhost:5173` → prompt → both models respond side-by-side in parallel
- Full stack end-to-end confirmed

---

## Next Session (Day 2) — Postgres Layer

1. `projects` table: `id, name, created_at`
2. `messages` table: `id, project_id, prompt, claude_response, gemini_response, timestamp`
3. Project selector dropdown in frontend
4. Auto-save every query to DB

---

## Risks to Watch

| Risk | Mitigation |
|---|---|
| API cost blowup from fan-out | Cost estimator + budget cap per project |
| Context window overflow in long sessions | Summarization layer — don't raw-append history |
| Scope creep | MVP scope frozen — nothing merges outside it |
| Completion gap (known pattern) | Treat each nightly session like a fellowship deadline |

---

## Portfolio Angle

To make Nexus impressive on CV/portfolio:

- Benchmark the router: show routing improves output quality vs. single-model
- Add SHAP/observability: log model chosen, why, outcome quality
- Publish technical writeup: "Multi-model orchestration layer with task-aware routing"
- Demo video: parallel outputs side-by-side is visually striking
- MCP integration: signals understanding of current agentic tool standard

---

## Strategic Note

Nexus is also Prakopnet's development infrastructure. The shared memory layer = same architecture needed for LSTM experiments, sensor logs, and literature references. Building Nexus *is* building PrakopNet's dev environment.

---

## Context Links

- Master Profile: `AARADHYA_MASTER_v88.md`
- Primary GitHub: `github.com/AaradhyaDT`
- Portfolio: `aaradhyadtmr.github.io` (Netlify + Decap CMS)
- Major Project: PrakopNet (LoRa mesh multi-hazard EWS, demo March 2027)
- Fellowship: Fusemachines AI Fellowship 2026 (Week 6+, ongoing)
