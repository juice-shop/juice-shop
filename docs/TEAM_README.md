# DevSecOps Enhancement Project - Team Guide

> **Quick Reference for Team Members**  
> Keep this document open while working on the project!

---

## 🚀 Quick Start (First Day Setup)

### 1️⃣ Clone the Team Fork

```bash
# Replace YOUR-TEAM with your actual GitHub org/username
git clone https://github.com/YOUR-TEAM/juice-shop.git
cd juice-shop

# Add upstream (original repo) for reference
git remote add upstream https://github.com/juice-shop/juice-shop.git
```

### 2️⃣ Install & Verify

```bash
# Install dependencies (this takes 5-10 minutes)
npm install

# Verify it works
npm start
# Open: http://localhost:3000
# You should see the Juice Shop homepage

# Stop with Ctrl+C
```

### 3️⃣ Run Existing Tests

```bash
# Run linting
npm run lint

# Run unit tests (takes a few minutes)
npm test

# If tests pass, your environment is ready! ✅
```

### 4️⃣ Create Your Feature Branch

```bash
# Create your branch based on your assigned area
git checkout -b feature/your-name

# Example:
# git checkout -b feature/alice-semgrep-integration
# git checkout -b feature/bob-trivy-scanning
```

---

## 📁 Project Structure (What You Need to Know)

```
juice-shop/
├── .github/
│   └── workflows/
│       ├── ci.yml                    ← EXISTING: Main pipeline (DON'T DELETE!)
│       ├── codeql-analysis.yml       ← EXISTING: CodeQL scanning
│       ├── security-enhanced.yml     ← NEW: Your team's work goes here!
│       └── ...
├── config/                           ← App configurations (14 profiles)
├── data/                             ← Challenge definitions, test data
├── lib/                              ← Core app logic
│   └── insecurity.ts                 ← Intentional vulnerabilities (don't "fix"!)
├── routes/                           ← API endpoints (60+ files)
├── test/                             ← Existing tests
│   ├── api/                          ← API integration tests
│   ├── cypress/                      ← E2E tests
│   └── server/                       ← Unit tests
├── Dockerfile                        ← Container configuration
├── package.json                      ← Dependencies & scripts
├── TEAM_ANALYSIS.md                  ← Your team's working document
├── TEAM_README.md                    ← This file!
└── ...
```

### Files You'll Modify Most:

| File/Directory                            | Purpose                             | Who Works Here |
| ----------------------------------------- | ----------------------------------- | -------------- |
| `.github/workflows/security-enhanced.yml` | Your new security pipeline          | Everyone       |
| `TEAM_ANALYSIS.md`                        | Team notes & findings               | Everyone       |
| `docs/security-enhancements/`             | Documentation (create this)         | Som            |
| `.github/workflows/ci.yml`                | (Reference only - don't modify yet) | Som            |

---

## 👥 Team Workflow

### Branch Strategy

```
main (protected)
  └── dev (team's working branch)
      ├── feature/kien
      ├── feature/truong
      ├── feature/som
      ├── feature/hoang_anh
      ├── feature/ha
      └── feature/dat
```

### Daily Workflow

```bash
# 1. Start your day: Update your branch
git checkout dev
git pull origin dev

# 2. Work on your feature branch
git checkout feature/your-name
git merge dev  # Get latest changes

# 3. Make changes, test locally
npm run lint          # Check code style
npm test              # Run tests (if applicable)

# 4. Commit your work
git add .
git commit -m "feat: add Trivy container scanning"

# 5. Push to your branch
git push origin feature/your-name

# 6. Create Pull Request on GitHub
# Go to GitHub → Pull Requests → New PR
# Base: dev ← Compare: feature/your-name
```

### PR Review Checklist

Before creating a PR, ensure:

- [ ] Code runs without errors
- [ ] Existing tests still pass (`npm test`)
- [ ] You've added comments explaining your changes
- [ ] You've updated relevant documentation
- [ ] GitHub Actions workflow syntax is valid (if you modified workflows)
- [ ] You've assigned a reviewer (another team member)