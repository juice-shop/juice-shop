# Challenge Verification Checklist

Use this checklist to verify a new challenge contribution.

## 1. Metadata (`challenges.yml`)
- [ ] `name` is unique and follows title case.
- [ ] `key` is unique, camelCase, and ends with `Challenge`.
- [ ] `category` matches an existing category or has a new one defined.
- [ ] `description` is concise and uses appropriate HTML (if any).
- [ ] `difficulty` is assigned (1-6) and seems appropriate.
- [ ] `mitigationUrl` (if any) points to a relevant OWASP Cheat Sheet.
- [ ] `hints` (if any) are between 2 and 7.
- [ ] `tags` (if any) are from the allowed list.
- [ ] `disabledEnv` (if any) lists valid environments (`Docker`, `Heroku`, `Gitpod`, `Windows`).

## 2. Configuration & CTF
- [ ] `config.schema.yml` contains the challenge `key` under `ctf.countryMapping`.
- [ ] `config/fbctf.yml` contains the challenge `key` with unique `name` and alpha-2 ISO `code`.

## 3. Translations (`en.json`)
- [ ] New category/tag has `LABEL` and `DESCRIPTION` entries.
- [ ] Translation keys follow `CATEGORY_...` or `TAG_...` format.

## 4. Hacking Instructor (if `tutorial` is set)
- [ ] Script file exists in `frontend/src/hacking-instructor/challenges/`.
- [ ] Script follows the companion guide style.
- [ ] Script is tested and works.

## 5. Coding Challenge (if applicable)
- [ ] `<challengeKey>.info.yml` exists with `fixes` and `hints`.
- [ ] `<challengeKey>_1_correct.ts` (or `.sol`) exists.
- [ ] At least 2-3 vulnerable variants exist (`_2.ts`, `_3.ts`, etc.).

## 6. Tests
- [ ] New/existing tests for this challenge are wrapped in `utils.isChallengeEnabled` if `disabledEnv` is present.
- [ ] All tests pass locally.

## 7. Consistency & Quality
- [ ] No typos in names, descriptions, or hints.
- [ ] No duplicate or near-duplicate challenges in terms of logic or description.
- [ ] Mitigation URL is the most relevant OWASP Cheat Sheet available.
