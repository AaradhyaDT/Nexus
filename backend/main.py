import os
import asyncio
import sqlite3
import json
import re
from contextlib import contextmanager, asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv

load_dotenv()

DB_PATH = "nexus.db"
GROQ_KEYS = [k.strip() for k in os.getenv("GROQ_API_KEYS", "").split(",") if k.strip()]
GEMINI_KEYS = [k.strip() for k in os.getenv("GEMINI_API_KEYS", "").split(",") if k.strip()]
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# ── DATABASE & LIFESPAN MANAGEMENT ─────────────────────────────────────────────

@contextmanager
def get_db():
    # check_same_thread=False allows multi-threaded FastAPI async workers to use connections
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        conn.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id      INTEGER PRIMARY KEY AUTOINCREMENT,
                name    TEXT    NOT NULL,
                g_index INTEGER DEFAULT 0,
                g_email TEXT    DEFAULT '',
                prompt  TEXT    DEFAULT 'You are a helpful expert assistant.'
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS history (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id  INTEGER NOT NULL,
                prompt      TEXT    NOT NULL,
                responses   TEXT    NOT NULL,
                models_used TEXT    NOT NULL,
                timestamp   DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        try:
            conn.execute("""
                CREATE VIRTUAL TABLE IF NOT EXISTS project_notes_fts
                USING fts5(project_id UNINDEXED, content)
            """)
        except sqlite3.OperationalError:
            pass  # FTS5 unavailable — notes/context injection disabled
            
        if not conn.execute("SELECT 1 FROM projects LIMIT 1").fetchone():
            conn.execute("INSERT INTO projects (name) VALUES ('Default')")
        conn.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="Nexus", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ── DATA VALIDATION LAYERS ──────────────────────────────────────────────────────

class QueryRequest(BaseModel):
    prompt: str
    project_id: int
    models: list[str]

class ProjectCreate(BaseModel):
    name: str
    g_index: int = 0
    g_email: str = ""
    prompt: str = "You are a helpful expert assistant."

class NoteCreate(BaseModel):
    project_id: int
    content: str

# ── KEY ROTATION PATTERN ────────────────────────────────────────────────────────

async def with_rotation(keys: list, fn) -> str:
    if not keys:
        return "Error: no API key configured for this model."
    last = None
    for key in keys:
        try:
            return await fn(key)
        except Exception as e:
            last = str(e)
            if any(code in last for code in ["429", "401", "403"]):
                continue
            return f"Error: {last}"
    return f"Error: all keys exhausted — {last}"

# ── COMPLIANT LLM ADAPTERS ──────────────────────────────────────────────────────

async def call_groq(prompt: str, system: str, client: httpx.AsyncClient) -> str:
    async def _req(key):
        r = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {key}"},
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user",   "content": prompt}
                ]
            },
            timeout=30
        )
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]
    return await with_rotation(GROQ_KEYS, _req)

async def call_gemini(prompt: str, system: str, client: httpx.AsyncClient) -> str:
    def parse_gemini(data: dict) -> str:
        if "response" in data:
            resp = data["response"]
            if isinstance(resp, dict):
                content = resp.get("content")
                if isinstance(content, list) and content:
                    first = content[0]
                    if isinstance(first, dict) and "text" in first:
                        return first["text"]
                    if isinstance(first, str):
                        return first
        if "candidates" in data and isinstance(data["candidates"], list) and data["candidates"]:
            cand = data["candidates"][0]
            if isinstance(cand, dict):
                if "output" in cand:
                    return cand["output"]
                if "content" in cand:
                    content = cand["content"]
                    if isinstance(content, dict) and "parts" in content and content["parts"]:
                        part = content["parts"][0]
                        if isinstance(part, dict) and "text" in part:
                            return part["text"]
        raise RuntimeError(f"Unexpected Gemini response shape: {data}")

    async def _req(key):
        r = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={key}",
            json={
                "contents": [
                    {"parts": [{"text": f"{system}\n\n{prompt}"}]}
                ]
            },
            timeout=30
        )
        if r.status_code != 200:
            err_text = r.text
            raise RuntimeError(f"Gemini request failed {r.status_code}: {err_text}")
        data = r.json()
        return parse_gemini(data)
    return await with_rotation(GEMINI_KEYS, _req)

