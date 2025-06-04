#!/bin/bash

# Script to setup and run Task Manager project
# Author: Student
# Date: June 4, 2025

echo "========================================="
echo "Task Manager - Setup & Run Script"
echo "Branch: Ma-con-cho"
echo "========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js version 16+ first."
    echo "Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Check if MongoDB is running
echo "🔍 Checking MongoDB connection..."
if ! command -v mongo &> /dev/null && ! command -v mongosh &> /dev/null; then
    echo "⚠️ MongoDB CLI tools not found. Please ensure MongoDB is installed and running."
    echo "You can:"
    echo "1. Install MongoDB locally and start it with 'mongod'"
    echo "2. Use MongoDB Atlas (cloud) - update MONGODB_URI in .env"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOL
# Database
MONGODB_URI=mongodb://localhost:27017/taskmanager

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-taskmanager-2025

# Server Port
PORT=5000

# Client URL (for CORS)
CLIENT_URL=http://localhost:3001

# Email Configuration (optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EOL
    echo "✅ Created .env file with default settings"
else
    echo "✅ .env file already exists"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

echo "✅ Backend dependencies installed"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

cd ..
echo "✅ Frontend dependencies installed"

# Seed database (optional)
echo "🌱 Do you want to seed the database with sample data? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding database..."
    node seed.js
    if [ $? -eq 0 ]; then
        echo "✅ Database seeded successfully"
        echo "📧 Default accounts created:"
        echo "   Admin: admin@example.com / password123"
        echo "   User: user@example.com / password123"
    else
        echo "⚠️ Database seeding failed (this is optional)"
    fi
fi

echo ""
echo "========================================="
echo "🚀 Setup completed! You can now run:"
echo "========================================="
echo ""
echo "Option 1 - Run both backend and frontend together:"
echo "   npm run dev"
echo ""
echo "Option 2 - Run separately:"
echo "   Terminal 1: npm start          (Backend - http://localhost:5000)"
echo "   Terminal 2: cd client && npm start  (Frontend - http://localhost:3001)"
echo ""
echo "📖 Open http://localhost:3001 in your browser"
echo ""
echo "🔧 If you encounter issues:"
echo "   1. Check MongoDB is running"
echo "   2. Check ports 5000 and 3001 are available"
echo "   3. Review the README.md file"
echo ""
echo "✨ Happy coding!"
echo "========================================="
