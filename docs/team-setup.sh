# FOR REFERENCE ONLY

#!/bin/bash

# Team Setup Script for DevSecOps Enhancement Project
# Run this after cloning the repository

set -e  # Exit on error

echo "🚀 OWASP Juice Shop - DevSecOps Team Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 20, 22, or 24 from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js $NODE_VERSION found${NC}"

# Check Node version
NODE_MAJOR=$(node --version | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_MAJOR" -lt 20 ]; then
    echo -e "${YELLOW}⚠️  Warning: Node.js version 20+ is recommended${NC}"
fi

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed${NC}"
    echo "Please install Git from https://git-scm.com/"
    exit 1
fi
echo -e "${GREEN}✅ Git found${NC}"

# Check if Docker is installed (optional)
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker found (optional, but recommended)${NC}"
else
    echo -e "${YELLOW}⚠️  Docker not found (optional, but recommended)${NC}"
fi

echo ""
echo "📦 Installing dependencies..."
echo "This will take 5-10 minutes on first run..."
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ npm install failed${NC}"
    echo "Try: npm cache clean --force && npm install"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Run a quick test
echo "🧪 Running quick validation tests..."
echo ""

echo "Testing lint..."
if npm run lint 2>&1 | grep -q "error"; then
    echo -e "${YELLOW}⚠️  Lint issues found (this is expected for Juice Shop)${NC}"
else
    echo -e "${GREEN}✅ Lint check passed${NC}"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "════════════════════════════════════════════"
echo "📚 Next Steps:"
echo "════════════════════════════════════════════"
echo ""
echo "1. Read the team guide:"
echo "   cat TEAM_README.md"
echo ""
echo "2. Read your team's analysis:"
echo "   cat TEAM_ANALYSIS.md"
echo ""
echo "3. Create your feature branch:"
echo "   git checkout -b feature/YOUR-NAME-YOUR-FEATURE"
echo ""
echo "4. Start the application:"
echo "   npm start"
echo "   Then visit: http://localhost:3000"
echo ""
echo "5. Check the enhanced security pipeline:"
echo "   cat .github/workflows/security-enhanced.yml"
echo ""
echo "════════════════════════════════════════════"
echo "🔍 Useful Commands:"
echo "════════════════════════════════════════════"
echo ""
echo "  npm start              # Start the app"
echo "  npm test               # Run all tests"
echo "  npm run lint           # Check code style"
echo "  docker build -t js .   # Build Docker image"
echo ""
echo "════════════════════════════════════════════"
echo "📖 Resources:"
echo "════════════════════════════════════════════"
echo ""
echo "  TEAM_README.md         # Your quick reference guide"
echo "  TEAM_ANALYSIS.md       # Team roles and tasks"
echo "  .github/workflows/     # CI/CD pipelines"
echo ""
echo "════════════════════════════════════════════"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
echo ""

