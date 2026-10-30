# Review notes: PR #3 — [AI-draft] fix(deps): override decode-uri-component to 0.5.1

- **Branch:** `pf/ai-fix-cb034d7` · **Kind:** dependency (npm `overrides`)
- **Change:** `package.json` gains `"overrides": { "decode-uri-component": "^0.5.1" }` (3 lines)
- **Automated verification (PipelineFortress):** version spec ≥ fixed version ✅ · version exists on npm ✅ · dependency tree still resolves ✅

## Human review

| Question | Answer |
|---|---|
| Is the change correct on first review? | **No.** |
| Does it fix the reported advisory? | It would remove the vulnerable version from the tree, so the scanner finding would disappear. |
| Side effects or breaking changes? | **Yes, a runtime break.** `decode-uri-component` 0.5.x is ESM-only (`"type": "module"`, default export only). Its only consumer is `query-string@5.1.1`, reached via `download@8 → got@8 → cacheable-request → normalize-url → query-string`, and Juice Shop imports `download` in `lib/utils.ts`. `query-string` loads it with `require('decode-uri-component')` and calls the result as a function. Reproduced on Node 22: `require()` returns a module object, and the call fails with `TypeError: d is not a function`. |
| Did the LLM hallucinate anything? | No. The version is real; the mistake is a compatibility judgement that no automated check here covers (module format of the new version vs. how its dependents load it). |
| Decision | **Rejected (PR closed).** Proper fix: upgrade or replace the root dependency `download`, which pulls in this outdated chain. Until then, the finding stays in the reviewed baseline as an accepted risk (moderate severity, DoS only). |

## Lesson for the pipeline
"Version exists and the lockfile resolves" is not "the app still works". Two improvements follow:
1. The fix-PR verifier should flag a semver-major jump (0.x minor counts as major) and a change of module format (`"type": "module"`) for any package whose dependents are CommonJS.
2. The pipeline should run the application's unit tests on every AI-drafted PR, not only the security scans and the deploy health check.
