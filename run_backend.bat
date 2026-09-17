@echo off
title AI Public Service Assistant Backend Server
echo ======================================================================
echo Starting AI Public Service Assistant Backend on http://127.0.0.1:8000
echo Swagger UI Docs: http://127.0.0.1:8000/docs
echo ======================================================================
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
pause
