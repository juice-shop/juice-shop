# 🔒 Full Security Scan Report — OWASP Juice Shop

**Date:** 2026-03-23
**Scanner:** Claude Code Security Audit
**Files Analyzed:** 95
**Mode:** Full codebase audit

## Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 9 |
| 🟠 High | 14 |
| 🟡 Medium | 14 |
| 🟢 Low | 11 |
| **Total** | **48** |

## Findings

### 🔴 VULN-001: SQL Injection in Product Search via String Interpolation

- **Severity:** CRITICAL | **Confidence:** HIGH
- **File:** `routes/search.ts` (lines 23-23)
- **CWE:** CWE-89 | **OWASP:** A03:2021 Injection

**Description:** User-supplied query parameter `req.query.q` is directly interpolated into a raw SQL query string. The 200-character truncation does not prevent exploitation. An attacker can perform UNION-based injection to extract all database tables and data including user credentials.

**Vulnerable Code:**
```
models.sequelize.query(`SELECT * FROM Products WHERE ((name LIKE '%${criteria}%' OR description LIKE '%${criteria}%') AND deletedAt IS NULL) ORDER BY name`)
```

**Attack Vector:** GET /rest/products/search?q=')) UNION SELECT sql,2,3,4,5,6,7,8,9 FROM sqlite_master--

**Remediation:** Use parameterized queries with Sequelize bind parameters: `models.sequelize.query('SELECT * FROM Products WHERE name LIKE :criteria', { replacements: { criteria: `%${criteria}%` } })`

---

### 🔴 VULN-002: SQL Injection in Login via String Interpolation

- **Severity:** CRITICAL | **Confidence:** HIGH
- **File:** `routes/login.ts` (lines 34-34)
- **CWE:** CWE-89 | **OWASP:** A03:2021 Injection

**Description:** User-supplied `req.body.email` is directly interpolated into a raw SQL query. While `password` is hashed before interpolation (mitigating injection through that parameter), the `email` field allows full SQL injection, enabling authentication bypass and data extraction.

**Vulnerable Code:**
```
models.sequelize.query(`SELECT * FROM Users WHERE email = '${req.body.email || ''}' AND password = '${security.hash(req.body.password || '')}' AND deletedAt IS NULL`
```

**Attack Vector:** POST /rest/user/login with body: {"email": "' OR 1=1--", "password": "anything"}

**Remediation:** Use parameterized queries with Sequelize bind parameters: `models.sequelize.query('SELECT * FROM Users WHERE email = ? AND password = ? AND deletedAt IS NULL', { replacements: [req.body.email, security.hash(req.body.password)] })`

---

### 🔴 VULN-003: Remote Code Execution via Unsafe Eval in B2B Order Processing

- **Severity:** CRITICAL | **Confidence:** HIGH
- **File:** `routes/b2bOrder.ts` (lines 21-23)
- **CWE:** CWE-94 | **OWASP:** A03:2021 Injection

**Description:** User-supplied `body.orderLinesData` is evaluated using `notevil` (safeEval) inside a Node.js VM context. The `notevil` library has known sandbox escape vulnerabilities (CVE-2017-16226), and the `vm` module is explicitly documented as not a security mechanism. An attacker can escape the sandbox and execute arbitrary code on the server.

**Vulnerable Code:**
```
const sandbox = { safeEval, orderLinesData }
vm.createContext(sandbox)
vm.runInContext('safeEval(orderLinesData)', sandbox, { timeout: 2000 })
```

**Attack Vector:** POST /b2b/v2/orders with body: {"orderLinesData": "(function(){var process=this.constructor.constructor('return this')().process;return process.mainModule.require('child_process').execSync('id').toString()})()"}

**Remediation:** Remove the use of eval/safeEval entirely. Parse `orderLinesData` as JSON with `JSON.parse()` and validate the structure with a schema validator like Joi or Zod.

---

### 🔴 VULN-004: XML External Entity (XXE) Injection in File Upload

- **Severity:** CRITICAL | **Confidence:** HIGH
- **File:** `routes/fileUpload.ts` (lines 81-83)
- **CWE:** CWE-611 | **OWASP:** A05:2021 Security Misconfiguration

**Description:** XML parsing with `noent: true` enables external entity processing, allowing an attacker to read arbitrary files from the server filesystem (e.g., /etc/passwd) or cause denial of service via entity expansion (Billion Laughs attack). The parsed XML content is reflected in the error response.

**Vulnerable Code:**
```
const sandbox = { libxml, data }
vm.createContext(sandbox)
const xmlDoc = vm.runInContext('libxml.parseXml(data, { noblanks: true, noent: true, nocdata: true })', sandbox, { timeout: 2000 })
```

**Attack Vector:** Upload an XML file containing: <!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>

**Remediation:** Disable external entity processing by removing `noent: true` from the parseXml options, or use `noent: false` explicitly.

---

### 🔴 VULN-005: Hardcoded RSA Private Key for JWT Signing

- **Severity:** CRITICAL | **Confidence:** HIGH
- **File:** `lib/insecurity.ts` (lines 23-23)
- **CWE:** CWE-798 | **OWASP:** A07:2021 Identification and Authentication Failures

**Description:** The RSA private key used for JWT token signing is hardcoded directly in the source code. Combined with the public key also in source (line 22), any attacker with access to the code can forge arbitrary JWT tokens, impersonate any user (including admins), and completely bypass authentication.

**Vulnerable Code:**
```
const privateKey = '-----BEGIN RSA PRIVATE KEY-----\r\nMIICXAIBAAKBgQDNwqLEe9wgTXCbC7+RPdDbBbeqjdbs4kOPOIGzqLpXvJXlxxW8iMz0EaM4BKU...'
```

**Attack Vector:** Extract the private key from the source code, use it to sign a JWT with `{"data":{"id":1,"email":"admin@juice-sh.op","role":"admin"}}` and send it as Bearer token.

**Remediation:** Move the private key to environment variables or a secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault). Load it at runtime via `process.env.JWT_PRIVATE_KEY`.

---

### 🟠 VULN-006: NoSQL Injection via $where Clause in Order Tracking

- **Severity:** HIGH | **Confidence:** HIGH
- **File:** `routes/trackOrder.ts` (lines 18-18)
- **CWE:** CWE-943 | **OWASP:** A03:2021 Injection

**Description:** User-supplied `req.params.id` is interpolated into a MongoDB `$where` clause, which evaluates JavaScript. Despite the 60-character truncation, an attacker can inject JavaScript to manipulate the query logic and extract data from all orders.

