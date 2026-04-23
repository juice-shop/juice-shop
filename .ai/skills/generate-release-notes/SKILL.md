---
name: generate-release-notes
description: Instructions for generating or completing release notes based on the project's iconography and structure.
---

# Skill: Generating or Completing Release Notes

This skill provides instructions for Junie to create release notes from scratch or complete existing draft release notes for OWASP Juice Shop. It follows the established structure, iconography, and formatting patterns of the project based on an analysis of the last 20 releases.

## Workflow

1.  **Gather Information**:
    *   Identify the last released tag: `git describe --tags --abbrev=0`
    *   List all commits since the last tag: `git log <last_tag>..HEAD --oneline`
    *   Find PRs and external contributors: `git log <last_tag>..HEAD --pretty=format:"%h %s (%an)"`
    *   Check for version/dependency changes: `git diff <last_tag>..HEAD -- package.json`
    *   Check for product/user changes: `git diff <last_tag>..HEAD -- config/default.yml`
    *   Check for challenge changes: `git diff <last_tag>..HEAD -- data/static/challenges.yml` (or relevant challenge files)
    *   Check for configuration changes: `git diff <last_tag>..HEAD -- config.schema.yml`
    *   Check for UI/Frontend changes: `git diff <last_tag>..HEAD -- frontend/src/app`
    *   Check for I18N updates: `git diff <last_tag>..HEAD -- i18n`
2.  **Categorize & Iconize Changes**:
    *   Map changes to the correct section with its corresponding emoji:
        *   `👟 Runtime`: Node.js version support, core library changes (e.g., XML parser).
        *   `🎯 Challenges`: New or updated challenges.
        *   `🎨 User Interface` / `🎨 UI`: Visual changes, accessibility, UI enhancements.
        *   `🅰️ Frontend`: Angular/Material version updates.
        *   `🐳 Docker`: Image updates, base image changes, size reductions.
        *   `🐛 Bugfixes`: Fixed issues (mention PR/issue numbers if available).
        *   `🌐 I18N`: Translation updates, new languages.
        *   `🧹 Technical Debt` / `🧹 Housekeeping` / `🧹 Technical Debt Reduction`: Refactorings, code quality improvements.
        *   `🔧 Configuration` / `⚙️ DevOps Automation`: Settings, new/removed config options, CI/CD.
        *   `🛒 Shop` / `🛒 Product Inventory`: New products/users.
        *   `👨‍🏫 Tutorials`: New or updated hacking instructors/tutorials.
        *   `🏗️ Build Process`: Release pipeline, build scripts, asset generation.
        *   `📜 Policy`: Licensing, security policy, or Code of Conduct changes.
        *   `🆘 Hints`: Challenge hints.
        *   `🔥 Hotfix`: Urgent fixes for production issues.
        *   `🕵️ Cheat Detection`: Changes to cheat scoring/logic.
        *   `👮 Startup Validations`: Boot/environment checks.
    *   Use **Status Icons** to mark specific types of changes:
        *   `⚡`: Significant changes to challenges that might break CTF setups or solutions.
        *   `⚠️`: Technical breaking changes (Node.js version, renamings, config removal).
        *   `📜`: Policy or licensing changes.
        *   `⭐`: Challenge difficulty levels (e.g., `⭐⭐-challenge`).
3.  **Format the Notes**:
    *   Start with a blockquote disclaimer if there are `⚡`, `⚠️`, or `📜` changes.
    *   Use `*` for bullet points.
    *   Add `(kudos to @username)` at the end of lines for external contributors (check PR descriptions or commit logs).
    *   Reference PRs as `#number` and commits as hashes where appropriate.
4.  **Review and Refine**:
    *   Compare with the `release-notes-checklist.md`.
    *   Ensure all significant changes found in step 1 are covered.

## Templates

Refer to specific templates for different release types:
- [Major/Breaking Release](types/major.md)
- [Minor/Feature Release](types/minor.md)
- [Patch/Hotfix Release](types/hotfix.md)

## Completing Existing Release Notes

When a user submits existing release notes to complete:
1.  Check if any sections are missing based on the gathered information.
2.  Add missing iconography (emojis) and check if disclaimers are appropriate.
3.  Standardize the "kudos to @username" format if incomplete.
4.  Ensure all sections follow the correct order (Runtime, Frontend, Challenges, UI, etc.).

## Draft Release Creation (Optional)

If `gh` CLI is available and the environment has appropriate tokens, a draft release can be created or updated using:
`gh release create <tag> --title "<tag>" --notes-file <file> --draft`
Otherwise, provide the markdown content for manual creation on GitHub.
