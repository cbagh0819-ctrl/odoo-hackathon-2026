@echo off
title Brightloop Software - Subscription Management System (Odoo Hackathon 2026)
echo =========================================================================
echo    Brightloop Software - Subscription Management Platform Launcher
echo =========================================================================
echo.
echo 1. Launching Backend FastAPI Server (http://localhost:8000)...
start "Brightloop Backend" cmd /k "cd /d "%~dp0backend" && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo 2. Launching Frontend React App (http://localhost:3000)...
start "Brightloop Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo =========================================================================
echo Both servers are starting up!
echo - Web Application: http://localhost:3000
echo - Swagger API Docs: http://localhost:8000/docs
echo =========================================================================
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:3000
