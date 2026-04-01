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
  - [ ] Code passes ESLint (`npm run lint`)
  - [ ] Tests pass (`npm test`, `npm run test:api`, `npm run cypress:run`)
  - [ ] RSN passes if applicable (`npm run rsn`)
  - [ ] AI-generated noise cleaned up
  - [ ] Commits signed off (`git commit -s`)
  - [ ] PR based on `develop` branch with single scope

## Getting Help

- Review [CLAUDE.md](../.claude/CLAUDE.md) for detailed guidance
- Check the [Contribution Guide](../CONTRIBUTING.md)
- Refer to the [project documentation](https://pwning.owasp-juice.shop/)
- Connect with the community via Slack or GitHub issues

---

Remember: Junie is a productivity tool. You are responsible for the quality, correctness, and security of your contributions.
