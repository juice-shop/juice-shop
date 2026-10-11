---
name: verify-rsn-fix
description: Instructions for identifying and fixing broken RSN (Refactoring Safety Net) caused by code changes in vulnerability snippets.
---

# Skill: Verifying and fixing RSN breaks

This skill provides instructions for identifying and fixing RSN (Refactoring Safety Net) breaks that occur when code is modified inside a `// vuln-code-snippet` block.

## Repository Targets & Scope

- **Source Files**: Application files containing snippet markers (e.g., `server.ts`, `routes/*.ts`, `lib/*.ts`, `frontend/src/app/**/*.ts`).
- **Codefix Files**: `data/static/codefixes/<challengeName>_*.ts` (or `.sol`).
- **RSN Cache**: `rsn/cache.json` (locked diffs state).

## Source-of-Truth & Data Handling Rules

- **Snippet Baseline**: The source code enclosed between `// vuln-code-snippet start <challengeKey>` and `// vuln-code-snippet end <challengeKey>` is the canonical baseline.
- **Fix Variations**: `data/static/codefixes/<challengeKey>_1_correct.ts` must reflect the properly secured version of the snippet, while `_2.ts`, `_3.ts`, etc., represent flawed/incomplete fixes.

## Change Boundaries

- **Allowed Changes**:
  - Updating code lines inside `data/static/codefixes/<challengeKey>_*.ts` to mirror source code refactorings.
  - Running `npm run rsn:update` only when intentional baseline changes are confirmed.
- **Forbidden Changes**:
  - Running `npm run rsn:update` to blindly silence RSN failures without updating codefixes.
  - Modifying RSN infrastructure scripts (`rsn/rsnUtil.ts`, `rsn/rsn.ts`).
  - Altering application code outside the designated snippet boundaries.

## Ambiguity & Unmappable Source Handling

- **Drastic Structural Refactorings**: If a code change fundamentally changes the function signature or logic such that existing fix variants become nonsensical, consult the challenge design or prompt the user before rewriting the coding challenge options.
- **Snippet Marker Preservation**: Never remove or rename `// vuln-code-snippet start/end` comments without updating `data/static/challenges.yml` and related tests.

## What is RSN?

The RSN ensures that the code snippets shown in the application's coding challenges remain consistent with the actual source code. When a source file containing a `// vuln-code-snippet` block is modified, the Refactoring Safety Net between that snippet and its associated "codefix" files (used in the "Fix It" part of the challenge) might break.

## Detection

To check if your changes have broken the RSN, run:

```bash
npm run rsn
```

**IMPORTANT**: If you modify any code inside a `// vuln-code-snippet` block (like `chatbotGreedyInjectionChallenge` or `chatbotPromptInjectionChallenge`), you MUST run this command to ensure consistency across the project.

If it reports "Refactoring Safety Net check failed", you have broken the RSN for one or more challenges. The output will list the affected codefix files with diffs.

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

If it passes with "All codefix files match the locked state", your fix is correct.

## Verification Expectations

- **RSN Integrity Check**: Execute `npm run rsn` and confirm it outputs `All codefix files match the locked state` with a zero exit code.
- **Code Style Compliance**: Run `npm run lint` on all modified source snippet files and `data/static/codefixes/*.ts` files.
- **Unit & Integration Tests**: Run `npm run test:server` or `npm run test:api` to verify that refactored source snippets continue to function correctly.

## Note
For more details about code snippets, codefix files, and the RSN, see the [OWASP Juice Shop Companion Guide](https://pwning.owasp-juice.shop/companion-guide/latest/part5/code-snippets.html).