**Vulnerable Code:**
```
db.ordersCollection.find({ $where: `this.orderId === '${id}'` })
```

**Attack Vector:** GET /rest/track-order/' || true || '   — returns all orders in the database.

**Remediation:** Replace the `$where` clause with a standard MongoDB query: `db.ordersCollection.find({ orderId: id })`

---

### 🟠 VULN-007: Reflected XSS in Order Tracking Response

- **Severity:** HIGH | **Confidence:** HIGH
- **File:** `routes/trackOrder.ts` (lines 15-22)
- **CWE:** CWE-79 | **OWASP:** A03:2021 Injection

**Description:** When the reflectedXssChallenge is enabled, the `id` parameter is only truncated to 60 characters instead of being sanitized. The unsanitized `id` is then returned directly in the JSON response as `orderId`. If the response is rendered by the frontend without escaping, this enables reflected XSS.

**Vulnerable Code:**
```
const id = !utils.isChallengeEnabled(challenges.reflectedXssChallenge) ? String(req.params.id).replace(/[^\w-]+/g, '') : utils.trunc(req.params.id, 60)
...
if (result.data[0] === undefined) {
  result.data[0] = { orderId: id }
}
```

**Attack Vector:** GET /rest/track-order/<iframe src="javascript:alert(`xss`)">

**Remediation:** Always apply the strict regex sanitization `String(req.params.id).replace(/[^\w-]+/g, '')` regardless of challenge state, or sanitize the output before returning it in the response.

---

### 🟠 VULN-008: Server-Side Request Forgery via Profile Image URL Upload

- **Severity:** HIGH | **Confidence:** HIGH
- **File:** `routes/profileImageUrlUpload.ts` (lines 24-24)
- **CWE:** CWE-918 | **OWASP:** A10:2021 Server-Side Request Forgery

**Description:** User-supplied `req.body.imageUrl` is passed directly to `fetch()` without any URL validation or allowlisting. An attacker can make the server issue requests to internal services, cloud metadata endpoints (e.g., 169.254.169.254), or localhost services, potentially leaking sensitive data.

**Vulnerable Code:**
```
const response = await fetch(url)
```

**Attack Vector:** POST /profile/image/url with body: {"imageUrl": "http://169.254.169.254/latest/meta-data/iam/security-credentials/"}

**Remediation:** Implement URL allowlisting to restrict fetching to trusted domains. Block private/internal IP ranges (127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16). Validate that the URL scheme is https.

---

### 🟠 VULN-009: Path Traversal via Poison Null Byte in File Server

- **Severity:** HIGH | **Confidence:** HIGH
- **File:** `routes/fileServer.ts` (lines 27-33)
- **CWE:** CWE-22 | **OWASP:** A01:2021 Broken Access Control

**Description:** The file extension allowlist check (`.md`, `.pdf`) is performed before the null byte is stripped. An attacker can request a file like `package.json.bak%00.md` — it passes the `.md` extension check, then `cutOffPoisonNullByte` strips everything after `%00`, resulting in access to `package.json.bak`. This bypasses the file type restriction and allows downloading arbitrary files from the `ftp/` directory.

**Vulnerable Code:**
```
if (file && (endsWithAllowlistedFileType(file) || (file === 'incident-support.kdbx'))) {
  file = security.cutOffPoisonNullByte(file)
  ...
  res.sendFile(path.resolve('ftp/', file))
}
```

**Attack Vector:** GET /ftp/package.json.bak%2500.md

**Remediation:** Strip the null byte BEFORE performing the file extension check, not after. Also consider using a strict allowlist of permitted filenames rather than extension checking.

---

### 🟠 VULN-010: Open Redirect via Substring Matching Bypass

- **Severity:** HIGH | **Confidence:** HIGH
- **File:** `lib/insecurity.ts` (lines 135-141)
- **CWE:** CWE-601 | **OWASP:** A01:2021 Broken Access Control

**Description:** The redirect allowlist check uses `url.includes()` which checks if the allowed URL appears anywhere in the input string. An attacker can construct a URL like `https://evil.com?https://github.com/juice-shop/juice-shop` which passes the check because it contains the allowed URL as a substring, but redirects to the attacker's domain.

**Vulnerable Code:**
```
export const isRedirectAllowed = (url: string) => {
  let allowed = false
  for (const allowedUrl of redirectAllowlist) {
    allowed = allowed || url.includes(allowedUrl)
  }
  return allowed
}
```

**Attack Vector:** GET /redirect?to=https://evil.com?https://github.com/juice-shop/juice-shop

**Remediation:** Use `url.startsWith(allowedUrl)` or parse both URLs and compare the hostname/origin explicitly.

---

### 🟠 VULN-011: Zip Slip Path Traversal in File Upload

- **Severity:** HIGH | **Confidence:** HIGH
- **File:** `routes/fileUpload.ts` (lines 41-45)
- **CWE:** CWE-22 | **OWASP:** A01:2021 Broken Access Control

**Description:** The zip entry's `fileName` is used to construct a file write path. While there is a check that `absolutePath.includes(path.resolve('.'))`, this is easily bypassed since `path.resolve('.')` returns the current working directory, and any absolute path starting with that prefix (including `../../` paths that resolve within it) will pass. A malicious zip with entries like `../../ftp/legal.md` can overwrite arbitrary files.

**Vulnerable Code:**
```
const fileName = entry.path
const absolutePath = path.resolve('uploads/complaints/' + fileName)
challengeSolveIf(...)
if (absolutePath.includes(path.resolve('.'))) {
  entry.pipe(fs.createWriteStream('uploads/complaints/' + fileName)...)
```

**Attack Vector:** Upload a zip file containing an entry with path `../../ftp/legal.md` to overwrite the legal document.

**Remediation:** Use `absolutePath.startsWith(path.resolve('uploads/complaints/'))` to ensure the resolved path stays within the intended directory. Reject any entry with `..` in the path.

---

### 🟡 VULN-012: IDOR in Data Export Allows Exporting Other Users' Memories

- **Severity:** MEDIUM | **Confidence:** HIGH
- **File:** `routes/dataExport.ts` (lines 26-26)
- **CWE:** CWE-639 | **OWASP:** A01:2021 Broken Access Control

