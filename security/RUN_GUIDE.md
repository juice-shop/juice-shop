# Run guide: get PipelineFortress working on your GitHub (about 3–4 hours, mostly waiting)

You need: a GitHub account, Git, Python 3.10+, and (for the optional local steps) Docker.
Windows users: run the `bash` commands in **Git Bash** or **WSL2**.

## Day 1: set up and first run

### 1. Fork and clone Juice Shop
1. Open https://github.com/juice-shop/juice-shop and click **Fork** (keep it public: code scanning
   and Actions minutes are free for public repos).
2. `git clone https://github.com/<you>/juice-shop.git && cd juice-shop`
   The default branch is **master**.

### 2. Add the PipelineFortress files
1. Unzip `PipelineFortress.zip` **into the root of the clone** (you should now see `security/`,
   `.github/workflows/pipelinefortress.yml` and `.semgrepignore` next to `server.ts`).
2. `bash security/scripts/setup_fork.sh` (disables upstream workflows, updates `.dockerignore`).
3. Commit and push:
   ```
   git add -A
   git commit -m "Add PipelineFortress DevSecOps pipeline"
   git push
   ```

### 3. Configure GitHub (5 minutes)
1. **Gemini key:** https://aistudio.google.com → *Get API key*. Then in your repo:
   Settings → Secrets and variables → Actions → *New repository secret* → `GEMINI_API_KEY`.
   Without a key the pipeline still runs, using an offline heuristic. The report then says so.
2. **Model (optional):** if the default `gemini-flash-lite-latest` errors, run
   `GEMINI_API_KEY=... PYTHONPATH=security/triage python -m pftriage models` locally, pick a Flash-Lite
   model, and add it as an Actions **variable** named `PF_LLM_MODEL`.
3. Settings → Actions → General → tick **Allow GitHub Actions to create and approve pull requests**.
4. Settings → Code security → enable **Code scanning** (default setup not needed; this lets the
   Semgrep SARIF appear in the Security tab).

### 4. First pipeline run
The push in step 2 started it: open the **Actions** tab → *PipelineFortress*. Expect 25–35 min
(the Docker build of Juice Shop is the slow part). On this first run every gate says
**report-only (no baseline yet)**. That is expected.

When it finishes, download the **pipelinefortress-report** artifact. Inside you'll find
`triage-out/dashboard.html` (open in a browser), `triage-out/triage.md` and `triage-out/evaluation.md`.

### 5. Accept the baseline (turns the gates on)
Actions → *PipelineFortress baseline PR* → **Run workflow**. Review the PR it opens (each entry is
an existing finding you are accepting as known debt) and merge it. The merge triggers a new run;
now every gate shows **passed**.

### 6. Make the gates actually block merges
Settings → Branches → *Add branch protection rule* for `master`:
- Require a pull request before merging (1 approval)
- Require status checks to pass: select `1 · Secrets (gitleaks)`, `2 · SAST (Semgrep)`,
  `3 · SCA (Trivy dependencies)`, `4 · IaC & policy-as-code (Checkov)`,
  `5 · Build, container scan, SBOM, deploy, DAST`

Screenshot this page for the report.

## Day 2: experiments and evidence

### 7. Seeded-vulnerability test (the "catch 80% before merge" evidence)
```
bash security/scripts/seed_vulns.sh
```
This opens a PR with 9 planted bugs. Wait for the run. You should see:
- the SAST, SCA and IaC jobs fail (red), and the Deploy step fail because Pod Security rejects the
  privileged container (defence in depth: worth a screenshot);
- a PR comment with the triage table and the **seeded catch-rate table**.

If GitHub push protection blocks the push because of the seeded `.env` file, that is a fourth
layer catching it. Note it in the report, then choose *allow* (the values are random).
Screenshot the PR checks and the comment, then **close the PR without merging** and delete the branch.

### 8. AI-drafted fix PRs
Actions → *PipelineFortress AI fix PRs* → **Run workflow**. It opens up to 2 **draft** PRs titled
`[AI-draft] ...`. For each one:
1. Read the diff and the *Automated verification* list in the PR body.
2. Click **Ready for review**: the full pipeline runs on the change.
3. Fill in the review notes: download the `ai-fix-prs` artifact, copy `prs/<id>_review.md` to
   `security/docs/pr-reviews/` and answer the questions honestly (is it correct, did it break
   anything, did the LLM invent anything).
4. Merge the ones that are correct; close the others with a comment explaining why.

Rubric: "at least one PR is actually correct on first review". The crypto-js `overrides` style of fix
usually is; a major-version upgrade (e.g. sanitize-html 1 → 2) usually breaks a Juice Shop challenge.
Both make good discussion points.

### 9. Check the ground-truth labels
Open `security/ground_truth.yaml`. Read each `why`, check it against the code it names, change any
label you disagree with, and put your name in `reviewed_by`. Push the change. The next run's
`evaluation.md` contains your FP/FN numbers.

### 10. Runtime baseline (Week 1 deliverable)
The DAST step writes `scans/runtime_baseline.md` (in the `scan-container-dast` artifact) from the
passive ZAP scan of the kind deployment. Copy it to `security/docs/runtime_baseline.md` and add your
notes. The full ZAP HTML report is in the same artifact (`zap/zap.html`).

## Optional: run locally (for the video demo)
```
bash security/scripts/kind_up.sh              # deploy to kind, open http://localhost:3000
bash security/scripts/local_scan.sh           # same scanners + triage + dashboard on your laptop
cd security/triage && pip install -r requirements-dev.txt -r requirements.txt && python -m pytest -q
```
The tests include the redaction leak tests (random fake secrets planted in every scanner field must
never appear in what is sent to the LLM). Good to show in the video.

## Where the report numbers come from

| Report item | Source |
|---|---|
| Findings per stage / severity | dashboard.html, *Findings by stage* table |
| Gate results, time to feedback | dashboard.html *Gates* table; Actions run durations |
| Seeded catch rate | PR comment / dashboard on the seeded PR run |
| Dedup ratio, LLM calls, redaction events | `triage-out/triage.json` (`counts`, `dedup_ratio`, `redaction_events`) |
| Precision, FP/FN, hallucinations | `triage-out/evaluation.md` |
| SBOM component count | step summary of job 5; `scans/sbom.cdx.json` |
| PR review outcomes | your `security/docs/pr-reviews/*.md` |

## Troubleshooting

| Symptom | Fix |
|---|---|
| Trivy: `TOOMANYREQUESTS` downloading the DB | Re-run the job; the DB is cached after the first success |
| Gemini `HTTP 404 model not found` | Set the `PF_LLM_MODEL` variable to a model from `pftriage models` |
| Gemini `HTTP 429` | Free-tier quota. The tool retries with backoff; otherwise wait or lower `--max-clusters` |
| Docker build out of memory / slow | Re-run; the build cache makes the second build much faster |
| `gh pr create` fails with 403 | Step 3.3 (allow Actions to create PRs) is not ticked |
| ZAP step: `zap.json` missing | The app did not start: check `deploy.log` in the artifact |
| Semgrep `--config p/...` fails | Transient registry error; re-run the job |
| An image tag no longer exists | Update the version in the `env:` block at the top of the workflow |
