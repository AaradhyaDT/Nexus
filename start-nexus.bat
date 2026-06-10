@echo off
setlocal

REM Root folder of the Nexus project
set ROOT=%~dp0

REM Start backend in a new cmd window
if exist "%ROOT%backend\venv\Scripts\python.exe" (
  start "Nexus Backend" cmd /k "cd /d "%ROOT%backend" && venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"
) else (
  echo ERROR: Backend venv not found at "%ROOT%backend\venv\Scripts\python.exe"
)

REM Start frontend in a new cmd window
if exist "%ROOT%frontend\package.json" (
  start "Nexus Frontend" cmd /k "cd /d "%ROOT%frontend" && npm install && npm run dev -- --host 127.0.0.1 --port 5173"
) else (
  echo ERROR: Frontend package.json not found at "%ROOT%frontend\package.json"
)

REM Open the app in the default browser
start "" http://127.0.0.1:5173

endlocal
