#!/bin/bash

# Netlify Build Script for LegalMind Frontend
set -e

echo "🚀 Starting LegalMind Frontend build..."

# Navigate to the frontend directory
cd legalmind-frontend

# Install pnpm if not available
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Run linting
echo "🔍 Running linter..."
pnpm run lint

# Build the application
echo "🏗️ Building application..."
pnpm run build

echo "✅ Build completed successfully!"
echo "📁 Build output is in: legalmind-frontend/dist/"