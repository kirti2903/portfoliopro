@echo off
echo Portfolio Pro - Professional Trading System
echo ==========================================

echo.
echo Starting Backend Server...
start "Portfolio Backend" cmd /k "cd backend && npm start"

echo.
echo Waiting for backend to initialize...
timeout /t 3 /nobreak > nul

echo.
echo Starting Frontend Application...
start "Portfolio Frontend" cmd /k "cd frontend && npm start"

echo.
echo ==========================================
echo Professional Features:
echo - Black & Blue Theme
echo - Real-time Portfolio Updates
echo - Line Chart Performance Tracking
echo - Automatic Transaction Logging
echo - Market Trends & News
echo - Single-User Trading System
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause