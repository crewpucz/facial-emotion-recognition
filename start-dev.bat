@echo off
cd /d "%~dp0"

echo Starting Emotion Detector backend and frontend...
echo.
echo Backend:  http://localhost:8000/docs
echo Frontend: http://localhost:3000
echo.

start "Emotion Backend" cmd /k "cd /d "%~dp0" && call venv\Scripts\activate.bat && python -m uvicorn app.main:app --reload --reload-exclude venv --host 0.0.0.0 --port 8000"
timeout /t 3 /nobreak >nul
start "Emotion Frontend" cmd /k "cd /d "%~dp0frontend" && npm start"