**Description:** The data export endpoint queries memories using `req.body.UserId` instead of the authenticated user's ID (`loggedInUser.data.id`). An attacker can supply a different UserId in the request body to export another user's memories, despite the endpoint requiring authentication.

**Vulnerable Code:**
```
memories = await MemoryModel.findAll({ where: { UserId: req.body.UserId } })
```

**Attack Vector:** POST /rest/user/data-export with body: {"UserId": 1} while logged in as a different user, to retrieve admin's memories.

**Remediation:** Replace `req.body.UserId` with `loggedInUser.data.id` to ensure users can only export their own data.

---

### 🟡 VULN-013: MD5 Hash Used for Password Storage

- **Severity:** MEDIUM | **Confidence:** HIGH
- **File:** `lib/insecurity.ts` (lines 43-43)
- **CWE:** CWE-328 | **OWASP:** A02:2021 Cryptographic Failures

**Description:** MD5 is used to hash passwords. MD5 is cryptographically broken, susceptible to collision attacks, and extremely fast to brute-force. The `hash()` function is used in `login.ts:34` to hash passwords before database comparison, confirming this is the password hashing mechanism. No salt is applied.

**Vulnerable Code:**
```
export const hash = (data: string) => crypto.createHash('md5').update(data).digest('hex')
```

**Attack Vector:** If the database is compromised (e.g., via SQL injection in VULN-001/002), all password hashes can be reversed using rainbow tables or GPU-accelerated brute force in seconds.

**Remediation:** Replace MD5 with bcrypt, scrypt, or Argon2 for password hashing. These algorithms include salting and are designed to be computationally expensive.

---

### 🟡 VULN-014: Permissive CORS Policy Allows All Origins

- **Severity:** MEDIUM | **Confidence:** HIGH
- **File:** `server.ts` (lines 181-182)
- **CWE:** CWE-942 | **OWASP:** A05:2021 Security Misconfiguration

**Description:** CORS is configured with default options which sets `Access-Control-Allow-Origin: *`, allowing any website to make cross-origin requests to the API. This enables cross-site attacks where a malicious website can make authenticated API requests on behalf of a victim who visits the attacker's site (when combined with credential-bearing requests).

**Vulnerable Code:**
```
app.options('*', cors())
app.use(cors())
```

**Attack Vector:** Host a malicious website that makes fetch requests to the Juice Shop API. Any victim visiting the site will have their browser send requests to the API, potentially exfiltrating data.

**Remediation:** Configure CORS with a specific origin allowlist: `cors({ origin: ['https://your-domain.com'], credentials: true })`

---

### 🟡 VULN-015: Rate Limiting Bypass via X-Forwarded-For Header Spoofing

- **Severity:** MEDIUM | **Confidence:** HIGH
- **File:** `server.ts` (lines 342-347)
- **CWE:** CWE-307 | **OWASP:** A07:2021 Identification and Authentication Failures

**Description:** The rate limiter uses a custom `keyGenerator` that trusts the `X-Forwarded-For` header directly from the request. Combined with `trust proxy` being enabled, an attacker can rotate arbitrary values in this header to bypass the rate limit completely, enabling brute-force attacks on the password reset endpoint.

**Vulnerable Code:**
```
app.enable('trust proxy')
app.use('/rest/user/reset-password', rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  keyGenerator ({ headers, ip }) { return headers['X-Forwarded-For'] ?? ip }
}))
```

**Attack Vector:** Send password reset requests with a different `X-Forwarded-For` header value for each request to circumvent the 100-request-per-5-minutes limit.

**Remediation:** Remove the custom `keyGenerator` and rely on the default express-rate-limit behavior which uses `req.ip` (which respects trust proxy settings correctly). Alternatively, use a compound key combining authenticated user identity with IP.

---

### 🟢 VULN-016: Missing Authorization on PUT /api/Products/:id

- **Severity:** LOW | **Confidence:** HIGH
- **File:** `server.ts` (lines 369-369)
- **CWE:** CWE-862 | **OWASP:** A01:2021 Broken Access Control

**Description:** The authorization middleware for PUT /api/Products/:id is commented out, allowing any unauthenticated user to modify product data (names, descriptions, prices, images) via the REST API.

**Vulnerable Code:**
```
// app.put('/api/Products/:id', security.isAuthorized()) // vuln-code-snippet vuln-line changeProductChallenge
```

**Attack Vector:** PUT /api/Products/1 with body {"price": 0, "name": "Free Product"} — no authentication required.

**Remediation:** Uncomment the authorization line and add role-based access control to restrict product modifications to admin users only.

---

### 🟢 VULN-017: Weak Legacy HTML Sanitizer Can Be Bypassed

- **Severity:** LOW | **Confidence:** MEDIUM
- **File:** `lib/insecurity.ts` (lines 61-61)
- **CWE:** CWE-79 | **OWASP:** A03:2021 Injection

**Description:** The `sanitizeLegacy` function uses a simple regex to strip HTML tags, which is trivially bypassable. Regex-based HTML sanitization is inherently flawed and cannot account for all XSS vectors (e.g., nested tags, encoding tricks, incomplete tags).

**Vulnerable Code:**
```
export const sanitizeLegacy = (input = '') => input.replace(/<(?:\w+)\W+?[\w]/gi, '')
```

**Attack Vector:** Input like `<<a]onpointerenter=alert(1)>` or `<img src=x onerror=alert(1)` (without closing bracket) may bypass the regex.

**Remediation:** Replace with the existing `sanitizeSecure` function which uses the `sanitize-html` library recursively, or remove `sanitizeLegacy` entirely if unused.

---

### 🟢 VULN-018: Sensitive Credentials Hardcoded in Challenge Verification

- **Severity:** LOW | **Confidence:** MEDIUM
- **File:** `routes/login.ts` (lines 60-66)
- **CWE:** CWE-798 | **OWASP:** A07:2021 Identification and Authentication Failures

**Description:** Multiple user passwords are hardcoded in plaintext in the source code as part of challenge verification logic. While this is intentional for the CTF platform, anyone with source code access can extract all challenge-solving credentials directly, including what appear to be Base64-encoded values and cleartext passwords.

**Vulnerable Code:**
```
challengeUtils.solveIf(challenges.loginSupportChallenge, () => { return req.body.email === 'support@' + ... && req.body.password === 'J6aVjTgOpRs@?5l!Zkq2AYnCE@RF$P' })
...
challengeSolveIf(challenges.oauthUserPasswordChallenge, () => { return req.body.email === 'bjoern.kimminich@gmail.com' && req.body.password === 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI=' })
```

**Attack Vector:** Read the source code to extract all user credentials without solving the actual challenges.

**Remediation:** Move challenge verification to compare against hashed values stored in the database rather than plaintext comparisons in source code. Use the existing `security.hash()` for comparison.

---

### 🔴 VULN-019: Server-Side Template Injection via eval() in username

- **Severity:** CRITICAL | **Confidence:** HIGH
- **File:** `routes/userProfile.ts` (lines 55-65)
- **CWE:** CWE-94 | **OWASP:** A03:2021-Injection

**Description:** The code extracts content between #{...} from the user-controlled username field and passes it directly to eval(). When the usernameXssChallenge is enabled, any authenticated user who sets their username to #{arbitrary_code} gets that code executed server-side.

**Vulnerable Code:**
```
if (username?.match(/#{(.*)}/) !== null && utils.isChallengeEnabled(challenges.usernameXssChallenge)) {
  const code = username?.substring(2, username.length - 1)
  username = eval(code) // eslint-disable-line no-eval
```

**Attack Vector:** Set username to '#{process.mainModule.require("child_process").execSync("id").toString()}' to execute arbitrary OS commands on the server.

**Remediation:** Remove eval() entirely. Use a template engine or safe string interpolation. If dynamic evaluation is required for challenge purposes, use a sandboxed VM context with strict timeouts.

---

### 🔴 VULN-020: NoSQL Injection via $where operator with user input

- **Severity:** CRITICAL | **Confidence:** HIGH
- **File:** `routes/showProductReviews.ts` (lines 31-36)
- **CWE:** CWE-943 | **OWASP:** A03:2021-Injection

**Description:** When noSqlCommandChallenge is enabled, req.params.id is only truncated to 40 characters but concatenated directly into a $where JavaScript expression. The $where operator evaluates the string as JavaScript in the MongoDB engine, allowing arbitrary code execution.

**Vulnerable Code:**
```
const id = !utils.isChallengeEnabled(challenges.noSqlCommandChallenge) ? Number(req.params.id) : utils.trunc(req.params.id, 40)
db.reviewsCollection.find({ $where: 'this.product == ' + id })
```

**Attack Vector:** Request GET /rest/products/1;sleep(2000)/reviews to cause DoS, or use '1;return true' to dump all reviews. More dangerous payloads can exfiltrate data.

**Remediation:** Replace $where with standard MongoDB query operators: db.reviewsCollection.find({ product: parseInt(id) }). Never use $where with user input.

---

### 🔴 VULN-021: Local File Read via layout parameter in data erasure

- **Severity:** CRITICAL | **Confidence:** HIGH
- **File:** `routes/dataErasure.ts` (lines 68-82)
- **CWE:** CWE-22 | **OWASP:** A01:2021-Broken Access Control

**Description:** The layout parameter from POST body is passed to res.render() as the view path. A weak blacklist only blocks paths containing 'ftp', 'ctf.key', or 'encryptionkeys'. Any other file on the filesystem can be read, including /etc/passwd, application source code, and environment files.

**Vulnerable Code:**
```
if (req.body.layout) {
  const filePath: string = path.resolve(req.body.layout).toLowerCase()
  const isForbiddenFile: boolean = (filePath.includes('ftp') || filePath.includes('ctf.key') || filePath.includes('encryptionkeys'))
  if (!isForbiddenFile) {
    res.render('dataErasureResult', { ...req.body }, (error, html) => {
```

**Attack Vector:** POST /dataerasure with body {"layout": "/etc/passwd", "email": "a", "securityAnswer": "a"} to read arbitrary files. The first 100 characters of rendered output are returned.

**Remediation:** Use a whitelist of allowed layout templates instead of a blacklist. Validate that the resolved path is within an expected directory using path.resolve() and checking it starts with the allowed base path.

---

### 🔴 VULN-022: Password change without current password verification

- **Severity:** CRITICAL | **Confidence:** HIGH
- **File:** `routes/changePassword.ts` (lines 14-42)
- **CWE:** CWE-287 | **OWASP:** A07:2021-Identification and Authentication Failures

**Description:** The current password check on line 39 uses a short-circuit AND: if currentPassword is undefined/empty/falsy, the entire check is skipped. This means omitting the 'current' query parameter allows changing the password without knowing the current one. Additionally, passwords are sent via URL query string, exposing them in server logs and browser history.

**Vulnerable Code:**
```
const currentPassword = query.current as string
const newPassword = query.new as string
...
if (currentPassword && security.hash(currentPassword) !== loggedInUser.data.password) {
  res.status(401).send(res.__('Current password is not correct.'))
```

**Attack Vector:** GET /rest/user/change-password?new=hacked&repeat=hacked (without 'current' parameter) changes the authenticated user's password. Combined with CSRF, an attacker can change any logged-in user's password.

**Remediation:** Make currentPassword required: reject the request if it's missing. Move password parameters from query string to POST body. Use strict equality checks.

---

### 🟠 VULN-023: NoSQL injection with multi-document update in product reviews

- **Severity:** HIGH | **Confidence:** HIGH
- **File:** `routes/updateProductReviews.ts` (lines 17-20)
- **CWE:** CWE-943 | **OWASP:** A03:2021-Injection

**Description:** req.body.id is passed directly to the MongoDB _id query without validation. With {multi: true}, sending a crafted object like {"$ne": null} as the id matches ALL documents in the collection. Additionally, no ownership check is performed - any user can modify any review.

**Vulnerable Code:**
```
db.reviewsCollection.update(
  { _id: req.body.id },
  { $set: { message: req.body.message } },
  { multi: true }
```

**Attack Vector:** POST with body {"id": {"$ne": ""}, "message": "hacked"} modifies ALL product reviews in the database simultaneously.

**Remediation:** Validate that req.body.id is a string. Remove {multi: true}. Add an author ownership check comparing the review author with the authenticated user's email.

---

### 🟠 VULN-024: Stored XSS via True-Client-IP header

- **Severity:** HIGH | **Confidence:** HIGH
- **File:** `routes/saveLoginIp.ts` (lines 18-26)
- **CWE:** CWE-79 | **OWASP:** A03:2021-Injection

**Description:** When httpHeaderXssChallenge is enabled, the True-Client-IP header value is stored in the database without sanitization. This header is fully attacker-controlled and the stored value is later displayed in user profiles/admin views, enabling stored XSS.

**Vulnerable Code:**
```
let lastLoginIp = req.headers['true-client-ip']
if (utils.isChallengeEnabled(challenges.httpHeaderXssChallenge)) {
  challengeUtils.solveIf(challenges.httpHeaderXssChallenge, () => { return lastLoginIp === '<iframe src="javascript:alert(`xss`)">' })
} else {
  lastLoginIp = security.sanitizeSecure(lastLoginIp ?? '')
}
```

**Attack Vector:** Send login request with header 'True-Client-IP: <iframe src="javascript:alert(document.cookie)">' to store XSS payload that executes when the IP is rendered.

**Remediation:** Always sanitize the True-Client-IP header regardless of challenge state. Apply output encoding when displaying the lastLoginIp field.

---

### 🟠 VULN-025: IDOR in basket retrieval - no ownership verification

- **Severity:** HIGH | **Confidence:** HIGH
- **File:** `routes/basket.ts` (lines 18-24)
- **CWE:** CWE-639 | **OWASP:** A01:2021-Broken Access Control

**Description:** Any authenticated user can access any basket by changing the id parameter. The code detects cross-basket access for the challenge but does not prevent it - it still returns the basket data.

**Vulnerable Code:**
```
const id = req.params.id
const basket = await BasketModel.findOne({ where: { id }, include: [{ model: ProductModel, paranoid: false, as: 'Products' }] })
challengeUtils.solveIf(challenges.basketAccessChallenge, () => {
  const user = security.authenticatedUsers.from(req)
  return user && id && user?.bid != parseInt(id, 10)
})
```

**Attack Vector:** GET /rest/basket/1, /rest/basket/2, etc. to enumerate and view any user's basket contents including products and quantities.

**Remediation:** Add an authorization check: verify that the requested basket ID matches the authenticated user's basket ID (user.bid) before returning data.

---

### 🟠 VULN-026: Missing authentication on allOrders endpoint

- **Severity:** HIGH | **Confidence:** HIGH
- **File:** `routes/orderHistory.ts` (lines 25-29)
- **CWE:** CWE-306 | **OWASP:** A01:2021-Broken Access Control

**Description:** The allOrders function has no authentication or authorization check. It returns all orders from all users in the system, including personal details, delivery addresses, and order contents.

**Vulnerable Code:**
```
export function allOrders () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const order = await ordersCollection.find()
    res.status(200).json({ status: 'success', data: order.reverse() })
  }
}
```

**Attack Vector:** GET /rest/order-history returns all orders in the system without requiring any authentication.

**Remediation:** Add authentication middleware and restrict access to admin users only. Verify the user has an admin role before returning all orders.

---

### 🟠 VULN-027: IDOR in wallet operations - UserId from request body

- **Severity:** HIGH | **Confidence:** HIGH
- **File:** `routes/wallet.ts` (lines 12-27)
- **CWE:** CWE-639 | **OWASP:** A01:2021-Broken Access Control

**Description:** Both getWalletBalance() and addWalletBalance() take UserId from req.body instead of from the authenticated session. An attacker can view any user's wallet balance or add arbitrary amounts to any user's wallet by manipulating the UserId parameter. The balance amount is also not validated.

**Vulnerable Code:**
```
const wallet = await WalletModel.findOne({ where: { UserId: req.body.UserId } })
...
await WalletModel.increment({ balance: req.body.balance }, { where: { UserId: req.body.UserId } })
```

**Attack Vector:** POST with body {"UserId": 1} to view admin's wallet. POST with {"UserId": 2, "balance": 999999, "paymentId": <valid_card>} to add funds to another user's wallet.

**Remediation:** Extract UserId from the authenticated JWT token/session instead of from req.body. Validate that balance is a positive number within acceptable bounds.

---

### 🟠 VULN-028: IDOR in payment methods - UserId from request body

- **Severity:** HIGH | **Confidence:** HIGH
- **File:** `routes/payment.ts` (lines 21-70)
- **CWE:** CWE-639 | **OWASP:** A01:2021-Broken Access Control

**Description:** All three payment endpoints (getPaymentMethods, getPaymentMethodById, delPaymentMethodById) accept UserId from req.body without verifying it matches the authenticated user. An attacker can list, view, and delete other users' payment cards.

**Vulnerable Code:**
```
const cards = await CardModel.findAll({ where: { UserId: req.body.UserId } })
...
const card = await CardModel.findOne({ where: { id: req.params.id, UserId: req.body.UserId } })
...
const card = await CardModel.destroy({ where: { id: req.params.id, UserId: req.body.UserId } })
```

**Attack Vector:** POST with body {"UserId": 1} to list admin's payment methods. Then use the card IDs to view full details or delete cards belonging to other users.

**Remediation:** Extract UserId from the authenticated JWT/session. Never trust client-supplied user identifiers for authorization decisions.

---

### 🟠 VULN-029: IDOR in deluxe upgrade - UserId from request body

- **Severity:** HIGH | **Confidence:** HIGH
- **File:** `routes/deluxe.ts` (lines 19-30)
- **CWE:** CWE-639 | **OWASP:** A01:2021-Broken Access Control

**Description:** The upgradeToDeluxe function accepts UserId from req.body. An attacker can upgrade another user to deluxe membership or spend from another user's wallet by specifying a different UserId.

**Vulnerable Code:**
```
const user = await UserModel.findOne({ where: { id: req.body.UserId, role: security.roles.customer } })
...
const wallet = await WalletModel.findOne({ where: { UserId: req.body.UserId } })
await WalletModel.decrement({ balance: 49 }, { where: { UserId: req.body.UserId } })
```

**Attack Vector:** POST with body {"UserId": <victim_id>, "paymentMode": "wallet"} to spend 49 from the victim's wallet and upgrade their account to deluxe.

**Remediation:** Extract UserId from the authenticated JWT/session token rather than from req.body.

---

### 🟠 VULN-030: CAPTCHA bypass when no CAPTCHA has been generated

- **Severity:** HIGH | **Confidence:** HIGH
- **File:** `routes/imageCaptcha.ts` (lines 52-53)
- **CWE:** CWE-287 | **OWASP:** A07:2021-Identification and Authentication Failures

**Description:** The CAPTCHA verification logic passes if no CAPTCHA record exists (!captchas[0] is truthy). An attacker can skip the CAPTCHA generation step entirely and submit the protected form directly - since no CAPTCHA record exists for their user, the check passes automatically.

**Vulnerable Code:**
```
if (!captchas[0] || req.body.answer === captchas[0].answer) {
  next()
```

**Attack Vector:** Skip the CAPTCHA request and directly submit the data erasure form. Since no CAPTCHA record is found, the OR condition short-circuits and the request passes through.

**Remediation:** Change the logic to require a valid CAPTCHA: if (!captchas[0]) { return res.status(401).send('CAPTCHA required') }. Only then check the answer.

---

### 🟡 VULN-031: Password hash leak via fields query parameter

- **Severity:** MEDIUM | **Confidence:** HIGH
- **File:** `routes/currentUser.ts` (lines 22-58)
- **CWE:** CWE-200 | **OWASP:** A01:2021-Broken Access Control

**Description:** The fields query parameter allows requesting arbitrary user object fields including 'password'. Combined with JSONP support (res.jsonp), this enables cross-origin data exfiltration of password hashes.

**Vulnerable Code:**
```
const fieldsParam = req.query?.fields as string | undefined
const requestedFields = fieldsParam ? fieldsParam.split(',').map(f => f.trim()) : []
for (const field of requestedFields) {
  if (user?.data[field as keyof typeof user.data] !== undefined) {
    baseUser[field] = user?.data[field as keyof typeof user.data]
  }
}
...
res.jsonp(response)
```

**Attack Vector:** GET /rest/user/whoami?fields=password,email returns the user's password hash. With callback parameter: ?fields=password&callback=steal enables cross-origin exfiltration via JSONP.

**Remediation:** Whitelist allowed fields explicitly (id, email, lastLoginIp, profileImage). Remove JSONP support or restrict the callback parameter.

---

### 🟡 VULN-032: Hardcoded RSA private key in source code

- **Severity:** MEDIUM | **Confidence:** HIGH
- **File:** `lib/insecurity.ts` (lines 23-23)
- **CWE:** CWE-798 | **OWASP:** A07:2021-Identification and Authentication Failures

**Description:** The RSA private key used for JWT signing is hardcoded directly in the source file. Anyone with access to the source code can forge valid JWT tokens for any user, including admin accounts.

**Vulnerable Code:**
```
const privateKey = '-----BEGIN RSA PRIVATE KEY-----\r\nMIICXAIBAAKBgQDNwqLEe9wgTXCbC7+RPdDbBbeqjdbs4kOPOIGzqLpXvJXlxxW8iMz0EaM4BKUqYsIa+ndv3NAn2RxCd5ubVdJJcX43zO6Ko0TFEZx/65gY3BE0O6syCEmUP4qbSd6exou/F+WTISzbQ5FBVPVmhnYhG/kpwt/cIxK5iUn5hm+4tQIDAQABAoGBAI+8xiPoOrA+...'
```

**Attack Vector:** Extract the private key from source code to sign arbitrary JWT tokens, impersonating any user in the system including administrators.

**Remediation:** Store the private key in an environment variable or secure vault. Load it at runtime from a protected file outside the source tree.

---

### 🟡 VULN-033: MD5 hash used for password storage

- **Severity:** MEDIUM | **Confidence:** HIGH
- **File:** `lib/insecurity.ts` (lines 43-43)
- **CWE:** CWE-916 | **OWASP:** A02:2021-Cryptographic Failures

**Description:** MD5 is a cryptographically broken hash function. It is fast to compute, has known collision attacks, and extensive rainbow table coverage. This hash function is used across the application for password hashing without any salt.

**Vulnerable Code:**
```
export const hash = (data: string) => crypto.createHash('md5').update(data).digest('hex')
```

**Attack Vector:** Obtain password hashes (via SQL injection, database leak, or VULN-031) and reverse them using MD5 rainbow tables or GPU-accelerated brute force. Most common passwords can be cracked in seconds.

**Remediation:** Use bcrypt, scrypt, or argon2 with per-user salts for password hashing. These are designed to be computationally expensive and resistant to brute force.

---

### 🟡 VULN-034: Hardcoded HMAC secret key in source code

- **Severity:** MEDIUM | **Confidence:** HIGH
- **File:** `lib/insecurity.ts` (lines 44-44)
- **CWE:** CWE-798 | **OWASP:** A02:2021-Cryptographic Failures

**Description:** The HMAC secret 'pa4qacea4VK9t9nGv7yZtwmj' is hardcoded in source code. This HMAC function is used to verify security answers. With the known secret, an attacker can compute valid HMAC values for any security answer.

**Vulnerable Code:**
```
export const hmac = (data: string) => crypto.createHmac('sha256', 'pa4qacea4VK9t9nGv7yZtwmj').update(data).digest('hex')
```

**Attack Vector:** Extract the hardcoded secret, then brute-force security answers by computing HMAC-SHA256 of common answers and comparing against stored values.

**Remediation:** Store the HMAC secret in an environment variable. Rotate the secret periodically and ensure it is not committed to version control.

---

### 🟡 VULN-035: Hardcoded Alchemy API key for blockchain operations

- **Severity:** MEDIUM | **Confidence:** HIGH
- **File:** `routes/nftMint.ts` (lines 16-16)
- **CWE:** CWE-798 | **OWASP:** A02:2021-Cryptographic Failures

**Description:** An Alchemy API key is hardcoded in the WebSocket provider URL. The same key appears in routes/web3Wallet.ts. This key provides access to Ethereum blockchain services and can be abused if extracted.

**Vulnerable Code:**
```
const provider = new WebSocketProvider('wss://eth-sepolia.g.alchemy.com/v2/FZDapFZSs1l6yhHW4VnQqsi18qSd-3GJ')
```

**Attack Vector:** Extract the API key 'FZDapFZSs1l6yhHW4VnQqsi18qSd-3GJ' from source code to abuse Alchemy's rate limits, monitor the application's blockchain interactions, or perform unauthorized blockchain queries.

**Remediation:** Move the Alchemy API key to an environment variable (e.g., ALCHEMY_API_KEY) and reference it at runtime.

---

### 🟡 VULN-036: Hardcoded Ethereum mnemonic phrase in source code

- **Severity:** MEDIUM | **Confidence:** HIGH
- **File:** `routes/checkKeys.ts` (lines 10-12)
- **CWE:** CWE-798 | **OWASP:** A02:2021-Cryptographic Failures

**Description:** A complete Ethereum HD wallet mnemonic phrase is hardcoded in source code. This derives deterministic private keys that control associated cryptocurrency wallets.

