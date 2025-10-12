# How Workflows Trigger - Complete Guide

## 🎯 Understanding the Workflow System

Yes, you understood it correctly! Here's exactly how it works:

---

## 📊 Workflow Trigger Matrix

### **Individual Member Workflows:**

| Member        | Their File(s)                      | Triggers When               | What Runs                          |
| ------------- | ---------------------------------- | --------------------------- | ---------------------------------- |
| **Truong**    | `sast-scan.yml`<br>`dast-scan.yml` | Push to `feature/truong`    | ONLY Truong's SAST + DAST scans    |
| **Dat**       | `container-scan.yml`               | Push to `feature/dat`       | ONLY Dat's container scans         |
| **Hoang Anh** | `dependency-scan.yml`              | Push to `feature/hoang_anh` | ONLY Hoang Anh's dependency scans  |
| **Kien**      | `deploy.yml`                       | Push to `feature/kien`      | ONLY Kien's deployment (test mode) |

### **Orchestrated Pipeline (Som):**

| Branch        | What Runs                                | Result                   |
| ------------- | ---------------------------------------- | ------------------------ |
| `feature/som` | **FULL PIPELINE**                        | Som tests integration    |
| `dev`         | **FULL PIPELINE** → Deploy to Staging    | Team integration testing |
| `main`        | **FULL PIPELINE** → Deploy to Production | Final deployment         |
| PR to `dev`   | **FULL PIPELINE** (no deployment)        | Review before merge      |

---

## 🔄 Complete Flow Diagram

### **Phase 1: Individual Development**

```
Truong works on SAST:
  git checkout feature/truong
  Edit: sast-scan.yml
  git push origin feature/truong
      ↓
  ✅ ONLY sast-scan.yml runs
  ✅ Tests Semgrep, SonarCloud, TruffleHog
  ✅ Fast feedback (5-10 min)
  ✅ No other workflows triggered

Dat works on Containers:
  git checkout feature/dat
  Edit: container-scan.yml
  git push origin feature/dat
      ↓
  ✅ ONLY container-scan.yml runs
  ✅ Tests Trivy, Grype, Hadolint
  ✅ Fast feedback
  ✅ Independent from others

(Same for Hoang Anh and Kien)
```

### **Phase 2: Som Tests Integration**

```
Som orchestrates:
  git checkout feature/som
  Edit: security-enhanced.yml
  git push origin feature/som
      ↓
  🚀 FULL PIPELINE RUNS:
      ├── run-sast (calls sast-scan.yml)
      ├── run-dast (calls dast-scan.yml)
      ├── run-container-scan (calls container-scan.yml)
      ├── run-dependency-scan (calls dependency-scan.yml)
      ↓
      security-gate (evaluates all)
      ↓
      deploy-staging (if branch = dev, but this is feature/som so skipped)
```

### **Phase 3: Integration on Dev**

```
Everyone merges to dev:
  PR: feature/truong → dev (merged)
  PR: feature/dat → dev (merged)
  PR: feature/hoang_anh → dev (merged)
  PR: feature/kien → dev (merged)
  PR: feature/som → dev (merged)
      ↓
  Push to dev branch
      ↓
  🚀 FULL PIPELINE RUNS + DEPLOYMENT:
      ├── All security scans
      ├── Security gate
      └── Deploy to AWS Staging ✅
```

---

## ⚙️ Configuration Details

### **Individual Workflow Files** (Truong, Dat, Hoang Anh, Kien)

```yaml
# Example: sast-scan.yml (Truong's file)
name: "SAST Scanning"

on:
  workflow_call: # ← Som can call this

  workflow_dispatch: # ← Manual trigger button

  push:
    branches:
      - feature/truong # ← Runs when Truong pushes

jobs:
  semgrep:
    # Truong's tools here
```

**What this means:**

- ✅ Truong pushes to `feature/truong` → His workflow runs independently
- ✅ Som's pipeline calls it → It runs as part of full pipeline
- ✅ Manual button → Can test anytime

### **Orchestration File** (Som)

```yaml
# security-enhanced.yml (Som's file)
name: "Enhanced Security Pipeline"

on:
  push:
    branches:
      - dev # ← Full pipeline + deploy to staging
      - main # ← Full pipeline + deploy to production
      - feature/som # ← Som tests full integration

  pull_request:
    branches:
      - dev # ← Full pipeline (no deployment)

  workflow_dispatch: # ← Manual test button

jobs:
  run-sast:
    uses: ./.github/workflows/sast-scan.yml # Call Truong
    secrets: inherit

  run-dast:
    uses: ./.github/workflows/dast-scan.yml # Call Truong
    secrets: inherit

  # ... calls everyone else

  security-gate:
    needs: [run-sast, run-dast, run-container-scan, run-dependency-scan]
    # Som's gate logic

  deploy-staging:
    needs: [security-gate]
    if: github.ref == 'refs/heads/dev' # ONLY on dev branch
    uses: ./.github/workflows/deploy.yml
```

---

## 🧪 Testing Scenarios

### **Scenario 1: Truong Testing SAST**

```bash
# Truong's workflow
git checkout feature/truong
vim .github/workflows/sast-scan.yml
git add .github/workflows/sast-scan.yml
git commit -m "feat: add Semgrep configuration"
git push origin feature/truong

# Result:
✅ sast-scan.yml runs (5 min)
❌ dast-scan.yml does NOT run
❌ container-scan.yml does NOT run
❌ security-enhanced.yml does NOT run
✅ Fast feedback for Truong
```

