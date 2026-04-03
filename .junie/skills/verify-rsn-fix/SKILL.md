---
name: verify-rsn-fix
description: Instructions for identifying and fixing broken RSN (Refactoring Safety Net) caused by code changes in vulnerability snippets.
---

# Skill: Verifying and fixing RSN breaks

This skill provides instructions for identifying and fixing RSN (Refactoring Safety Net) breaks that occur when code is modified inside a `// vuln-code-snippet` block.

## What is RSN?

The RSN ensures that the code snippets shown in the application's coding challenges remain consistent with the actual source code. When a source file containing a `// vuln-code-snippet` block is modified, the Refactoring Safety Net between that snippet and its associated "codefix" files (used in the "Fix It" part of the challenge) might break.

## Detection

To check if your changes have broken the RSN, run:

```bash
npm run rsn
```

**IMPORTANT**: If you modify any code inside a `// vuln-code-snippet` block (like `chatbotGreedyInjectionChallenge` or `chatbotPromptInjectionChallenge`), you MUST run this command to ensure consistency across the project.

If it reports "New file diffs recognized since last lock!", you have broken the RSN for one or more challenges. The output will list the affected codefix files.

## How to Fix

**DO NOT** simply run `npm run rsn:update` unless you are absolutely sure the code change is intended to *only* affect the source file and not the coding challenge variations. Usually, a break means the codefix files are now out of sync and need manual adjustment.

### 1. Identify Affected Snippets
The `npm run rsn` output will list filenames like `challengeName_1_correct.ts` or `challengeName_2.ts`. These correspond to the snippet for `challengeName`.

### 2. Locate Source and Fix Files
- **Source Snippet**: Find the `// vuln-code-snippet start challengeName` block in the project (usually in `server.ts`, `routes/*.ts`, or `frontend/src/app/*.ts`).
- **Codefix Files**: Located in `data/static/codefixes/challengeName_*.ts`.

### 3. Apply Clean Fixes
Update all `data/static/codefixes/challengeName_*.ts` files to reflect the changes you made in the source file's snippet block. 

- If you changed a non-vulnerable line, update it identically in all codefix files.
- If you changed a vulnerable line, ensure the `_correct.ts` file reflects the *fixed* version, while the other files retain their respective (incorrect) "fixes" but adapted to the new code structure.

### 4. Verify
Run the RSN check again:

```bash
npm run rsn
```

If it passes with "No new file diffs recognized since last lock!", your fix is correct.

## Note
For more details about code snippets, codefix files, and the RSN, see the [OWASP Juice Shop Companion Guide](https://pwning.owasp-juice.shop/companion-guide/latest/part5/code-snippets.html).
