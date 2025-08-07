@echo off
echo Setting up Portfolio Management System with Asset Suggestions...
echo.

echo Installing backend dependencies...
cd backend
call npm install
echo.

echo Installing frontend dependencies...
cd ..\frontend
call npm install
echo.

echo Starting the application...
echo Backend will start on http://localhost:5000
echo Frontend will start on http://localhost:3000
echo.

start "Backend Server" cmd /k "cd /d %~dp0backend && npm start"
timeout /t 3 /nobreak > nul
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo Setup complete! The application should open in your browser shortly.
echo.
echo Features added:
echo - Asset search with suggestions
echo - Real-time price updates
echo - Popular Indian stocks, mutual funds, and crypto
echo - Live price indicators
echo.
pause