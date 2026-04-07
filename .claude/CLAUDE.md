# Contributing with Claude AI Assistant

This guide helps contributors use Claude (AI assistant) effectively when working on OWASP Juice Shop while maintaining code quality and adhering to project standards.

> This document is supposed to be the primary source of context for **all** AI tools. Context files of tools other than Claude should refer to [this `CLAUDE.md` file](CLAUDE.md) for detailed guidelines. This is already the case for:
> * GitHub CoPilot ([`.github/copilot-instructions.md`](../.github/copilot-instructions.md))
> * Codeium ([`.codeium/instructions.md`](../.codeium/instructions.md))
> * Continue.dev ([`.continue/instructions.md`](../.continue/instructions.md))
> * Junie ([`.junie/AGENTS.md`](../.junie/AGENTS.md))

## Before You Start

Claude can assist with various development tasks, but all contributions must still meet the requirements in [CONTRIBUTING.md](../CONTRIBUTING.md). The AI is a tool to enhance productivity, not a replacement for understanding the codebase and contribution guidelines.

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
2. **Challenge Development**: Consult maintainers before creating new challenges.
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

- **Challenge Development**: Consult with maintainers before creating new challenges - AI-generated challenges risk being duplicate, unsolvable, or dysfunctional
- **Security Vulnerabilities**: Ensure AI-suggested vulnerabilities are intentional and appropriate for the project
- **Dependencies**: Verify any suggested package updates for compatibility
- **Architecture Changes**: Discuss major structural changes with maintainers first

## Essential Guidelines

### 1. Clean Up AI-Generated Noise

**Required** per CONTRIBUTING.md rule #6: Remove unnecessary AI-generated content before submitting PRs.

Remove:
- Verbose comments explaining obvious code
- Generic placeholder comments
- Overly detailed docstrings for simple functions
- Repetitive explanations

Keep:
- Meaningful comments for complex logic
- Challenge hints and metadata
- Security-relevant documentation

### 2. Code Style Compliance

Always run ESLint before committing (unless only `REFERENCES.md` or `SOLUTIONS.md` were modified):
```bash
npm run lint
```

