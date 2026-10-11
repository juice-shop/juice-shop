---
name: verify-challenge
description: Instructions for verifying new challenges fulfill all project requirements and metadata.
---

# Skill: Verifying a New Challenge

This skill provides a comprehensive workflow and checklist for verifying that a newly added challenge fulfills all necessary preconditions, metadata requirements, and project conventions in OWASP Juice Shop.

## Repository Targets & Scope

- `data/static/challenges.yml` (Challenge registry and metadata)
- `models/challenge.ts` (`CHALLENGE_KEYS` array export)
- `config/fbctf.yml` (`ctf.countryMapping` country allocations)
- `frontend/src/assets/i18n/en.json` (Category and tag English labels/descriptions)
- `frontend/src/hacking-instructor/challenges/*.ts` (Interactive tutorial scripts)
- `data/static/codefixes/` (`.info.yml`, `_1_correct.ts`, and variation snippets)
- `test/cypress/e2e/*.spec.ts` (E2E solve test specifications)

## Source-of-Truth & Data Handling Rules

- **Challenge Registry**: `data/static/challenges.yml` is the primary source of truth for challenge keys, categories, difficulties, and tags.
- **Key Validation Schema**: `models/challenge.ts` (`CHALLENGE_KEYS`) is the authoritative source for valid challenge identifiers used across runtime schemas.
- **External Mitigations**: OWASP Cheat Sheet Series documentation is the canonical external source of truth for mitigation links.

## Change Boundaries

- **Allowed Changes**:
  - Adding or correcting challenge entries in `data/static/challenges.yml`.
  - Registering new challenge keys in `models/challenge.ts`.
  - Adding country code mappings in `config/fbctf.yml`.
  - Adding English translation keys for new categories/tags in `frontend/src/assets/i18n/en.json`.
  - Adding tutorial scripts in `frontend/src/hacking-instructor/challenges/`.
  - Adding codefix snippets in `data/static/codefixes/`.
  - Adding and gating Cypress E2E solve tests.
- **Forbidden Changes**:
  - Renaming or removing existing challenges without explicit maintainer directive.
  - Directly modifying non-English `i18n/*.json` files (must be managed via Crowdin).
  - Weakening or disabling test assertions.

## Ambiguity & Unmappable Source Handling

- **Key Format Standardization**: All challenge keys must be camelCase ending with `Challenge` (e.g. `forgedFeedbackChallenge`).
- **Country Mapping Conflicts**: If an ISO country name or code is already allocated in `config/fbctf.yml`, select an unassigned ISO 3166-1 alpha-2 country.
- **Missing Mitigation Sheet**: If no dedicated OWASP Cheat Sheet exists, link to the relevant OWASP Top 10 or OWASP ASVS section.

## General Workflow

1.  **Analyze the Challenge Definition**: Review the new entry in `data/static/challenges.yml`.
2.  **Verify Configuration**: Check if the challenge is correctly represented in `lib/config.schema.ts` and `config/fbctf.yml`.
3.  **Check Translations**: Ensure labels and descriptions for any new categories or tags are present in `frontend/src/assets/i18n/en.json`.
4.  **Review Supporting Assets**:
    -   Verify Hacking Instructor scripts (if applicable).
    -   Verify Coding Challenge files (if applicable).
5.  **Audit Tests**: Ensure tests properly handle `disabledEnv` constraints.
6.  **Report Findings**: Summarize any missing or incorrect metadata, broken setups, or inconsistencies.

---

## 1. Challenges YAML (`data/static/challenges.yml`)

Each entry in `challenges.yml` must adhere to the following rules:

-   **Uniqueness**: Both `name` and `key` must be unique across all challenges.
-   **Key Format**: The `key` should be camelCase and typically end with `Challenge` (e.g., `loginAdminChallenge`).
-   **Category**: Must be an existing category (see `en.json`) or a new one.
    -   Existing categories: `Broken Access Control`, `Broken Anti Automation`, `Broken Authentication`, `Cryptographic Issues`, `Improper Input Validation`, `Injection`, `Insecure Deserialization`, `Miscellaneous`, `Security Misconfiguration`, `Security through Obscurity`, `Sensitive Data Exposure`, `Unvalidated RedirectS`, `Vulnerable Components`, `XSS`, `XXE`, `Observability Failures`.
-   **Difficulty**: An integer between 1 and 6.
-   **Description**:
    -   Can contain basic HTML (e.g., `<i>`, `<code>`, `<a>`).
    -   Must be clear and concise, consistent with existing challenge descriptions.
    -   Avoid duplicates (similar description/category to other challenges).
-   **Hints**:
    -   **Maximum**: 6-7 hints.
    -   **Average**: 3-5 hints are preferred.
    -   **Content**: Should gradually lead the user to the solution without revealing it.
-   **Mitigation URL**:
    -   If present it must be an OWASP resource.
    -   **OWASP Cheat Sheet** is strongly preferred if a relevant one exists for the challenge's scope.
