# Nexus Day 1 — Task Plan
*Date: June 10–11, 2026*

---

## Goal
End-to-end working stack: one prompt → Groq + Gemini respond in parallel → displayed side-by-side.

---

## Files

| File | Purpose |
|---|---|
| `backend/main.py` | FastAPI app — model adapters + /query route |
| `backend/requirements.txt` | Python dependencies |
| `backend/.env` | API keys (gitignored) |
| `backend/.env.example` | Key template (committed) |
| `frontend/src/App.jsx` | React UI — textarea, button, results grid |
| `frontend/src/style.css` | Base styling |
| `frontend/src/main.jsx` | React entry point |
| `frontend/index.html` | HTML shell |
| `frontend/vite.config.js` | Vite config |
| `frontend/package.json` | Node dependencies |
| `start-nexus.bat` | One-click launcher (backend + frontend) |

---

## Tasks

### T1 — Repo scaffold ✅
- `nexus/` root with `backend/` and `frontend/` directories
- `README.md`, `LICENSE` (MIT), `.gitignore`
- `start-nexus.bat` — launches both servers + opens browser

### T2 — Backend skeleton ✅
- FastAPI app with CORS middleware (`allow_origins=["*"]`)
- `PromptRequest` Pydantic model
- `.env` loading via `python-dotenv`
- `requirements.txt`: `fastapi`, `uvicorn[standard]`, `httpx`, `python-dotenv`

### T3 — Model adapters ✅ (with fixes)
- `call_groq()` — Groq OpenAI-compatible endpoint
  - ~~`llama-3.1-70b-versatile`~~ → **`llama-3.3-70b-versatile`** (3.1 deprecated Sep 2025)
  - Auth: `Bearer GROQ_KEY`
  - Parse: `choices[0].message.content`
- `call_gemini()` — Google Generative Language API
  - Model: `gemini-1.5-flash` (not 2.0-flash)
  - Parse: `candidates[0].content.parts[0].text`

### T4 — Multi-key rotation ✅ (added Day 1 close)
`.env` format:
```
GROQ_API_KEYS=gsk_key1,gsk_key2
GEMINI_API_KEYS=AIza_key1,AIza_key2
```
Logic: iterate keys list → on 429 try next key → raise if all exhausted.

### T5 — `/query` route ✅
- `asyncio.gather(call_groq, call_gemini)` — true parallel fan-out
- Returns `{"groq": "...", "gemini": "..."}`
- Raises `HTTPException(500)` with detail on any failure

### T6 — Frontend UI ✅ (with fixes)
- Textarea (prompt input)
- "Ask both models" button — disabled when empty or loading
- Error display (red box)
- Results grid: two columns — **Groq (Llama 3.3 70B)** | **Gemini 1.5 Flash**
  - ~~`results.claude`~~ → `results.groq` (key mismatch fix)

### T7 — `.env` security ✅
- `.env` in `.gitignore` — keys never committed
- `.env.example` committed with placeholder values
- Plaintext notepad API key file → deleted after moving to `.env`

### T8 — Day 1 verification
- [ ] Backend starts without errors on `uvicorn main:app --reload`
- [ ] Frontend loads at `localhost:5173`
- [ ] Prompt "Hello" → both Groq and Gemini panels show output
- [ ] 429 on one key → automatically retries with second key
- [ ] No `results.claude` undefined in frontend

---

## Done State
Both models respond side-by-side with no errors. Multi-key rotation silently handles rate limits.

---

## Known Issues Resolved
| Issue | Fix |
|---|---|
| `call_groq` was still calling Anthropic API | Rewrote with correct Groq endpoint |
| Model `groq-sonnet-4-20250514` doesn't exist | Replaced with `llama-3.3-70b-versatile` |
| `llama-3.1-70b-versatile` returns 400 | Deprecated Sep 2025 → use `llama-3.3-70b-versatile` |
| Frontend reading `results.claude` | Fixed to `results.groq` |
| Gemini 429 on `gemini-2.0-flash` | Backend was stale — fixed to `gemini-1.5-flash` |
| Single API key exhausted quickly | Multi-key rotation added |

---

## Day 2 →
See `Nexus_Day2_TaskPlan.md`