MODEL_ADAPTERS = {
    "groq":   call_groq,
    "gemini": call_gemini,
}

# ── SEARCH CONTEXT INJECTION ────────────────────────────────────────────────────

def fts_context(project_id: int, query: str, limit: int = 3) -> str:
    words = [w for w in re.sub(r'[^\w\s]', '', query).split()[:6] if len(w) > 2]
    if not words:
        return ""
    fts_query = " OR ".join(f'"{w}"' for w in words)
    try:
        with get_db() as conn:
            rows = conn.execute(
                "SELECT content FROM project_notes_fts WHERE project_id=? AND project_notes_fts MATCH ? LIMIT ?",
                (str(project_id), fts_query, limit)
            ).fetchall()
        if rows:
            ctx = "\n---\n".join(r["content"] for r in rows)
            return f"\n\n[Project notes — relevant context]\n{ctx}"
    except Exception:
        pass
    return ""

# ── ROUTE CONTROLLERS ───────────────────────────────────────────────────────────

@app.get("/models")
def list_models():
    return [{"id": k} for k in MODEL_ADAPTERS]

@app.get("/projects")
def list_projects():
    with get_db() as conn:
        rows = conn.execute(
            "SELECT id, name, g_index, g_email FROM projects ORDER BY id"
        ).fetchall()
    return [dict(r) for r in rows]

@app.post("/projects")
def create_project(p: ProjectCreate):
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO projects (name, g_index, g_email, prompt) VALUES (?,?,?,?)",
            (p.name, p.g_index, p.g_email, p.prompt)
        )
        pid = cur.lastrowid
    return {"id": pid, "name": p.name, "g_index": p.g_index, "g_email": p.g_email}

@app.get("/projects/{project_id}/messages")
def get_messages(project_id: int):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT id, prompt, responses, models_used, timestamp FROM history "
            "WHERE project_id=? ORDER BY timestamp DESC LIMIT 50",
            (project_id,)
        ).fetchall()
    return [{
        "id":         r["id"],
        "prompt":     r["prompt"],
        "responses":  json.loads(r["responses"]),
        "models_used":json.loads(r["models_used"]),
        "timestamp":  r["timestamp"]
    } for r in rows]

@app.post("/query")
async def handle_query(req: QueryRequest):
    with get_db() as conn:
        row = conn.execute(
            "SELECT prompt FROM projects WHERE id=?", (req.project_id,)
        ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Project not found")

    system   = (row["prompt"] or "") + fts_context(req.project_id, req.prompt)
    selected = [m for m in req.models if m in MODEL_ADAPTERS]
    if not selected:
        raise HTTPException(status_code=400, detail="No valid models selected")

    async with httpx.AsyncClient() as client:
        results_list = await asyncio.gather(
            *[MODEL_ADAPTERS[m](req.prompt, system, client) for m in selected]
        )
    results = dict(zip(selected, results_list))

    with get_db() as conn:
        conn.execute(
            "INSERT INTO history (project_id, prompt, responses, models_used) VALUES (?,?,?,?)",
            (req.project_id, req.prompt, json.dumps(results), json.dumps(selected))
        )
    return results

@app.post("/notes")
def add_note(note: NoteCreate):
    try:
        with get_db() as conn:
            conn.execute(
                "INSERT INTO project_notes_fts (project_id, content) VALUES (?,?)",
                (str(note.project_id), note.content)
            )
        return {"status": "saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Notes unavailable: {e}")

@app.delete("/projects/{project_id}/history")
def delete_history(project_id: int):
    with get_db() as conn:
        conn.execute(
            "DELETE FROM history WHERE project_id = ?",
            (project_id,)
        )
    return {"status": "deleted"}
