@echo off
echo Portfolio Management System - Enhanced Version
echo =============================================

echo.
echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm start"

echo.
echo Waiting for backend to initialize...
timeout /t 3 /nobreak > nul

echo.
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo =============================================
echo Enhanced Features:
echo - Asset dropdown in transactions
echo - Auto-date selection
echo - No manual asset editing needed
echo - Better form labels
echo - Simplified user experience
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause