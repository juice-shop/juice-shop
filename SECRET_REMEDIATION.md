### Secret Detection & Remediation Workflow

#### **Detection**
1. Cycode scans all PRs via:
   - **Secrets PR Scan** (enabled in repo settings)
   - **GitHub integration**
2. Alerts appear in:
   - Cycode Violations dashboard
   - GitHub PR comments

#### **Remediation Steps**
1. **Immediate Action**:
   ```bash
   # Revoke the exposed token via GitHub API
   curl -X DELETE -H "Authorization: token ghp_legitadmintoken" \
   https://api.github.com/applications/YOUR_CLIENT_ID/token \
   -d '{"access_token":"ghp_yourtokenhere"}'
   ```

2. **Clean Git History**:
   ```bash
   # Remove secret from all commits
   git filter-repo --path secrets.env --force
   git push origin main --force
   ```

3. **Prevention**:
   - Add `secrets.env` to `.gitignore`
   - Use GitHub Secrets for CI/CD
   - Enable branch protection rules

#### **Automation (Optional)**
```python
# Sample script to auto-revoke tokens (run in CI/CD)
import requests
import os

token = os.getenv('GITHUB_TOKEN')
headers = {'Authorization': f'token {token}'}
response = requests.delete(
    'https://api.github.com/applications/CLIENT_ID/token',
    json={'access_token': 'EXPOSED_TOKEN'},
    headers=headers
)
print(response.status_code)
```
