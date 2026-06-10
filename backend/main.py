from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio, os, httpx
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
            "anthropic-version": "2023-06-01",   # ← required
            "Content-Type": "application/json",
        },
        json={
            "model": "claude-sonnet-4-20250514",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 1000,                   # ← not max_tokens_to_sample
        },
        timeout=30.0,
    )
    response.raise_for_status()
    return response.json()["content"][0]["text"]


async def call_gemini(prompt: str, client: httpx.AsyncClient) -> str:
    if not GEMINI_KEY:
        raise RuntimeError("GEMINI_API_KEY is not set")
    response = await client.post(
        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_KEY}",
        json={"contents": [{"parts": [{"text": prompt}]}]},  # ← correct format
        timeout=30.0,
    )
    response.raise_for_status()
    payload = response.json()
    return payload["candidates"][0]["content"]["parts"][0]["text"]


@app.post("/query")
async def query(req: PromptRequest):
    async with httpx.AsyncClient() as client:
        try:
            claude_out, gemini_out = await asyncio.gather(
                call_claude(req.prompt, client),
                call_gemini(req.prompt, client),
            )
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc))
    return {"claude": claude_out, "gemini": gemini_out}