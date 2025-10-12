# Workflow Collaboration Guide

## 🏗️ Modular Workflow Architecture

Each team member works on their **own workflow file** to avoid merge conflicts!

```
.github/workflows/
├── ci.yml                    ← Original (DON'T TOUCH)
│
├── security-enhanced.yml     ← Som orchestrates HERE
│   ├─calls─> sast-scan.yml          ← Truong works here
│   ├─calls─> dast-scan.yml          ← Truong works here
│   ├─calls─> container-scan.yml     ← Dat works here
│   ├─calls─> dependency-scan.yml    ← Hoang Anh works here
│   └─calls─> deploy.yml             ← Kien works here
```

---

## 👥 How Each Member Works

### **Som (Pipeline Lead) - The Orchestrator**

**Your File**: `security-enhanced.yml`

**What you do:**

```yaml
jobs:
  run-sast:
    uses: ./.github/workflows/sast-scan.yml # Call Truong's workflow
    secrets: inherit

  run-dast:
    uses: ./.github/workflows/dast-scan.yml # Call Truong's workflow
    secrets: inherit

  run-container-scan:
    uses: ./.github/workflows/container-scan.yml # Call Dat's workflow
    secrets: inherit

  security-gate:
    needs: [run-sast, run-dast, run-container-scan, run-dependency-scan]
    # Your logic here

  deploy-staging:
    needs: [security-gate]
    uses: ./.github/workflows/deploy.yml # Call Kien's workflow
    with:
      environment: staging
```

**You DON'T write** the actual scanning/deployment logic - you just coordinate!

---

### **Truong (SAST + DAST) - Two Files**

**Your Files**: `sast-scan.yml`, `dast-scan.yml`

**What you do in `sast-scan.yml`:**

```yaml
name: "SAST Scanning"

on:
  workflow_call: # Som calls this
  push:
    branches:
      - feature/truong # Test your changes

jobs:
  semgrep:
    steps:
      - name: Run Semgrep
        uses: returntocorp/semgrep-action@v1
        continue-on-error: true # ← ADD THIS to pass even if issues found
```

**What you do in `dast-scan.yml`:**

```yaml
name: "DAST Scanning"

on:
  workflow_call: # Som calls this
  push:
    branches:
      - feature/truong

jobs:
  zap-scan:
    steps:
      - name: Start app and run ZAP
        continue-on-error: true # ← ADD THIS
```

**Testing your work:**

```bash
# 1. Make changes to your files
# 2. Commit to feature/truong
git add .github/workflows/sast-scan.yml
git add .github/workflows/dast-scan.yml
git commit -m "feat: add SAST and DAST scanning"
git push origin feature/truong

# 3. Your workflows will run automatically on feature/truong
# 4. Check GitHub Actions tab to see results
```

---

### **Dat (Container Security) - One File**

**Your File**: `container-scan.yml`

**What you do:**

```yaml
name: "Container Security Scanning"

on:
  workflow_call: # Som calls this
  push:
    branches:
      - feature/dat # Test your changes

jobs:
  trivy-scan:
    steps:
      - name: Build and scan
        continue-on-error: true # ← ADD THIS
        run: |
          docker build -t juice-shop:scan .
          trivy image juice-shop:scan
```

**Testing:**

```bash
git add .github/workflows/container-scan.yml
git commit -m "feat: add Trivy scanning"
git push origin feature/dat
# Check Actions tab
```

---

### **Hoang Anh (Dependency & SBOM) - One File**

**Your File**: `dependency-scan.yml`

**What you do:**

```yaml
name: "Dependency & SBOM Scanning"

on:
  workflow_call: # Som calls this
  push:
    branches:
      - feature/hoang_anh # Test your changes

jobs:
  snyk-scan:
    steps:
      - name: Run Snyk
        continue-on-error: true # ← ADD THIS
        uses: snyk/actions/node@master
```

---

### **Kien (Deployment) - One File**

**Your File**: `deploy.yml`

**What you do:**

```yaml
name: "Deployment to AWS"

on:
  workflow_call:
    inputs:
      environment: # Som passes this
        required: true
        type: string

jobs:
  deploy-to-aws:
    steps:
      - name: Deploy
        run: |
          # Your AWS deployment commands
```

**Testing:**

```bash
git add .github/workflows/deploy.yml
git commit -m "feat: add AWS deployment"
git push origin feature/kien
```

---

## ✅ Making Scans Pass (continue-on-error)

```yaml
jobs:
  your-scan-job:
    steps:
      - name: Run your scanning tool
        uses: some-action@v1
        continue-on-error: true # ← ADD THIS LINE
        with:
          # your configuration

      - name: Upload results
        if: always() # ← ADD THIS to upload even if scan failed
        uses: actions/upload-artifact@v4
```

**Why `continue-on-error: true`?**

- ✅ Scans find issues (expected - app is vulnerable!)
- ✅ Pipeline continues anyway
- ✅ Green checkmarks in GitHub Actions
- ✅ Reports still generated
- ✅ Deployment can proceed

**Without it:**

- ❌ Scan finds HIGH/CRITICAL issues
- ❌ Job fails, pipeline stops
- ❌ No deployment
- ❌ Red X in GitHub
