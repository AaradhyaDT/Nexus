from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Nexus AI Workflow Hub")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY", "")
GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")

class PromptRequest(BaseModel):
    prompt: str

async def call_claude(prompt: str, client: httpx.AsyncClient) -> str:
    if not ANTHROPIC_KEY:
        raise RuntimeError("ANTHROPIC_API_KEY is not set")

    response = await client.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": ANTHROPIC_KEY,
            "Content-Type": "application/json",
        },
        json={
            "model": "claude-sonnet-4-20250514",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens_to_sample": 1000,
        },
        timeout=30.0,
    )
    response.raise_for_status()
    payload = response.json()
    if "content" in payload and isinstance(payload["content"], list):
        return payload["content"][0].get("text", "")
    return payload.get("message", "")

async def call_gemini(prompt: str, client: httpx.AsyncClient) -> str:
    if not GEMINI_KEY:
        raise RuntimeError("GEMINI_API_KEY is not set")

    response = await client.post(
        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_KEY}",
        json={
            "instances": [{"input": prompt}],
        },
        timeout=30.0,
    )
    response.raise_for_status()
    payload = response.json()
    candidates = payload.get("candidates", [])
    if candidates:
        content = candidates[0].get("content", {})
        parts = content.get("parts", [])
        if parts:
            return parts[0].get("text", "")
    return ""

@app.post("/query")
async def query(req: PromptRequest):
    async with httpx.AsyncClient() as client:
        try:
            claude_task = call_claude(req.prompt, client)
            gemini_task = call_gemini(req.prompt, client)
            claude_out, gemini_out = await asyncio.gather(claude_task, gemini_task)
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc))

    return {"claude": claude_out, "gemini": gemini_out}
