#!/bin/bash

# OWASP Juice Shop Dev Container Setup Script
# Based on installation steps from README.md and CONTRIBUTING.md

set -e

echo "🚀 Setting up OWASP Juice Shop development environment..."

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install --legacy-peer-deps
cd ..

# Build the frontend
echo "🔨 Building frontend..."
npm run build:frontend

# Build the server
echo "🔨 Building server..."
npm run build:server

echo "✅ OWASP Juice Shop development environment setup complete!"

npm start