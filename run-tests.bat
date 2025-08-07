@echo off
echo Starting Portfolio Management System Tests...
echo.

echo ================================
echo Running Backend Tests
echo ================================
cd backend
npm test
echo.

echo ================================
echo Running Frontend Tests  
echo ================================
cd ../frontend
npm test -- --coverage --watchAll=false
echo.

echo ================================
echo Test Summary Complete
echo ================================
pause