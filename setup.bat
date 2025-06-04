@echo off
REM Script to setup and run Task Manager project
REM Author: Student
REM Date: June 4, 2025

echo =========================================
echo Task Manager - Setup ^& Run Script
echo Branch: Ma-con-cho
echo =========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js version 16+ first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ npm version:
npm --version

echo 🔍 Checking MongoDB connection...
echo ⚠️ Please ensure MongoDB is installed and running.
echo You can:
echo 1. Install MongoDB locally and start it with 'mongod'
echo 2. Use MongoDB Atlas (cloud) - update MONGODB_URI in .env

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file...
    (
    echo # Database
    echo MONGODB_URI=mongodb://localhost:27017/taskmanager
    echo.
    echo # JWT Secret
    echo JWT_SECRET=your-super-secret-jwt-key-taskmanager-2025
    echo.
    echo # Server Port
    echo PORT=5000
    echo.
    echo # Client URL ^(for CORS^)
    echo CLIENT_URL=http://localhost:3001
    echo.
    echo # Email Configuration ^(optional^)
    echo EMAIL_USER=your-email@gmail.com
    echo EMAIL_PASS=your-app-password
    ) > .env
    echo ✅ Created .env file with default settings
) else (
    echo ✅ .env file already exists
)

REM Install backend dependencies
echo 📦 Installing backend dependencies...
call npm install

if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

echo ✅ Backend dependencies installed

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd client
call npm install

if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

cd ..
echo ✅ Frontend dependencies installed

REM Seed database (optional)
echo.
echo 🌱 Do you want to seed the database with sample data? (y/n)
set /p response=
if /i "%response%"=="y" (
    echo 🌱 Seeding database...
    node seed.js
    if not errorlevel 1 (
        echo ✅ Database seeded successfully
        echo 📧 Default accounts created:
        echo    Admin: admin@example.com / password123
        echo    User: user@example.com / password123
    ) else (
        echo ⚠️ Database seeding failed (this is optional)
    )
)

echo.
echo =========================================
echo 🚀 Setup completed! You can now run:
echo =========================================
echo.
echo Option 1 - Run both backend and frontend together:
echo    npm run dev
echo.
echo Option 2 - Run separately:
echo    Terminal 1: npm start          (Backend - http://localhost:5000)
echo    Terminal 2: cd client ^&^& npm start  (Frontend - http://localhost:3001)
echo.
echo 📖 Open http://localhost:3001 in your browser
echo.
echo 🔧 If you encounter issues:
echo    1. Check MongoDB is running
echo    2. Check ports 5000 and 3001 are available
echo    3. Review the README.md file
echo.
echo ✨ Happy coding!
echo =========================================
pause