**Vulnerable Code:**
```
const mnemonic = 'purpose betray marriage blame crunch monitor spin slide donate sport lift clutch'
const mnemonicWallet = HDNodeWallet.fromPhrase(mnemonic)
const privateKey = mnemonicWallet.privateKey
```

**Attack Vector:** Extract the mnemonic phrase to derive all associated wallet private keys and drain any funds held in the wallets.

**Remediation:** Store the mnemonic in an environment variable or hardware security module. Never commit seed phrases to source control.

---

### 🟡 VULN-037: Race condition in product review like functionality

- **Severity:** MEDIUM | **Confidence:** HIGH
- **File:** `routes/likeProductReviews.ts` (lines 35-53)
- **CWE:** CWE-362 | **OWASP:** A04:2021-Insecure Design

**Description:** The like operation is split into three non-atomic steps with a deliberate 150ms sleep: (1) increment likesCount, (2) sleep, (3) fetch and update likedBy array. Concurrent requests during the sleep window bypass the duplicate check on line 31 since likedBy hasn't been updated yet.

**Vulnerable Code:**
```
await db.reviewsCollection.update(
  { _id: id },
  { $inc: { likesCount: 1 } }
)
await sleep(150)
const updatedReview: Review = await db.reviewsCollection.findOne({ _id: id })
const updatedLikedBy = updatedReview.likedBy
updatedLikedBy.push(user.data.email)
```

**Attack Vector:** Send multiple concurrent POST requests to like the same review. During the 150ms window, the duplicate check passes for all concurrent requests, allowing unlimited likes from the same user.

**Remediation:** Use an atomic MongoDB update that both increments likesCount and adds the email to likedBy in a single operation with $addToSet.

---

### 🟡 VULN-038: Path traversal in chatbot training file download

- **Severity:** MEDIUM | **Confidence:** MEDIUM
- **File:** `routes/chatbot.ts` (lines 34-37)
- **CWE:** CWE-22 | **OWASP:** A01:2021-Broken Access Control

**Description:** The training file URL from config is downloaded and written to disk using extractFilename() which only extracts the last path segment after URL decoding. If the config value contains path traversal sequences (e.g., via URL encoding), the extracted filename could write outside the data/chatbot/ directory.

**Vulnerable Code:**
```
if (utils.isUrl(trainingFile)) {
  const file = utils.extractFilename(trainingFile)
  const data = await download(trainingFile)
  await fs.writeFile('data/chatbot/' + file, data)
}
```

**Attack Vector:** If the chatbot training data config is controllable (e.g., via config injection or environment variable), set it to a URL with a filename like '..%2f..%2fserver.ts' to overwrite application files.

**Remediation:** Validate that the resolved write path starts with the expected directory. Use path.join() with basename extraction and validate the final path.

---

### 🟡 VULN-039: Stored XSS via subtitle file injection in video handler

- **Severity:** MEDIUM | **Confidence:** MEDIUM
- **File:** `routes/videoHandler.ts` (lines 71-82)
- **CWE:** CWE-79 | **OWASP:** A03:2021-Injection

**Description:** Subtitle file contents are read from disk and injected directly into a <script> tag without sanitization. If the config-specified subtitle file contains malicious content (e.g., '</script><script>alert(1)</script>'), it results in XSS. The subtitle filename from config is also concatenated without path validation.

**Vulnerable Code:**
```
compiledTemplate = compiledTemplate.replace('<script id="subtitle"></script>', '<script id="subtitle" type="text/vtt">' + subs + '</script>')
...
const subtitles = config.get<string>('application.promotion.subtitles') ?? 'owasp_promo.vtt'
const data = fs.readFileSync('frontend/dist/frontend/assets/public/videos/' + subtitles, 'utf8')
```

**Attack Vector:** If the subtitle config value can be manipulated (e.g., via overrideUrl config injection), inject a path to a file containing '</script><script>alert(`xss`)</script>' to achieve stored XSS on the promotion video page.

**Remediation:** Sanitize subtitle content before injection into HTML. Validate that the subtitle path resolves within the expected videos directory.

---

### 🟡 VULN-040: Hardcoded Hashids salts for continue code generation

- **Severity:** MEDIUM | **Confidence:** HIGH
- **File:** `routes/continueCode.ts` (lines 13-38)
- **CWE:** CWE-330 | **OWASP:** A02:2021-Cryptographic Failures

**Description:** Three different Hashids instances use hardcoded, publicly visible salts. Hashids is a reversible encoding (not encryption), and with known salts, anyone can decode continue codes to extract challenge completion state or forge codes for arbitrary progress. Same salts also appear in routes/restoreProgress.ts.

**Vulnerable Code:**
```
const hashids = new Hashids('this is my salt', 60, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890')
const hashids = new Hashids('this is the salt for findIt challenges', 60, ...)
const hashids = new Hashids('yet another salt for the fixIt challenges', 60, ...)
```

**Attack Vector:** Use the known salt to decode any continue code and extract challenge IDs, or encode arbitrary challenge IDs to forge progress restoration codes.

**Remediation:** Use cryptographically signed tokens (e.g., JWT) for continue codes, or move the Hashids salts to environment variables.

---

### 🟢 VULN-041: Incomplete path traversal protection in quarantine file server

- **Severity:** LOW | **Confidence:** MEDIUM
- **File:** `routes/quarantineServer.ts` (lines 11-14)
- **CWE:** CWE-22 | **OWASP:** A01:2021-Broken Access Control

**Description:** The check only blocks forward slashes but not backslashes (Windows) or null bytes. While the forward slash check prevents basic '../' traversal, on Windows systems backslashes could bypass this. Similar pattern exists in routes/keyServer.ts.

**Vulnerable Code:**
```
const file = params.file
if (!file.includes('/')) {
  res.sendFile(path.resolve('ftp/quarantine/', file))
}
```

**Attack Vector:** On Windows deployments: request file=..\..\..\etc\passwd to bypass the forward-slash check. On Linux, the check is sufficient for basic path traversal but does not protect against null byte injection on older Node versions.

**Remediation:** Use path.basename() to extract just the filename, or validate that the resolved path starts with the expected directory. Also check for backslashes and null bytes.

---

### 🟢 VULN-042: User enumeration via security question endpoint

- **Severity:** LOW | **Confidence:** HIGH
- **File:** `routes/securityQuestion.ts` (lines 11-31)
- **CWE:** CWE-203 | **OWASP:** A07:2021-Identification and Authentication Failures

