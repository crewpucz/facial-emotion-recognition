@echo off
cd /d "%~dp0"

echo Starting Emotion Detector backend and frontend...
echo.
echo Backend:  http://localhost:8000/docs
echo Frontend: http://localhost:3000
echo.

start "Emotion Backend" "%~dp0run-backend.bat"
timeout /t 3 /nobreak >nul
start "Emotion Frontend" "%~dp0run-frontend.bat"
