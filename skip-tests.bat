@echo off
echo Skipping tests - Running application directly...
echo.

echo Starting backend...
start "Backend" cmd /k "cd /d %~dp0backend && npm start"

timeout /t 3 /nobreak > nul

echo Starting frontend...
start "Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo Application started successfully!
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3000
echo.
pause