# Security Project — OWASP Juice Shop 

* **Branch:** `security_project` (original fork baseline kept intact on `master`)
* **Purpose:** Exploit each vulnerability and screenshot it, fix its source code then retest it, and test it with WAF only without the fixes 
## Fixed Vulnerabilities

| Member | Vulnerability | Modified File(s) | Status |
| :--- | :--- | :--- | :--- |
| Doha | *SSRF* | | inprogress |


## Evidence & Fixes 

### 1. [SSRF] (FOR EXAMPLE)
* **Issue:** Briefly explain what was vulnerable and how it was exploited.
* **Fix:** Explain what was changed in the code to patch it.
* **Proof:**
| Before (Exploit) | After fixing | WAF Only (No Code Fix) |
  | :---: | :---: | :---: |
  | ![Before](./screenshots/vuln1-before.png) | ![After](./screenshots/vuln1-after.png) | ![WAF Only](./screenshots/vuln1-waf.png) |
- **Code Comparison:**
  | Vulnerable Code (Old) | fixed Code (New) |
  | :---: | :---: |
  | ![Old Code](./screenshots/vuln1-old-code.png) | ![New Code](./screenshots/vuln1-new-code.png) |


