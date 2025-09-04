# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

OWASP Juice Shop is an intentionally vulnerable web application built with Node.js, Express.js, Angular (frontend), and SQLite. The application demonstrates security vulnerabilities from the OWASP Top Ten and is used for security training, CTFs, and awareness demonstrations.

## Architecture

### Backend Structure

- `server.ts` - Main Express.js server configuration with middleware setup
- `app.ts` - Application entry point that validates dependencies and starts the server
- `models/` - Sequelize database models (User, Product, Challenge, etc.)
- `routes/` - Express.js route handlers organized by feature
- `lib/` - Utility functions and configuration helpers
- `data/` - Database seeding and initial data setup

### Frontend Structure

- `frontend/` - Angular application with separate package.json and npm scripts
- Built separately from backend and served as static files

### Database

- SQLite database with Sequelize ORM
- Database models define relationships between entities
- Initial data seeded from `data/` directory

## Development Commands

### Setup and Installation

```bash
npm install              # Install backend dependencies and build frontend
npm run postinstall      # Runs automatically after install (builds frontend)
```

### Development

```bash
npm run serve            # Start both backend and frontend in development mode
npm run serve:dev        # Start with ts-node-dev for auto-restart
npm start               # Start production build
```

### Building

```bash
npm run build:server     # Compile TypeScript backend to build/
npm run build:frontend   # Build frontend (runs in frontend/ directory)
```

### Testing

```bash
npm test                # Run all tests (frontend + backend)
npm run test:server     # Run backend unit/integration tests with Mocha
npm run test:api        # Run API tests with Frisby/Jest
npm run test:chromium   # Run frontend tests in headless Chromium
npm run frisby          # Run API tests only

# Cypress E2E tests
npm run cypress:open    # Open Cypress test runner
npm run cypress:run     # Run Cypress tests headlessly
```

### Linting and Code Quality

```bash
npm run lint            # Lint backend TypeScript and frontend code
npm run lint:fix        # Auto-fix linting issues
npm run lint:config     # Validate config schema
```

### Single Test Execution

```bash
# Backend tests (Mocha)
npx mocha -r ts-node/register test/server/path/to/specific.spec.ts

# API tests (Jest/Frisby)
npx jest test/api/specificTest.spec.js

# Frontend tests
cd frontend && npm test -- --watch=false --browsers=ChromiumHeadless
```

## Code Standards

- **ESLint**: Configured with TypeScript and Standard style guide
- **TypeScript**: Strict mode enabled, compiled to ES2020
- **Testing**: All new features require corresponding tests
- **Challenges**: New security challenges must include e2e tests

## Key Configuration Files

- `tsconfig.json` - TypeScript configuration
- `.eslintrc.js` - Linting rules for backend
- `package.json` - Main dependencies and scripts
- `frontend/package.json` - Frontend-specific dependencies
- `config/` - Application configuration files

## Security Context

This application is intentionally vulnerable for educational purposes. When working on this codebase:

- Vulnerabilities are by design - don't "fix" them unless specifically asked
- Code may contain patterns that would be insecure in production applications
- Focus on maintaining the educational value while ensuring code quality
