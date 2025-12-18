# GitHub Copilot Instructions for OWASP Juice Shop

This file provides guidelines for using GitHub Copilot when contributing to OWASP Juice Shop.

## Primary Reference

For comprehensive guidelines on using AI assistants (including Copilot) with this project, please refer to [CLAUDE.md](../CLAUDE.md). That document covers:

- Recommended use cases
- Code quality and style requirements
- Testing requirements
- Commit and PR guidelines
- Development workflow best practices
- Quality checklists

**All contributors using Copilot must follow the guidelines in [CLAUDE.md](../CLAUDE.md) before submitting pull requests.**

## Copilot-Specific Context

The following context is provided to help Copilot better assist with contributions to this project:

### Project Overview

- **Project**: OWASP Juice Shop - an intentionally insecure web application for security training
- **Primary Languages**: TypeScript, JavaScript, Angular (frontend)
- **Key Technologies**: Node.js, Express, SQLite/MongoDB, Angular
- **Testing**: Jest (unit tests), Frisby (API integration), Cypress (E2E tests)
- **Code Style**: JS Standard Style (enforced via ESLint)

### Important Constraints

1. **Security Context**: This project intentionally contains security vulnerabilities for educational purposes. New vulnerabilities must be:
   - Intentionally designed for training
   - Approved by maintainers before implementation
   - Well-documented in challenges

2. **Challenge Development**: Do not create challenges without prior maintainer discussion. Consult [CLAUDE.md](../CLAUDE.md#recommended-use-cases) before proposing new challenges.

3. **Code Changes and RSN**: When modifying code that is part of a coding challenge, the Refactoring Safety Net (RSN) must pass. See [CLAUDE.md](../CLAUDE.md#refactoring-safety-net-rsn) for details.

4. **Dependency Updates**: Always verify compatibility when suggesting package updates. Check:
   - `package.json` (backend)
   - `frontend/package.json` (frontend)

### Key Files and Directories

- `app.ts` / `server.ts` - Application entry points
- `lib/` - Utility functions and libraries
- `routes/` - Express route handlers
- `models/` - Data models
- `data/` - Data creation and management
- `test/` - Unit and integration tests
- `frontend/src/` - Angular frontend code
- `cypress/` - E2E tests
- `config/` - Configuration files
- `i18n/` - Internationalization files (do not modify directly)

### Quality Requirements

Before suggesting code or accepting Copilot suggestions, ensure:

- ESLint compliance: `npm run lint`
- Tests pass: `npm test`, `npm run frisby`, `npm run cypress:open`
- RSN passes (if modifying challenge-related code): `npm run rsn`
- Code follows JS Standard Style
- AI-generated noise is removed (see [CLAUDE.md](../CLAUDE.md#1-clean-up-ai-generated-noise))
- Commits are signed off: `git commit -s`

### Common Tasks with Copilot

**Creating Tests**: Use Copilot to generate unit tests and E2E tests, but always verify they pass locally and align with existing test patterns.

**Code Refactoring**: Copilot can help improve code quality, but verify changes don't break functionality and pass RSN if applicable.

**Bug Fixes**: Leverage Copilot to identify and fix issues, but ensure fixes are tested thoroughly.

**Documentation**: Use Copilot for clear comments and documentation, but remove verbose explanations (see CLAUDE.md guidelines).

## Quick Checklist for Copilot-Assisted Work

- [ ] Reviewed [CLAUDE.md](../CLAUDE.md) guidelines
- [ ] Code passes ESLint (`npm run lint`)
- [ ] Tests pass (`npm test`, `npm run frisby`)
- [ ] RSN passes if applicable (`npm run rsn`)
- [ ] AI-generated noise cleaned up
- [ ] Commits signed off (`git commit -s`)
- [ ] No verbose AI-generated comments remain
- [ ] PR based on `develop` branch
- [ ] Focused on a single scope

## Getting Help

- Review [CLAUDE.md](../CLAUDE.md) for detailed guidance
- Check the [Contribution Guide](../CONTRIBUTING.md)
- Refer to the [project documentation](https://pwning.owasp-juice.shop/)
- Connect with the community via Slack or GitHub issues

---

Remember: Copilot is a productivity tool. You are responsible for the quality, correctness, and security of your contributions.