### **Scenario 2: Som Testing Integration**

```bash
# Som tests full pipeline
git checkout feature/som
vim .github/workflows/security-enhanced.yml
git add .github/workflows/security-enhanced.yml
git commit -m "feat: update security gate logic"
git push origin feature/som

# Result:
✅ security-enhanced.yml triggers
✅ Calls sast-scan.yml (Truong's work)
✅ Calls dast-scan.yml (Truong's work)
✅ Calls container-scan.yml (Dat's work)
✅ Calls dependency-scan.yml (Hoang Anh's work)
✅ Runs security gate
❌ Does NOT deploy (not dev/main branch)
✅ Som sees full integration (20-30 min)
```

### **Scenario 3: Team Testing on Dev**

```bash
# After everyone merges to dev
git checkout dev
git push origin dev

# Result:
✅ FULL PIPELINE runs
✅ All security scans
✅ Security gate evaluates
✅ Deploys to AWS Staging
✅ Everyone sees it working together
```

---

## 🚀 If You Want Feature Branches to Run Full Pipeline

**Option**: Add this to Som's `security-enhanced.yml`:

```yaml
on:
  push:
    branches:
      - dev
      - main
      - feature/** # ← Run on ALL feature branches
```

**But I don't recommend this because:**

- ❌ Slower development (wait 20-30 min each push)
- ❌ Uses more Actions minutes
- ❌ Overkill during individual development

**Instead, use this approach:**

```yaml
on:
  push:
    branches:
      - dev
      - main
      - feature/som # Only Som triggers full pipeline

  workflow_dispatch: # Anyone can click "Run workflow" button manually
```

**This gives you:**

- ✅ Som can test integration on `feature/som`
- ✅ Anyone can manually trigger full pipeline from GitHub UI
- ✅ Auto-runs on `dev` and `main`
- ✅ Fast individual testing on other feature branches

---

## 🎮 Manual Trigger (For Testing Integration)

**Any team member can test full pipeline manually:**

1. Go to GitHub → Actions tab
2. Click "Enhanced Security Pipeline"
3. Click "Run workflow" button
4. Select your branch
5. Click green "Run workflow"

**Boom!** Full pipeline runs on your branch without changing triggers.

---

## 📋 Summary: How It Works

### **Correct Understanding:**

✅ **YES**: Each member has their own branch  
✅ **YES**: Each works on their own workflow file  
✅ **YES**: Each can test independently on their branch  
✅ **YES**: Som orchestrates everyone's work  
✅ **YES**: Som integrates everything in `dev` and `main`

### **Trigger Setup:**

```yaml
Individual workflows (Truong, Dat, Hoang Anh, Kien):
  on:
    workflow_call: # Called by Som
    push:
      - feature/their-name # Test independently

Som's orchestration (security-enhanced.yml):
  on:
    push:
      - dev # Auto-run + deploy staging
      - main # Auto-run + deploy production
      - feature/som # Som tests integration
    workflow_dispatch: # Manual trigger for anyone
```

### **Testing Strategy:**

| Phase            | Who         | Branch         | What Runs                      | Duration  |
| ---------------- | ----------- | -------------- | ------------------------------ | --------- |
| **Individual**   | Each member | `feature/name` | Only their workflow            | 5-10 min  |
| **Integration**  | Som         | `feature/som`  | Full pipeline (no deploy)      | 20-30 min |
| **Team Testing** | Anyone      | `dev`          | Full pipeline + staging deploy | 30-40 min |
| **Production**   | Anyone      | `main`         | Full pipeline + prod deploy    | 30-40 min |

---

## 🎯 Recommended Workflow

### **Week 1-2: Individual Development**

```bash
# Truong develops SAST
feature/truong → Only SAST runs → Quick feedback

# Dat develops Container Scanning
feature/dat → Only container scans run → Quick feedback

# Som can test anytime
feature/som → Full pipeline runs → Integration check
```

### **Week 2-3: Integration**

```bash
# Everyone creates PRs to dev
feature/truong → PR → dev
feature/dat → PR → dev
# etc.

# When merged, full pipeline runs on dev
# Tests everything together + deploys to staging
```

### **Week 3-4: Production Ready**

```bash
# Final merge to main
dev → PR → main

# Full pipeline + deploy to production
```

---

## ✅ Your Setup is Perfect!

**Current configuration:**

- ✅ Individual workflows test independently
- ✅ Som can test full integration on `feature/som`
- ✅ Full pipeline runs on `dev` and `main`
- ✅ Manual trigger available for anyone
- ✅ No wasted Actions minutes

**You DON'T need to change anything!** The setup is optimal for your team. 🎯

---

## 📞 Quick Answer to Your Question

**Q: "How can I set it up so that feature/\* push will run the coordinating pipeline?"**

**A: Three options:**

**Option 1** (Current - Recommended): ⭐

- Only `feature/som` triggers full pipeline
- Others test their workflow only
- Anyone can use manual trigger button
- **Best for development speed**

**Option 2** (If you want):

- Change Som's file to: `- feature/**`
- ALL feature branches run full pipeline
- **Slower but more integration testing**

**Option 3** (Hybrid):

- Keep current setup
- Use manual "Run workflow" button when you need full pipeline
- **Best of both worlds**

**My recommendation: Keep Option 1** (current setup) and use the manual trigger button when team members want to test full integration.

---

**Does this clear everything up? The setup you have now is exactly what I'd recommend! 🚀**
