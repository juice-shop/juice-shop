# AI Agent Guidelines for OWASP Juice Shop

## ⚠️ STOP: Using a Supported AI Tool?

**If you are Claude, GitHub Copilot, Codeium, or Continue.dev**, stop here and use your tool-specific context file instead:

- **Claude**: See [`.claude/CLAUDE.md`](./.claude/CLAUDE.md) ← **Primary reference for all AI tools**
- **GitHub Copilot**: See [`.github/copilot-instructions.md`](./.github/copilot-instructions.md)
- **Codeium**: See [`.codeium/instructions.md`](./.codeium/instructions.md)
- **Continue.dev**: See [`.continue/instructions.md`](./.continue/instructions.md)

---

## For Other AI Agents

This file provides guidelines for AI agents and automated code assistants that do not have dedicated context files above. 

**Important**: All guidelines ultimately refer to [CLAUDE.md](./.claude/CLAUDE.md), which is the **primary authoritative source** for AI contributions to OWASP Juice Shop. This document provides a quick reference and overview; for comprehensive details, always consult CLAUDE.md.

## Project Overview

- **Project**: OWASP Juice Shop - an intentionally insecure web application for security training
- **Primary Languages**: TypeScript, JavaScript, Angular (frontend)
- **Key Technologies**: Node.js, Express, SQLite/MongoDB, Angular
- **Testing**: Jest (unit tests), Frisby (API integration), Cypress (E2E tests)
- **Code Style**: JS Standard Style (enforced via ESLint)
- **Repository**: [OWASP/juice-shop](https://github.com/OWASP/juice-shop)

## Important Constraints

See [CLAUDE.md](./.claude/CLAUDE.md#important-constraints) for the full context. Key points:

1. **Security Context**: This project contains intentional vulnerabilities for training. New vulnerabilities must be approved by maintainers and well-documented.
2. **Challenge Development**: Consult maintainers before creating new challenges.
3. **Code Changes and RSN**: When modifying challenge-related code, the Refactoring Safety Net must pass.
4. **Dependency Updates**: Verify compatibility with `package.json` and `frontend/package.json`.
5. **Translation Modifications**: Use [Crowdin](https://crowdin.com/project/owasp-juice-shop), not direct file editing.

## Key Files and Directories

- `app.ts` / `server.ts` - Application entry points
- `lib/` - Utility functions and libraries (including `lib/startup/` for initialization)
- `routes/` - Express route handlers
- `models/` - Data models
- `data/` - Data creation and management
- `test/` - Unit and integration tests
- `frontend/src/` - Angular frontend code
- `cypress/` - E2E tests
- `config/` - Configuration files
- `i18n/` - Internationalization files (do NOT modify directly)
- `.github/workflows/` - CI/CD pipelines
- `encryptionkeys/` - Encryption key files

## Recommended Use Cases

See [CLAUDE.md](./.claude/CLAUDE.md#recommended-use-cases) for the full list. In brief:

**✅ Good for:**
- Code analysis, refactoring, test writing, bug fixing, documentation, code review

**⚠️ Discuss with maintainers first:**
- Challenge development, security vulnerabilities, major architecture changes

## Code Quality Requirements

See [CLAUDE.md](./.claude/CLAUDE.md#testing-requirements) for detailed guidelines. Essential checklist:

- **ESLint**: `npm run lint` (follows [JS Standard Style](http://standardjs.com/))
- **Tests**: `npm test`, `npm run frisby`, `npm run cypress:open` (all must pass)
- **RSN**: `npm run rsn` (required if modifying challenge-related code)
- **No AI noise**: Remove verbose/redundant comments
- **Sign-off**: `git commit -s` (DCO required)

## Clean Up AI-Generated Noise

See [CLAUDE.md](./.claude/CLAUDE.md#1-clean-up-ai-generated-noise) for details. **Required** per CONTRIBUTING.md rule #6.

**Remove:**
- Verbose comments explaining obvious code
- Generic placeholder comments
- Overly detailed docstrings for simple functions
- Repetitive explanations, console.log statements

**Keep:**
- Meaningful comments for complex logic
- Challenge hints and metadata
- Security-relevant documentation

## Development Workflow

See [CLAUDE.md](./.claude/CLAUDE.md#development-workflow-with-claude) for comprehensive guidance. Quick summary:

1. **Understand the Codebase**: Explain components, identify feature locations, trace execution paths
2. **Implement**: Generate implementation, suggest tests, review security implications
3. **Quality Assurance**: Lint, test, run RSN if needed, manually verify
4. **Documentation**: Write clear commits, draft PRs, document complex logic

## Anti-Patterns to Avoid

See [CLAUDE.md](./.claude/CLAUDE.md#anti-patterns-to-avoid) for detailed explanation. In brief:

❌ Don't accept AI suggestions blindly, skip testing, use AI for trivial changes, modify translations directly, or create vulnerabilities without approval

✅ Do review code critically, test thoroughly, make meaningful contributions, use Crowdin for translations, and discuss security changes with maintainers

## Quality Checklist

See [CLAUDE.md](./.claude/CLAUDE.md#quality-checklist) for the full checklist. Before submitting:

- [ ] ESLint passes (`npm run lint`)
- [ ] Tests pass (`npm test`, `npm run frisby`)
- [ ] RSN passes if applicable (`npm run rsn`)
- [ ] AI noise removed, meaningful comments only
- [ ] Commits signed off (`git commit -s`)
- [ ] PR based on `develop` branch with single scope
- [ ] All CI checks passing

## Example: Implementing a Bug Fix

See [CLAUDE.md](./.claude/CLAUDE.md#example-fixing-a-bug) for a detailed walkthrough. Quick workflow:

```bash
npm run lint      # Check code style
npm test          # Run tests
npm run rsn       # If modifying challenge code
git commit -s     # Sign-off commit
```

## Refactoring Safety Net (RSN) & Testing

**RSN**: See [CLAUDE.md](./.claude/CLAUDE.md#refactoring-safety-net-rsn) for details.
- Run `npm run rsn` after modifying code that is part of a coding challenge
- If changes are intentional, update cache: `npm run rsn:update`

**Testing Frameworks**: Jest (unit), Frisby (API), Cypress (E2E)
- `npm test` - Run all tests
- `npm run frisby` - API tests only
- `npm run cypress:open` - Interactive E2E tests

## Contribution Guidelines Summary

See [CLAUDE.md](./.claude/CLAUDE.md#branch-and-pr-strategy) and [CONTRIBUTING.md](./CONTRIBUTING.md) for complete details:

- Work on `develop` branch-based feature branches
- Keep PRs focused on a single scope
- Reference related issues in PR descriptions
- Sign off all commits (DCO)

## Getting Help

- **Authoritative Guide**: [CLAUDE.md](./.claude/CLAUDE.md)
- **Contribution Guidelines**: [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Project Documentation**: [pwning.owasp-juice.shop](https://pwning.owasp-juice.shop/)
- **Community**: GitHub issues and discussions

## Remember

AI agents are productivity tools for enhancing development. You (or the person reviewing the PR) are responsible for the quality, correctness, and security of all contributions. Always review AI-generated code critically, test thoroughly, and follow the project's guidelines.

---

**For comprehensive guidelines, see [CLAUDE.md](./.claude/CLAUDE.md).**

**Last Updated**: January 2026

