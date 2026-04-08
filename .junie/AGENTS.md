# Junie Instructions for OWASP Juice Shop

This file provides guidelines for using Junie (JetBrains AI Agent) when contributing to OWASP Juice Shop.

## Primary Reference

For comprehensive guidelines on using AI assistants (including Junie) with this project, please refer to [CLAUDE.md](../.claude/CLAUDE.md). That document covers:

- Recommended use cases
- Code quality and style requirements
- Testing requirements
- Commit and PR guidelines
- Development workflow best practices
- Quality checklists

**All contributors using Junie must follow the guidelines in [CLAUDE.md](../.claude/CLAUDE.md) before submitting pull requests.**

## Junie-Specific Context

The following context is provided to help Junie better assist with contributions to this project:

- **JetBrains Ecosystem**: Junie is optimized for the JetBrains environment. Use IDE-specific tools and integrations when available.
- **Workflow Tools**: Use Junie's standard tools (`update_status`, `submit`, etc.) according to her specific workflow instructions.
- **Code Style**: Ensure JS Standard Style is followed (enforced via ESLint).
- **Quality Checklist**: 
  - [ ] Reviewed [CLAUDE.md](../.claude/CLAUDE.md) guidelines
  - [ ] Code passes ESLint (`npm run lint`) (skip if only `REFERENCES.md` or `SOLUTIONS.md` modified)
  - [ ] Tests pass (`npm run test:frontend`, `npm run test:server`, `npm run test:api`, `npm start & npm run test:e2e`) (skip if only `REFERENCES.md` or `SOLUTIONS.md` modified)
  - [ ] RSN passes if applicable (`npm run rsn`)
  - [ ] AI-generated noise cleaned up
  - [ ] Commits signed off (`git commit -s`)
  - [ ] PR based on `develop` branch with single scope

## Getting Help

- Review [CLAUDE.md](../.claude/CLAUDE.md) for detailed guidance
- Check the [Contribution Guide](../CONTRIBUTING.md)
- Refer to the [project documentation](https://pwning.owasp-juice.shop/)
- Connect with the community via Slack or GitHub issues

## Skills

- [add-reference skill](skills/add-reference/SKILL.md): Instructions for adding new blog posts, talks, or other references to `REFERENCES.md`
- [add-solution skill](skills/add-solution/SKILL.md): Instructions for adding new hacking guides, videos, or tools to `SOLUTIONS.md`
- [create-m3-theme skill](skills/create-m3-theme/SKILL.md): Instructions for creating new Angular Material M3 themes
- [verify-challenge skill](skills/verify-challenge/SKILL.md): Instructions for verifying new challenges fulfill all project requirements and metadata
- [verify-rsn-fix skill](skills/verify-rsn-fix/SKILL.md): Instructions for identifying and fixing broken RSN caused by code changes
- [generate-release-notes skill](skills/generate-release-notes/SKILL.md): Instructions for generating or completing release notes based on the project's iconography and structure

---

Remember: Junie is a productivity tool. You are responsible for the quality, correctness, and security of your contributions.
