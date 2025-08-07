@echo off
echo Deploying Portfolio Management System...

echo Installing global dependencies...
npm install -g pm2 serve

echo Installing backend dependencies...
cd backend
npm install
cd ..

echo Installing frontend dependencies...
cd frontend
npm install
echo Building frontend...
npm run build
cd ..

echo Starting application with PM2...
pm2 stop ecosystem.config.js
pm2 delete ecosystem.config.js
pm2 start ecosystem.config.js
pm2 save

echo Deployment complete!
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3000
pause