@echo off
echo Starting AI Team Monitor Pro...
start "Monitor-Server" cmd /k "cd /d %~dp0server && npm run dev"
timeout /t 5 /nobreak >nul
start "Monitor-Client" cmd /k "cd /d %~dp0client && npm run dev"
echo.
echo System starting! Please visit http://localhost:5173
echo Server: http://localhost:3001
pause