Claude should suggest code following [JS Standard Style](http://standardjs.com/), but always verify.

### 3. Testing Requirements

For any code changes Claude helps with (unless only `REFERENCES.md` or `SOLUTIONS.md` were modified):
- **Unit/Integration Tests**: New features and changes should have tests
- **E2E Tests**: Required for new/modified challenges
- **RSN (Refactoring Safety Net)**: Required when modifying existing code that is part of a coding challenge (see the [verify-rsn-fix skill](../.junie/skills/verify-rsn-fix/SKILL.md) for details)
- **Run Tests Locally**:
  ```bash
  npm test                    # Frontend unit tests (Vitest) + server unit tests (Mocha)
  npm run test:server         # Server unit tests only (Mocha/Chai/Sinon)
  npm run test:api              # API integration tests (Supertest), alias: npm run test:api
  npm start & npm run cypress:run  # E2E tests (Cypress), alias: npm run test:e2e
  npm run rsn                 # Refactoring Safety Net (for code changes impacting coding challenge snippets)
  ```

### 4. Commit Sign-off

All commits must be signed off (DCO):
```bash
git commit -s -m "Your commit message"
```

### 5. Branch and PR Strategy

- Work on `develop` branch-based feature branches
- Keep PRs focused on a single scope
- Reference related issues in PR descriptions

## Development Workflow with Claude

### 1. Understanding the Codebase
```
Ask Claude to:
- Explain specific components or patterns
- Identify where to implement new features
- Trace code execution paths
```

### 2. Implementation
```
Ask Claude to:
- Generate initial implementation
- Suggest test cases
- Review for security implications
```

### 3. Quality Assurance
```
Before committing:
1. Remove AI-generated noise
2. Run npm run lint (unless only `REFERENCES.md` or `SOLUTIONS.md` were modified)
3. Run relevant test suites
4. If you modified code that is part of a coding challenge, run npm run rsn
5. Manually verify functionality
6. Check for unintended changes
```

### 4. Documentation
```
Ask Claude to:
- Write clear commit messages
- Draft PR descriptions
- Document complex logic
```

## Anti-Patterns to Avoid

❌ **Don't**: Accept AI suggestions blindly without understanding them
✅ **Do**: Review and understand all AI-generated code

❌ **Don't**: Submit PRs with verbose AI-generated comments
✅ **Do**: Clean up and keep only meaningful comments

❌ **Don't**: Skip testing because AI "seems confident"
✅ **Do**: Always run the full test suite

❌ **Don't**: Use AI for contribution farming or trivial changes
✅ **Do**: Make meaningful contributions that add value

❌ **Don't**: Let AI modify translations directly
✅ **Do**: Use [Crowdin](https://crowdin.com/project/owasp-juice-shop) for translations

## Example: Fixing a Bug

```bash
# 1. Ask Claude to analyze the issue
"Help me understand why the basket total calculation is incorrect"

# 2. Locate the problematic code
"Show me where basket totals are calculated"

# 3. Implement the fix with Claude's help
"Fix the calculation to properly handle discount edge cases"

# 4. Generate tests
"Create unit tests to cover the discount calculation edge cases"

# 5. Quality checks
npm run lint
npm test
npm run rsn  # If the fix affects code used in a coding challenge

# 6. Clean up and commit with sign-off
git commit -s -m "Fix basket total calculation for discount edge cases"
```

## Quality Checklist

Before submitting a Claude-assisted PR:

- [ ] Code follows JS Standard Style (ESLint passes)
- [ ] AI-generated noise removed
- [ ] Tests added/updated and passing
- [ ] RSN check passing (if modified code relevant for a coding challenge)
- [ ] Manual testing completed
- [ ] Commits are signed off
- [ ] PR based on `develop` branch
- [ ] Single, focused scope
- [ ] All CI checks passing
- [ ] PR contains AI Tool Disclosure and Affirmation

## Refactoring Safety Net (RSN)

When modifying existing code that is part of a coding challenge, you must run the RSN to ensure code snippet and fix option files remain consistent:

```bash
npm run rsn
```

**What it does:**
- Checks for unexpected changes in coding challenge files
- Detects accidental differences in lines of code
- Lists any inconsistencies found

**When to run:**
- After refactoring code that is part of any coding challenge
- After changing original source files referenced in challenges
- Before committing changes that touch challenge-related code

**If RSN fails:**
- Review the listed differences
- If changes are intentionally part of the coding challenge, update the differences cache:
  ```bash
  npm run rsn:update
  ```
- IMPORTANT: When refactoring source code that is part of a challenge snippet, manually apply the same changes to the corresponding codefix files in `data/static/codefixes/` to maintain consistency. The RSN check should ideally pass without needing to update the cache for non-challenge-related refactorings.
- If changes are unintentional, fix the affected files

Learn more: [Code Snippets Documentation](https://pwning.owasp-juice.shop/companion-guide/latest/part5/code-snippets.html)

## Getting Help

- Refer to the [detailed contribution guidelines](https://pwning.owasp-juice.shop/companion-guide/latest/part3/contribution.html)
- Check existing issues and PRs for examples
- Join the community on Slack or Gitter
- Ask questions via Slack or comment on the GitHub issue you are working on

## Skills

- [add-reference skill](../.junie/skills/add-reference/SKILL.md): Instructions for adding new blog posts, talks, or other references to `REFERENCES.md`
- [add-solution skill](../.junie/skills/add-solution/SKILL.md): Instructions for adding new hacking guides, videos, or tools to `SOLUTIONS.md`
- [create-m3-theme skill](../.junie/skills/create-m3-theme/SKILL.md): Instructions for creating new Angular Material M3 themes
- [verify-challenge skill](../.junie/skills/verify-challenge/SKILL.md): Instructions for verifying new challenges fulfill all project requirements and metadata
- [verify-rsn-fix skill](../.junie/skills/verify-rsn-fix/SKILL.md): Instructions for identifying and fixing broken RSN caused by code changes

## Remember

Claude is a powerful tool for productivity, but you are responsible for the quality and correctness of your contributions. Always review, test, and understand the code before submitting.
