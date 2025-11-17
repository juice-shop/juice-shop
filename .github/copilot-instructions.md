# OWASP Juice Shop - AI Assistant Instructions

This document provides essential guidance for AI assistants working with the OWASP Juice Shop codebase.

## Project Overview
OWASP Juice Shop is a deliberately insecure web application designed for security training, penetration testing practice, and CTF events. It implements vulnerabilities from the OWASP Top Ten and beyond.

## Architecture & Components
- **Frontend**: Angular application (`frontend/src/`)
- **Backend**: Node.js/Express server (`app.ts`, `server.ts`)
- **Database**: SQLite with Sequelize ORM (`models/`)
- **API Routes**: REST endpoints (`routes/`)
- **Security Challenges**: Intentional vulnerabilities implemented throughout the codebase
- **i18n**: Crowdsourced translations via Crowdin

## Development Workflow
1. **Setup**: 
```bash
npm install
cd frontend && npm install --legacy-peer-deps
npm run build:frontend
npm run build:server
```

2. **Local Development**:
```bash
npm run serve:dev  # Runs backend + frontend with hot reload
```

3. **Testing**:
- Unit/Integration: `npm test` (includes frontend and server tests)
- API Tests: `npm run test:api` (Frisby.js)
- E2E Tests: `npm run cypress:run`

## Key Conventions
1. **Code Style**: Uses StandardJS - all code must pass ESLint rules
2. **Git Commits**: Must be signed off (DCO)
3. **Testing**: 
   - New features require unit/integration tests
   - New challenges require e2e tests
4. **Security**: Intentional vulnerabilities should be clearly marked in comments

## Critical Files/Directories
- `app.ts` - Main application entry
- `server.ts` - Server configuration
- `config/` - Environment configurations
- `models/` - Database models and relationships
- `routes/` - API endpoint implementations
- `frontend/src/` - Angular application source
- `data/` - Seed data and static content

## Common Tasks
1. **Adding a New Challenge**:
   - Implement vulnerability in relevant component
   - Add challenge metadata in `data/static/challenges.yml`
   - Create e2e test in `test/e2e/`
   - Document solution in `SOLUTIONS.md`

2. **Adding/Modifying API Endpoints**:
   - Create/update route file in `routes/`
   - Add/update model in `models/` if needed
   - Add tests in `test/api/`

3. **Frontend Changes**:
   - Components in `frontend/src/app/`
   - Follow Angular style guide
   - Update i18n files for new text

## Error Handling
- Use `lib/logger.ts` for logging
- API errors should use standard error responses from `lib/error.ts`
- Security-critical errors should be logged with appropriate level

## Integration Points
- Authentication: JWT-based (`lib/insecurity.ts`)
- File Upload: Multer middleware
- WebSocket: Socket.io for real-time features
- Metrics: Prometheus client (`metrics.ts`)

Remember: As this is a deliberately vulnerable application, avoid "fixing" security issues unless specifically requested.