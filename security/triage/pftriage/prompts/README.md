# Prompt library

| File | Used by | Purpose |
|---|---|---|
| `triage_system.md` + `triage_user.md` | `pftriage triage` | Classify clusters (TP / likely FP / needs review), 3–5 line fix |
| `fix_dependency_system.md` | `pftriage draft-prs` | Draft an npm upgrade PR for a vulnerable dependency |
| `fix_config_system.md` | `pftriage draft-prs` | Draft a Kubernetes / Dockerfile hardening PR for a failed Checkov policy |
| `policy_explain_system.md` | `pftriage explain-policies` | Stretch goal: plain-English "policy bot" explanation in the PR comment |

## Design rules applied in every prompt

1. **Structured output only.** Every prompt asks for a fixed JSON shape so the output guard
   (`guard.py`) can validate it mechanically. Free text is never acted on.
2. **Ground in the input.** The model may only cite CVE/GHSA/CWE ids and versions that exist
   in the scanner data it was given. `guard.py` enforces this and flags violations as
   hallucinations.
3. **Untrusted data is fenced.** Scanner text (advisory titles, rule messages) comes from third
   parties and could contain prompt-injection text. It is placed between explicit markers and
   the system prompt says to treat it as data.
4. **An explicit refusal path.** Fix prompts include `{"refuse": true}` so the model has a safe
   way out instead of guessing. Secrets are never sent, so there is nothing to leak, but the
   refusal path is also checked by the guard.
5. **Low temperature (0.1)** for repeatable triage between runs.

## Versioning

Prompts are versioned with the repository. When a prompt changes, re-run
`pftriage evaluate` and record the precision / recall in the report so changes are measured,
not guessed.
