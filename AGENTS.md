# AI Agent Guidelines for OWASP Juice Shop

This document is the **primary authoritative source** of context for all AI assistants (Claude, GitHub Copilot, Codeium, Continue.dev, Junie, etc.) contributing to OWASP Juice Shop. It provides comprehensive guidelines to maintain code quality, security, and adherence to project standards.

## Project Overview

- **Project**: OWASP Juice Shop - an intentionally insecure web application for security training
- **Primary Languages**: TypeScript, JavaScript, Angular (frontend)
- **Key Technologies**: Node.js (22–25 with 24 being the default), Express, SQLite/Sequelize, MongoDB/MarsDB, Angular 21.x
- **Testing**: Mocha/Chai/Sinon (server unit tests), Supertest (API integration), Vitest (frontend unit tests), Cypress (E2E tests)
- **Code Style**: JS Standard Style (enforced via ESLint)
- **Repository**: [juice-shop/juice-shop](https://github.com/juice-shop/juice-shop)

## Key Files and Directories

- `app.ts` / `server.ts` - Application entry points
- `lib/` - Utility functions and libraries (including `lib/startup/` for initialization)
- `routes/` - Express route handlers
- `models/` - Sequelize data models (SQLite)
- `data/` - Data creation and management (`data/static/` for challenges, users, codefixes)
- `views/` - Server-rendered templates (Handlebars `.hbs` and Pug `.pug`)
- `test/server/` - Server unit tests (Mocha/Chai/Sinon)
- `test/api/` - API integration tests (Supertest)
- `frontend/src/` - Angular frontend code (tests use Vitest)
- `cypress/` - E2E tests (Cypress)
- `rsn/` - Refactoring Safety Net scripts and cache
- `config/` - Configuration files (YAML, multiple themed configs like `ctf.yml`, `default.yml`)
- `i18n/` - Internationalization files (do NOT modify directly)
- `ftp/` - Files served via the simulated FTP directory
- `monitoring/` - Grafana dashboard config
- `.github/workflows/` - CI/CD pipelines
- `encryptionkeys/` - Encryption key files

## Important Constraints

1. **Security Context**: This project contains intentional vulnerabilities for training. New vulnerabilities must be approved by maintainers and well-documented.
2. **Challenge Development**: Consult maintainers before creating new challenges. AI-generated challenges risk being duplicate, unsolvable, or dysfunctional.
3. **Code Changes and RSN**: When modifying challenge-related code, the Refactoring Safety Net must pass.
4. **Dependency Updates**: Verify compatibility with `package.json` and `frontend/package.json`.
5. **Translation Modifications**: Use [Crowdin](https://crowdin.com/project/owasp-juice-shop), not direct file editing.

## Recommended Use Cases

### ✅ Good Use Cases

- **Code Analysis**: Understanding existing code structure and patterns
- **Refactoring**: Improving code quality while maintaining functionality
- **Test Writing**: Creating unit, integration, and e2e tests
- **Bug Fixing**: Identifying and resolving issues
- **Documentation**: Writing clear comments and documentation

### ⚠️ Use with Caution

- **Challenge Development**: Consult with maintainers before creating new challenges.
- **Security Vulnerabilities**: Ensure AI-suggested vulnerabilities are intentional and appropriate for the project.
- **Dependencies**: Verify any suggested package updates for compatibility.
- **Architecture Changes**: Discuss major structural changes with maintainers first.

## Essential Guidelines

### 1. Clean Up AI-Generated Noise

**Required** per CONTRIBUTING.md rule #6: Remove unnecessary AI-generated content before submitting PRs.

**Remove**:
- Verbose comments explaining obvious code
- Generic placeholder comments
- Overly detailed docstrings for simple functions
- Repetitive explanations, `console.log` statements

**Keep**:
- Meaningful comments for complex logic
- Challenge hints and metadata
- Security-relevant documentation

### 2. Code Style Compliance

Always run ESLint before committing (unless only `REFERENCES.md` or `SOLUTIONS.md` were modified):
```bash
npm run lint
```
The AI should suggest code following [JS Standard Style](http://standardjs.com/), but always verify.

### 3. Testing Requirements

For any code changes (unless only `REFERENCES.md` or `SOLUTIONS.md` were modified):
- **Unit/Integration Tests**: New features and changes should have tests.
- **E2E Tests**: Required for new/modified challenges.
- **RSN (Refactoring Safety Net)**: Required when modifying existing code that is part of a coding challenge (see the [verify-rsn-fix skill](./.ai/skills/verify-rsn-fix/SKILL.md) for details).
- **Run Tests Locally**:
  ```bash
  npm test                    # Runs frontend, server, and api tests
  npm run test:frontend       # Frontend unit tests (Vitest)
  npm run test:server         # Server unit tests only (Mocha/Chai/Sinon)
  npm run test:api            # API integration tests (Supertest)
  npm start & npm run test:e2e  # E2E tests (Cypress)
  npm run rsn                 # Refactoring Safety Net
  ```

### 4. Commit Sign-off

All commits must be signed off (DCO):
```bash
git commit -s -m "Your commit message"
```

### 5. Branch and PR Strategy

- Work on `develop` branch-based feature branches.
- Keep PRs focused on a single scope.
- Reference related issues in PR descriptions.

## Development Workflow

### 1. Understanding the Codebase
Ask the AI to:
- Explain specific components or patterns.
- Identify where to implement new features.
- Trace code execution paths.

### 2. Implementation
Ask the AI to:
- Generate initial implementation.
- Suggest test cases.
- Review for security implications.

### 3. Quality Assurance
Before committing:
1. Remove AI-generated noise.
2. Run `npm run lint` (unless only `REFERENCES.md` or `SOLUTIONS.md` were modified).
3. Run relevant test suites.
4. If you modified code that is part of a coding challenge, run `npm run rsn`.
5. Manually verify functionality.
6. Check for unintended changes.

### 4. Documentation
Ask the AI to:
- Write clear commit messages.
- Draft PR descriptions.
- Document complex logic.

## Anti-Patterns to Avoid

❌ **Don't**: Accept AI suggestions blindly without understanding them.
✅ **Do**: Review and understand all AI-generated code.

❌ **Don't**: Submit PRs with verbose AI-generated comments.
✅ **Do**: Clean up and keep only meaningful comments.

❌ **Don't**: Skip testing because AI "seems confident".
✅ **Do**: Always run the full test suite.

❌ **Don't**: Use AI for contribution farming or trivial changes.
✅ **Do**: Make meaningful contributions that add value.

❌ **Don't**: Let AI modify translations directly.
✅ **Do**: Use [Crowdin](https://crowdin.com/project/owasp-juice-shop) for translations.

## Example: Implementing a Bug Fix

1. **Analyze**: Ask the AI to analyze the issue.
2. **Locate**: Locate the problematic code.
3. **Implement**: Implement the fix with the AI's help.
4. **Test**: Generate tests and run the suite.
5. **RSN**: Run `npm run rsn` if the fix affects code used in a coding challenge.
6. **Sign-off**: Clean up and commit with sign-off (`git commit -s`).

## Quality Checklist

Before submitting a PR:

- [ ] Code follows JS Standard Style (ESLint passes)
- [ ] AI-generated noise removed
- [ ] Tests added/updated and passing
- [ ] RSN check passing (if modified code relevant for a coding challenge)
- [ ] Manual testing completed
- [ ] Commits are signed off
- [ ] PR based on `develop` branch
- [ ] Single, focused scope
- [ ] All CI checks passing

## Refactoring Safety Net (RSN)

When modifying existing code that is part of a coding challenge, you must run the RSN to ensure code snippet and fix option files remain consistent:

```bash
npm run rsn
```

- **If RSN fails**: Review the listed differences.
- If changes are intentionally part of the coding challenge, update the differences cache: `npm run rsn:update`.
- **IMPORTANT**: Utilize the [verify-rsn-fix skill](./.ai/skills/verify-rsn-fix/SKILL.md).
- When refactoring source code that is part of a challenge snippet, manually apply the same changes to the corresponding codefix files in `data/static/codefixes/` to maintain consistency.

## Getting Help

- **Authoritative Guide**: [AGENTS.md](./AGENTS.md)
- **Contribution Guidelines**: [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Project Documentation**: [pwning.owasp-juice.shop](https://pwning.owasp-juice.shop/)
- **Community**: GitHub issues and discussions.

## Skills

- [add-reference skill](./.ai/skills/add-reference/SKILL.md): Instructions for adding new blog posts, talks, or other references to `REFERENCES.md`
- [add-solution skill](./.ai/skills/add-solution/SKILL.md): Instructions for adding new hacking guides, videos, or tools to `SOLUTIONS.md`
- [create-m3-theme skill](./.ai/skills/create-m3-theme/SKILL.md): Instructions for creating new Angular Material M3 themes
- [generate-release-notes skill](./.ai/skills/generate-release-notes/SKILL.md): Instructions for generating release notes.
- [verify-challenge skill](./.ai/skills/verify-challenge/SKILL.md): Instructions for verifying new challenges fulfill all project requirements and metadata
- [verify-rsn-fix skill](./.ai/skills/verify-rsn-fix/SKILL.md): Instructions for identifying and fixing broken RSN caused by code changes

## Verification of Agent Context

To verify that an AI agent (like GitHub Copilot or Claude) is correctly using this context, you can use the following test prompts:

1. **Check Primary Guidelines**: "What are the security constraints for developing new challenges in this project? Refer to the primary agent guidelines."
   - *Expected Result*: The agent should summarize constraints from the "Important Constraints" section of this file.
2. **Check Skill Discovery**: "How do I fix a break in the Refactoring Safety Net (RSN)? Is there a skill for this?"
   - *Expected Result*: The agent should point to the `verify-rsn-fix` skill located in `./.ai/skills/verify-rsn-fix/SKILL.md`.
3. **Check Skill Content**: "Show me the checklist for verifying a new challenge."
   - *Expected Result*: The agent should find and display the content from `./.ai/skills/verify-challenge/checklists/challenge-checklist.md`.

## Remember

AI agents are productivity tools for enhancing development. You (or the person reviewing the PR) are responsible for the quality, correctness, and security of all contributions. Always review AI-generated code critically, test thoroughly, and follow the project's guidelines.

---

**Last Updated**: April 2026
