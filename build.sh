#!/bin/bash

# Build script for AccVault deployment

echo "🚀 Starting AccVault build process..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing backend dependencies..."
npm install

echo "📱 Installing frontend dependencies..."
cd client
npm install

echo "🏗️ Building frontend for production..."
npm run build

echo "🔙 Returning to root directory..."
cd ..

echo "✅ Build completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Set up your environment variables in .env file"
echo "2. Deploy to your chosen platform (Railway, Render, Heroku, etc.)"
echo "3. Update REACT_APP_API_BASE_URL in client/.env.production"
echo ""
echo "🚀 Ready for deployment!"