**Description:** The endpoint returns a security question when a valid email is found, or an empty object otherwise. This differential response allows attackers to enumerate which email addresses are registered in the system.

**Vulnerable Code:**
```
const email = query.email
const answer = await SecurityAnswerModel.findOne({
  include: [{ model: UserModel, where: { email: email?.toString() } }]
})
if (answer != null) {
  const question = await SecurityQuestionModel.findByPk(answer.SecurityQuestionId)
  res.json({ question })
} else {
  res.json({})
}
```

**Attack Vector:** Iterate over candidate email addresses with GET /rest/user/security-question?email=<candidate>. A non-empty response confirms the email is registered.

**Remediation:** Return a generic response regardless of whether the email exists (e.g., always return a random/generic security question).

---

### 🟢 VULN-043: User enumeration via password reset endpoint

- **Severity:** LOW | **Confidence:** HIGH
- **File:** `routes/resetPassword.ts` (lines 34-54)
- **CWE:** CWE-203 | **OWASP:** A07:2021-Identification and Authentication Failures

**Description:** Different responses are returned for 'email not found' (error thrown) vs 'wrong security answer' (401 with message), enabling email enumeration.

**Vulnerable Code:**
```
const data = await SecurityAnswerModel.findOne({
  include: [{ model: UserModel, where: { email } }]
})
if ((data != null) && security.hmac(answer) === data.answer) {
  ...
} else {
  res.status(401).send(res.__('Wrong answer to security question.'))
}
```

**Attack Vector:** Submit password reset requests with different emails. Responses that reach the 'Wrong answer' message confirm the email exists in the system.

**Remediation:** Return the same generic error message for all failure cases (invalid email, wrong answer).

---

### 🟢 VULN-044: Application configuration exposed without authentication

- **Severity:** LOW | **Confidence:** MEDIUM
- **File:** `routes/appConfiguration.ts` (lines 9-13)
- **CWE:** CWE-200 | **OWASP:** A01:2021-Broken Access Control

**Description:** The entire application configuration object is returned to any requestor without authentication. This can expose internal settings, feature flags, challenge configurations, and potentially sensitive values.

**Vulnerable Code:**
```
export function retrieveAppConfiguration () {
  return (_req: Request, res: Response) => {
    res.json({ config })
  }
}
```

**Attack Vector:** GET /rest/admin/application-configuration returns the full config object including internal application settings.

**Remediation:** Add authentication middleware. Filter the config to only return fields safe for client consumption.

---

### 🟢 VULN-045: NoSQL injection via unvalidated MongoDB _id in like reviews

- **Severity:** LOW | **Confidence:** MEDIUM
- **File:** `routes/likeProductReviews.ts` (lines 18-25)
- **CWE:** CWE-943 | **OWASP:** A03:2021-Injection

**Description:** The id parameter from req.body is passed directly to MongoDB findOne without type validation. If an object like {"$gt": ""} is sent instead of a string, it becomes a query operator that can match unintended documents.

**Vulnerable Code:**
```
const id = req.body.id
const review = await db.reviewsCollection.findOne({ _id: id })
```

**Attack Vector:** POST with body {"id": {"$gt": ""}} to match the first review regardless of its actual ID.

**Remediation:** Validate that req.body.id is a string before using it in MongoDB queries. Cast or reject non-string types.

---

### 🟢 VULN-046: Plaintext credit card numbers stored in database

- **Severity:** LOW | **Confidence:** HIGH
- **File:** `models/card.ts` (lines 40-45)
- **CWE:** CWE-312 | **OWASP:** A02:2021-Cryptographic Failures

**Description:** Credit card numbers are stored as plain integers with only range validation. No encryption, hashing, or tokenization is applied. This violates PCI DSS requirements for card data protection. INTEGER type may also cause precision loss for 16-digit numbers.

**Vulnerable Code:**
```
cardNum: {
  type: DataTypes.INTEGER,
  validate: {
    isInt: true,
    min: 1000000000000000,
    max: 9999999999999998
  }
}
```

**Attack Vector:** Any SQL injection or database access vulnerability exposes all stored credit card numbers in plaintext.

**Remediation:** Tokenize card numbers using a payment gateway. If storage is necessary, encrypt with AES-256 and store only the last 4 digits for display.

---

### 🟢 VULN-047: Potential SSRF via webhook URL in environment variable

- **Severity:** LOW | **Confidence:** MEDIUM
- **File:** `lib/webhook.ts` (lines 14-22)
- **CWE:** CWE-918 | **OWASP:** A10:2021-Server-Side Request Forgery

**Description:** The webhook URL from SOLUTIONS_WEBHOOK environment variable is used in a server-side HTTP request without URL validation. If an attacker can control this environment variable, they can force the server to make requests to internal services.

**Vulnerable Code:**
```
export const notify = async (challenge: { key: any, name: any }, cheatScore = -1, ..., webhook = process.env.SOLUTIONS_WEBHOOK) => {
  if (!webhook) { return }
  const res = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({...})
  })
```

**Attack Vector:** If environment variables can be manipulated (e.g., through container misconfiguration), set SOLUTIONS_WEBHOOK to http://169.254.169.254/latest/meta-data/ to access cloud metadata services.

**Remediation:** Validate the webhook URL against an allowlist of domains. Block requests to private IP ranges and cloud metadata endpoints.

---

### 🟢 VULN-048: Insufficient path sanitization in utils.extractFilename

- **Severity:** LOW | **Confidence:** MEDIUM
- **File:** `lib/utils.ts` (lines 113-119)
- **CWE:** CWE-22 | **OWASP:** A01:2021-Broken Access Control

**Description:** extractFilename() uses decodeURIComponent() on the URL fragment but does not sanitize path traversal sequences in the result. This function is used in chatbot.ts, videoHandler.ts, and userProfile.ts for constructing file paths. Double-encoded sequences like %252e%252e would survive the first decode and produce '..' after a second decode.

**Vulnerable Code:**
```
export const extractFilename = (url: string) => {
  let file = decodeURIComponent(url.substring(url.lastIndexOf('/') + 1))
  if (contains(file, '?')) {
    file = file.substring(0, file.indexOf('?'))
  }
  return file
}
```

**Attack Vector:** Craft URLs with encoded path traversal sequences that survive the filename extraction and are used in subsequent file operations (read/write).

**Remediation:** Apply path.basename() to the result to strip directory components. Reject filenames containing '..' or path separators.

---

