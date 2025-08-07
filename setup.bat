@echo off
echo Setting up Portfolio Management System...

echo.
echo Installing Backend Dependencies...
cd backend
call npm install
cd ..

echo.
echo Installing Frontend Dependencies...
cd frontend
call npm install
cd ..

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Set up MySQL database using backend/database.sql
echo 2. Configure backend/.env with your database credentials
echo 3. Run 'npm start' in backend directory
echo 4. Run 'npm start' in frontend directory
echo.
pause