-   **Tags**:
    -   Optional. Existing tags: `Danger Zone`, `Good for Demos`, `Prerequisite`, `OSINT`, `Contraption`, `Shenanigans`, `Tutorial`, `Brute Force`, `Good Practice`, `Code Analysis`, `Web3`, `With Coding Challenge`, `AI / LLM`.
-   **Disabled Environments (`disabledEnv`)**:
    -   Values: `Docker`, `Heroku`, `Windows`.
    -   Used for challenges that are technically incompatible or too dangerous for certain environments (e.g., RCE).

---

## 2. Configuration (`lib/config.schema.ts` & `config/fbctf.yml`)

The challenge must be integrated into the CTF mode configuration:

### `lib/config.schema.ts`
-   The challenge `key` must be added to the `CHALLENGE_KEYS` array in `models/challenge.ts` (which is the source of truth for the `ctf.countryMapping` record keys).

### `config/fbctf.yml`
-   An entry for the challenge `key` must be added under `ctf.countryMapping`.
-   Each entry needs a `name` (Country) and a `code` (ISO 3166-1 alpha-2 or similar).
-   **Uniqueness**: Both the country `name` and `code` must be unique in this file to avoid conflicts in CTF frameworks.

---

## 3. Translations (`frontend/src/assets/i18n/en.json`)

If the challenge introduces a **new category** or a **new tag**:

-   **Category**: Add `CATEGORY_<UPPER_CASE_NAME>` and `CATEGORY_<UPPER_CASE_NAME>_DESCRIPTION`.
-   **Tag**: Add `TAG_<UPPER_CASE_NAME>` and `TAG_<UPPER_CASE_NAME>_DESCRIPTION`.
-   Replace spaces with underscores in the `<UPPER_CASE_NAME>` (e.g., `Good for Demos` -> `GOOD_FOR_DEMOS`).

---

## 4. Hacking Instructor Scripts

If `tutorial` is specified in `challenges.yml`:

-   A script must exist in `frontend/src/hacking-instructor/challenges/`.
-   The script filename should match the challenge `key` (sometimes without the `Challenge` suffix).
-   **Rules**:
    -   Follow [Tutorials Guide](https://pwning.owasp-juice.shop/companion-guide/latest/part5/tutorials.html).
    -   Use `highlight` and `text` steps effectively.
    -   Must be consistent in tone and complexity with existing scripts.

---

## 5. Coding Challenges

If the challenge has an associated coding challenge:

-   Files must be present in `data/static/codefixes/`.
-   **Required Files**:
    -   `<challengeKey>.info.yml`: Contains `fixes` (explanations) and `hints`.
    -   `<challengeKey>_1_correct.ts`: The fixed version of the code snippet.
    -   `<challengeKey>_2.ts`, `<challengeKey>_3.ts`, etc.: Vulnerable variations.
-   **Rules**:
    -   Follow [Code Snippets Guide](https://pwning.owasp-juice.shop/companion-guide/latest/part5/code-snippets.html).
    -   Explanations for both correct and incorrect fixes must be clear.

---

## 6. Testing Requirements

-   Every new/changed challenge **must** have a Cypress E2E test proving it can be solved. This skill only verifies that such a test **exists** and is correctly gated; for **how to author** the E2E solve test (and unit/API tests), follow the [write-tests skill](../write-tests/SKILL.md).
-   If the challenge has `disabledEnv` set, the corresponding API or Cypress tests **must** be wrapped in an enablement check:
    ```typescript
    if (utils.isChallengeEnabled(challenges.myNewChallenge)) {
      it('should solve my new challenge...', () => {
        // test logic
      })
    }
    ```
-   Import `utils` from `../../lib/utils` and `challenges` from `../../data/datacache` (or similar depending on the test type).

---

## Verification Expectations

- **Checklist Audit**: Must run through and verify against `.ai/skills/verify-challenge/checklists/challenge-checklist.md`.
- **Linting Compliance**: Run `npm run lint` to ensure schema, script, and test code match JS Standard Style.
- **Server and API Tests**: Run `npm run test:server` and `npm run test:api` to verify server-side challenge registration and logic.
- **Cypress E2E Solve Verification**: Execute `npm start & npm run test:e2e` for the specific challenge test to verify that the challenge is solvable.
- **RSN Verification (if codefixes included)**: Run `npm run rsn` to ensure codefix files accurately align with source code snippets.

## Inferred Rules & Best Practices

-   **Consistency**: Challenge names should be evocative but not overly long. Description and hints should follow the established style (sentence case, punctuation).
-   **HTML Sanitization**: Ensure HTML tags in descriptions are properly closed.
-   **Duplicate Detection**: Before adding a challenge, search existing ones for similar names, categories, or descriptions to ensure it adds unique value.
-   **Difficulty Calibration**:
    -   1: Trivial (no tools needed).
    -   2-3: Intermediate (basic tools like DevTools or Burp/ZAP needed).
    -   4-5: Advanced (sophisticated bypasses, scripting, or deep research).
    -   6: Expert (multi-step, obscure vulnerabilities, or high technical hurdle).
