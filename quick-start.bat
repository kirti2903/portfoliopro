@echo off
echo Portfolio Management System - Quick Start
echo ========================================

echo.
echo Step 1: Installing Dependencies...
cd backend
call npm install
cd ..\frontend
call npm install
cd ..

echo.
echo Step 2: Starting Backend (will auto-create database)...
start "Backend Server" cmd /k "cd backend && npm start"

echo.
echo Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

echo.
echo Step 3: Starting Frontend...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo Setup Complete!
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo The database will be created automatically!
echo Just make sure MySQL is running.
echo.
pause