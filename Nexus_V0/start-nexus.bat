@echo off
echo Starting Nexus...

:: Backend
start "Nexus Backend" cmd /k "cd backend && venv\Scripts\activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

:: Frontend
start "Nexus Frontend" cmd /k "cd frontend && npm run dev"

:: Open browser after short delay
timeout /t 3 /nobreak >nul
start http://localhost:5173
