# DevSecOps CI/CD Pipeline - Team Guide

## 🎯 Approach

**Strategy**: BUILD ON the existing pipeline, don't delete it.

**What you'll do:**

1. **Keep** `.github/workflows/ci.yml` as reference
2. Each member creates their own workflow file (no merge conflicts!)
3. **Som orchestrates** everything in `security-enhanced.yml`
4. **Document** your changes

### **Modular Workflow Architecture**

```
.github/workflows/
├── ci.yml                    ← Original (don't touch)
├── security-enhanced.yml     ← Som orchestrates HERE
├── sast-scan.yml            ← Truong works HERE
├── dast-scan.yml            ← Truong works HERE
├── container-scan.yml       ← Dat works HERE
├── dependency-scan.yml      ← Hoang Anh works HERE
└── deploy.yml               ← Kien works HERE
```

**How it works:**

- Each member edits ONLY their own file(s)
- Som calls everyone's workflows from `security-enhanced.yml`
- No merge conflicts!
- Easy to test individually

---

## 👥 Team Collaboration (6 Members)

### **1. Git Workflow**

```
main (protected)
  └── dev (team's working branch)
      ├── feature/kien
      ├── feature/truong
      ├── feature/som
      ├── feature/hoang_anh
      ├── feature/ha
      └── feature/dat
```

**Rules:**

- ✅ Each member works on their own feature branch
- ✅ All changes go through Pull Requests
- ✅ At least 1 other team member reviews each PR
- ✅ Merge to `dev` branch, not `main`
- ✅ Test on `dev` before merging to `main`

### **2. Daily Workflow**

```bash
# 1. Update your branch
git checkout dev
git pull origin dev

# 2. Work on your feature
git checkout feature/your-name
git merge dev  # Get latest changes

# 3. Make changes and commit
git add .
git commit -m "feat: describe your change"

# 4. Push and create PR
git push origin feature/your-name
# Then create PR: dev ← feature/your-name
```

## 👤 Team Roles & Responsibilities

### **Som** - Pipeline Lead & Orchestration

**Main Tasks:**

- Set up and maintain `.github/workflows/security-enhanced.yml` (orchestration file)
- Call each team member's workflow using `workflow_call`
- Configure job dependencies and execution order
- Implement security gate logic
- Coordinate deployment triggers
- Ensure all workflows work together smoothly

**Your Workflow File:**

- `.github/workflows/security-enhanced.yml` (orchestration only)

**Reference:**

- `.github/workflows/ci.yml` (original pipeline)

---

### **Truong** - SAST + DAST

**Main Tasks:**

- Implement Semgrep scanning (SAST)
- Configure SonarCloud/SonarQube analysis (SAST)
- Set up secret scanning with TruffleHog (SAST)
- Configure OWASP ZAP for dynamic scanning (DAST)
- Set up API security testing (DAST)
- Add `continue-on-error: true` to all scanning steps

**Your Workflow Files:**

- `.github/workflows/sast-scan.yml` (your SAST tools)
- `.github/workflows/dast-scan.yml` (your DAST tools)

**Tools:**

- **SAST**: Semgrep, SonarCloud, TruffleHog
- **DAST**: OWASP ZAP, API testing tools

---

### **Dat** - Container & Image Security

**Main Tasks:**

- Implement Trivy container scanning
- Configure Grype vulnerability scanning
- Add Hadolint for Dockerfile linting
- Scan Docker images for vulnerabilities
- Add `continue-on-error: true` to all scanning steps

**Your Workflow File:**

- `.github/workflows/container-scan.yml` (your container tools)

**Tools:**

- Trivy
- Grype
- Hadolint

---

### **Hoang Anh** - Dependency & SBOM Management

**Main Tasks:**

- Set up OWASP Dependency-Check
- Configure Snyk dependency scanning
- Generate and validate SBOM (Software Bill of Materials)
- Track license compliance
- Add `continue-on-error: true` to all scanning steps

**Your Workflow File:**

- `.github/workflows/dependency-scan.yml` (your dependency tools)

**Tools:**

- OWASP Dependency-Check
- Snyk
- CycloneDX (SBOM)
- License checker

---

### **Kien** - Deployment & Continuous Delivery (CD)

**Main Tasks:**

- Set up AWS deployment infrastructure (EC2/App Runner/Elastic Beanstalk)
- Create deployment workflow with staging and production environments
- Implement two-stage deployment (dev→staging, main→production)
- Configure AWS credentials in GitHub Secrets
- Set up health checks and monitoring
- Handle deployment success/failure notifications

**Your Workflow File:**

- `.github/workflows/deploy.yml` (your deployment automation)

**Deployment Strategy:**

- **Staging**: Auto-deploy when `dev` branch passes security gate
- **Production**: Auto-deploy when merged to `main` branch
- **Security Gate**: Deploy even with findings (warn only, for educational app)

**Tools:**

- AWS (EC2/App Runner/Elastic Beanstalk - choose one)
- GitHub Actions
- AWS CLI
- GitHub Environments

---

### **Ha** - Documentation

**Main Tasks:**

- Document all pipeline changes
- Create architecture diagrams (before/after)
- Set up monitoring and reporting
- Prepare demo and presentation materials
- Coordinate team documentation

**Deliverables:**

- Complete documentation
- Architecture diagrams
- Security tool comparison matrix
- Demo script and materials

---

## 📝 Quick Reference

**Workflow Files (Who Edits What):**

| File                    | Owner     | Purpose                 |
| ----------------------- | --------- | ----------------------- |
| `security-enhanced.yml` | Som       | Orchestrates everything |
| `sast-scan.yml`         | Truong    | Static analysis tools   |
| `dast-scan.yml`         | Truong    | Dynamic analysis tools  |
| `container-scan.yml`    | Dat       | Container security      |
| `dependency-scan.yml`   | Hoang Anh | Dependencies & SBOM     |
| `deploy.yml`            | Kien      | AWS deployment          |

**Key Commands:**

```bash
npm start              # Run the app
npm test               # Run tests
git checkout dev       # Switch to dev branch
git pull origin dev    # Update from remote
```

**Branch Names:**

- `main` - Protected production branch
- `dev` - Team's working branch
- `feature/som`, `feature/truong`, `feature/dat`, `feature/hoang_anh`, `feature/kien`, `feature/ha` - Individual branches
