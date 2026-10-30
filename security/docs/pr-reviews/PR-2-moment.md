# Review notes: PR #2 — [AI-draft] fix(deps): override moment to resolve multiple vulnerabilities

- **Branch:** `pf/ai-fix-ca4d898` · **Kind:** dependency (npm `overrides`)
- **Change:** `package.json` gains `"overrides": { "moment": "^2.29.2" }` (3 lines)
- **Automated verification (PipelineFortress):** version spec ≥ the version that fixes the reported advisories ✅ · version exists on npm ✅ · dependency tree still resolves ✅

## Human review

| Question | Answer |
|---|---|
| Is the change correct on first review? | **Yes.** |
| Does it fix the reported advisories? How verified? | The vulnerable copy is `moment@2.0.0`, nested under `express-jwt → jsonwebtoken@0.1.0` (`~2.0.0`). The top-level `moment` is already 2.31.0. The override forces the nested copy onto the 2.x line (`^2.29.2` resolves to the latest 2.x), which contains the fixes for all reported moment ReDoS / path-traversal advisories. Checked in the resolved lockfile. |
| Side effects or breaking changes? | moment 2.x keeps backward compatibility; only the legacy JWT library uses the nested copy. The full pipeline ran on the PR after "Ready for review", including the kind deployment where the app must start and answer its health check: **all 7 checks passed** (secrets, SAST, SCA, IaC, build + container scan + SBOM + deploy + DAST, GenAI triage, code scanning). |
| Did the LLM hallucinate anything? | No invented ids or versions: the version exists on npm and every advisory id in the PR body was in the scanner data (output guard: 0 hallucinations). One inaccuracy: the PR text says the upgrade "crosses multiple major versions", but 2.0.0 → 2.29.x stays on major version 2. Overstated risk, not a functional error. |
| Decision | **Merged.** |

## Note from the first attempt
The first AI-fix run proposed `moment ^2.11.2` and `sanitize-html ^1.4.3`. Both passed every automated check, but review showed the tool picked the *lowest* fixed version, which closes only the oldest advisory of a package. The version selection was changed to "the lowest version that fixes **all** reported advisories" (unit-tested), and this PR is from the corrected run.
