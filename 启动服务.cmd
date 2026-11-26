@echo off
title ziyi dev server (http://127.0.0.1:8765/)
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-server.ps1"
echo.
echo Server stopped.
pause
