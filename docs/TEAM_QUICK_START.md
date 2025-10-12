# DevSecOps Team - Quick Start Guide

## 🎯 Our Goal

Enhance OWASP Juice Shop's CI/CD pipeline with security tools - **BUILD ON** the existing pipeline, don't replace it.

---

## 👥 Team Structure (6 Members)

| Member        | Role                       | Main Tools                         |
| ------------- | -------------------------- | ---------------------------------- |
| **Som**       | Pipeline Lead              | GitHub Actions, Workflow YAML      |
| **Truong**    | App Security (SAST + DAST) | Semgrep, SonarCloud, OWASP ZAP     |
| **Dat**       | Container & Image Security | Trivy, Grype, Hadolint             |
| **Hoang Anh** | Dependency & SBOM          | OWASP Dependency-Check, Snyk, SBOM |
| **Kien**      | Deployment & CD            | AWS, GitHub Actions CD             |
| **Ha**        | Documentation              | Diagrams, Reports, Demo            |

---

## 🌳 Git Workflow

```
main (protected)
  └── dev (our working branch)
      ├── feature/kien
      ├── feature/truong
      ├── feature/som
      ├── feature/hoang_anh
      ├── feature/ha
      └── feature/dat
```

### Daily Commands

```bash
# 1. Update dev branch
git checkout dev
git pull origin dev

# 2. Work on your feature
git checkout feature/your-name
git merge dev

# 3. Make changes
git add .
git commit -m "feat: your change description"

# 4. Push and create PR
git push origin feature/your-name
# Then: PR from feature/your-name → dev
```

---

## 📁 Key Files (Modular Approach)

### **Workflow Files** - Each member has their own!

| File                    | Owner         | What's Inside                   |
| ----------------------- | ------------- | ------------------------------- |
| `security-enhanced.yml` | **Som**       | Orchestrates all workflows      |
| `sast-scan.yml`         | **Truong**    | Semgrep, SonarCloud, TruffleHog |
| `dast-scan.yml`         | **Truong**    | OWASP ZAP, API security tests   |
| `container-scan.yml`    | **Dat**       | Trivy, Grype, Hadolint          |
| `dependency-scan.yml`   | **Hoang Anh** | OWASP DC, Snyk, SBOM            |
| `deploy.yml`            | **Kien**      | AWS deployment                  |

**No merge conflicts!** Each member edits only their file(s).

### **Documentation Files**

| File                 | Purpose                            |
| -------------------- | ---------------------------------- |
| `ci.yml`             | Original pipeline (reference only) |
| `PROJECT_KICKOFF.md` | Roles & responsibilities           |
| `TEAM_README.md`     | Detailed reference                 |

---

## 🚀 First Day Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR-TEAM/juice-shop.git
cd juice-shop

# 2. Run setup script
.\team-setup.ps1    # Windows
# or
./team-setup.sh     # Linux/Mac

# 3. Create your branch
git checkout -b feature/your-name

# 4. Test it works
npm start
# Visit: http://localhost:3000
```

---

## ✅ What Each Member Does

### Som (Pipeline Lead)

**Your File**: `security-enhanced.yml`

- Orchestrate all workflows using `workflow_call`
- Configure job execution order and dependencies
- Implement security gate evaluation logic
- Trigger deployments based on security results
- No merge conflicts with team members!

### Truong (SAST + DAST)

**Your Files**: `sast-scan.yml`, `dast-scan.yml`

- Implement Semgrep, SonarCloud, TruffleHog (SAST)
- Configure OWASP ZAP for running app scanning (DAST)
- Set up API security testing (DAST)
- Add `continue-on-error: true` to all tools

### Dat (Container Security)

**Your File**: `container-scan.yml`

- Implement Trivy for image vulnerabilities
- Add Grype for additional scanning
- Configure Hadolint for Dockerfile best practices
- Add `continue-on-error: true` to all tools

### Hoang Anh (Dependency & SBOM)

**Your File**: `dependency-scan.yml`

- Set up OWASP Dependency-Check
- Configure Snyk dependency scanning
- Generate SBOM with CycloneDX
- Check license compliance
- Add `continue-on-error: true` to all tools

### Kien (Deployment & CD)

**Your File**: `deploy.yml`

- Set up AWS infrastructure (choose: EC2/App Runner/Elastic Beanstalk)
- Configure two-stage deployment (staging from `dev`, production from `main`)
- Set up AWS credentials in GitHub Secrets
- Implement health checks
- Handle deployment notifications

### Ha (Documentation)

**Your Work**: `docs/` folder

- Document each team member's work
- Create before/after architecture diagrams
- Compile security findings into reports
- Write demo script and presentation materials
- Generate final project documentation

---

## ⚠️ Important Rules

1. ✅ **DO**: Work on your feature branch
2. ✅ **DO**: Merge to `dev` branch, not `main`
3. ✅ **DO**: Get PR review before merging
4. ❌ **DON'T**: Edit `.github/workflows/ci.yml` (it's the original)
5. ❌ **DON'T**: Try to "fix" vulnerable dependencies (they're intentional!)
6. ❌ **DON'T**: Commit secrets/tokens (use GitHub Secrets)

---

## 🆘 Getting Help

**Within Team:**

- Create GitHub Issue and tag relevant member
- Ask in team chat
- Review `TEAM_README.md` for details

**Technical Issues:**

- Check the original pipeline: `.github/workflows/ci.yml`
- Read tool documentation (links in `TEAM_README.md`)
- Test locally before pushing

---

## 📊 Success Checklist

- [ ] All 6 members have commits in `dev` branch
- [ ] At least 6 security tools working (SAST, DAST, Container, Dependency, SBOM)
- [ ] Pipeline runs on every push to `dev`
- [ ] All tools generate reports
- [ ] Staging deployment working (auto-deploy from `dev`)
- [ ] Production deployment configured (from `main`)
- [ ] Documentation complete
- [ ] Demo ready with live deployment

---

**Your Branch:** `feature/your-name`  
**Target Branch:** `dev`  
**Main Work File:** `.github/workflows/security-enhanced.yml`

**Read More:** See `PROJECT_KICKOFF.md` for detailed roles and `TEAM_README.md` for full reference.
