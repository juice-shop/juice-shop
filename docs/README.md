# Team Documentation Index

## 📚 Start Here

New to the project? **Read these files in order:**

### 1️⃣ **TEAM_SUMMARY.md** ← **START HERE** (5 min read)

- Quick overview of team structure
- Pipeline flow diagram
- File ownership table
- What `continue-on-error` does

### 2️⃣ **HOW_WORKFLOWS_TRIGGER.md** (10 min read)

- How each member tests independently
- When full pipeline runs
- Manual trigger options
- Complete testing strategy

### 3️⃣ **PROJECT_KICKOFF.md** (15 min read)

- Complete role descriptions
- Git workflow
- Detailed responsibilities for each member

### 4️⃣ **WORKFLOW_COLLABORATION.md** (10 min read)

- How modular workflows work
- Testing your workflow independently
- Som's orchestration explained
- Troubleshooting common issues

### 5️⃣ **TEAM_QUICK_START.md** (Reference)

- Daily commands
- Emergency fixes
- Success checklist

---

## 👥 Quick Role Lookup

**"What's my file?"**

- **Som**: `security-enhanced.yml` (orchestration)
- **Truong**: `sast-scan.yml`, `dast-scan.yml` (SAST + DAST)
- **Dat**: `container-scan.yml` (containers)
- **Hoang Anh**: `dependency-scan.yml` (dependencies)
- **Kien**: `deploy.yml` (AWS deployment)
- **Ha**: `docs/` folder (documentation)

---

## 🔑 Key Concepts

### **Modular Workflows**

Each member edits their own `.yml` file → Som calls them all → No merge conflicts!

### **continue-on-error**

Add this to scanning steps so pipeline passes even when vulnerabilities are found.

### **Security Gate**

Evaluates all scan results → Approves deployment with warnings → Deploys to AWS.

### **Two-Stage Deployment**

`dev` branch → AWS Staging (automatic)  
`main` branch → AWS Production (automatic)

---

## 🚀 Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/YOUR-TEAM/juice-shop.git

# 2. Create your branch
git checkout -b feature/your-name

# 3. Create your workflow file
# See your role in TEAM_SUMMARY.md

# 4. Add continue-on-error to scans
# See examples in ANSWERS_TO_QUESTIONS.md

# 5. Test and push
git push origin feature/your-name
```

---

## 📊 Workflow Files Created

**Already created for you:**

- ✅ `sast-scan.yml` - Template for Truong
- ✅ `dast-scan.yml` - Template for Truong
- ✅ `container-scan.yml` - Template for Dat
- ✅ `dependency-scan.yml` - Template for Hoang Anh
- ✅ `deploy.yml` - Template for Kien
- ✅ `security-enhanced.yml` - Template for Som

**You need to:**

- Customize the tools and parameters
- Add your specific configurations
- Test on your feature branch

---

## 🆘 Need Help?

1. **General questions**: Read `TEAM_SUMMARY.md`
2. **How workflows trigger**: Read `HOW_WORKFLOWS_TRIGGER.md`
3. **Role questions**: Read `PROJECT_KICKOFF.md`
4. **Workflow collaboration**: Read `WORKFLOW_COLLABORATION.md`
5. **Still stuck**: Ask Som (pipeline lead) or create GitHub issue

---

## 📁 Documentation Structure

```
docs/
├── README.md                      ← This file (index)
├── TEAM_SUMMARY.md                ← Quick overview & pipeline flow
├── HOW_WORKFLOWS_TRIGGER.md       ← Workflow testing guide
├── PROJECT_KICKOFF.md             ← Roles & responsibilities
├── WORKFLOW_COLLABORATION.md      ← Collaboration guide
└── TEAM_QUICK_START.md            ← Quick reference

.github/workflows/
├── security-enhanced.yml          ← Som's orchestration
├── sast-scan.yml                  ← Truong's SAST
├── dast-scan.yml                  ← Truong's DAST
├── container-scan.yml             ← Dat's containers
├── dependency-scan.yml            ← Hoang Anh's dependencies
└── deploy.yml                     ← Kien's deployment
```

---

## 🎯 Success Criteria

Your project is successful when:

- [ ] All 6 workflow files working
- [ ] Each scan completes (with `continue-on-error`)
- [ ] Security gate evaluates and approves
- [ ] Staging deploys automatically from `dev`
- [ ] Production deploys automatically from `main`
- [ ] All security reports generated
- [ ] Live AWS deployment accessible
- [ ] Complete documentation
- [ ] Demo ready with live deployment

---

**Ready to start? Read `TEAM_SUMMARY.md` next! 🚀**
