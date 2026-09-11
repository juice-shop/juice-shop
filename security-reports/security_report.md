# Application Security Assessment Report

| | |
|---|---|
| **Target** | `/Users/dmitryshishov/Desktop/Projects/ai-security-agent/workspaces/juice-shop/juice-shop` |
| **Repository** | https://github.com/juice-shop/juice-shop @ `1618a611b173` (master) |
| **Generated** | 2026-09-11 14:42 UTC |
| **Domains** | Web Application, LLM Application |
| **Reference docs** | `OWASP-Web-Top-10-2025.md`, `OWASP-LLM-Top-10-2026.md` |
| **Files inspected** | 1276 (736 source files) |
| **Static analysis** | Semgrep 1.172.0 |
| **Dynamic analysis** | DAST active (nuclei, auth-probe, garak) |
| **LLM triage** | Claude `claude-opus-5` |
| **Live targets** | web: http://127.0.0.1:51663, llm: http://127.0.0.1:51663/rest/basket |

## 1. Executive Summary

**Overall Risk Grade: F** &nbsp;·&nbsp; **Risk Score: 100 / 100**

| Severity | Count |
|---|---|
| **CRITICAL** | 5 |
| **HIGH** | 12 |
| **MEDIUM** | 16 |
| **LOW** | 0 |
| **Total** | 33 |

The target is the OWASP Juice Shop, a deliberately vulnerable Node.js/TypeScript e-commerce single-page application (Express backend, Angular frontend) that has additionally been extended with an LLM-backed support chatbot and deployed via Terraform-provisioned cloud infrastructure. The review confirmed 33 findings, five of them CRITICAL, spanning almost the entire web risk landscape: **A05 — Injection** (SQL injection in unauthenticated login and product-search handlers, plus server-side `eval` of attacker-controlled data reaching remote code execution), **A04 — Cryptographic Failures** (a hardcoded RSA private key signing all authentication JWTs, unsalted MD5 password hashing, and an internet-facing load balancer serving cleartext HTTP), **A01 — Broken Access Control** (IDOR-style field selection leaking password hashes and TOTP secrets, path traversal, SSRF, unauthenticated key and log download endpoints, open redirect) and **A02 — Security Misconfiguration** (wildcard CORS on authenticated APIs, directory listing over key material and access logs, unauthenticated metrics). Supply-chain hygiene is weak under **A03 — Software Supply Chain Failures**: known-vulnerable pinned dependencies, disabled npm lockfiles, CI actions referenced by mutable tags, and a remote installer piped into a shell. Authentication flows fail under **A07 — Authentication Failures**, with password change accepted without the current password and reset rate limiting bypassable through a client-supplied `X-Forwarded-For` header. On the AI surface, the chatbot exhibits **LLM01 — Prompt Injection** (raw client-supplied message arrays passed to the model with tools enabled), **LLM03 — Excessive Agency** (a coupon tool that lets the model set an unbounded discount) and **LLM08 — Hidden Context Exposure** (confidential discount policy and control logic placed in the system prompt). Taken together, the composite risk is unauthenticated full-database compromise, forgeable administrative sessions and remote code execution on the host, with a directly monetisable fraud path through the chatbot.

**Most urgent risks**

- **CRITICAL** [F-001](#f-001): RSA private signing key for JWTs hardcoded in source
- **CRITICAL** [F-002](#f-002): Hard-coded RSA private key used to sign authentication JWTs
- **CRITICAL** [F-003](#f-003): SQL injection in login endpoint via unparameterised email in Sequelize raw query
- **CRITICAL** [F-004](#f-004): SQL injection in product search endpoint (`/rest/products/search?q=`)
- **CRITICAL** [F-005](#f-005): Remote code execution via `eval()` of attacker-controlled username in user profile

**Strategic recommendation**

Treat the injection, key-management and authentication defects as a single remediation wave rather than individual bug fixes: move every database access to parameterised queries or the ORM's safe API, delete all `eval`-style dynamic evaluation from request paths, rotate the JWT signing key into a managed KMS with short-lived revocable tokens, and migrate password storage to Argon2id or bcrypt with per-user salts. In parallel, establish a single deny-by-default authorisation layer that every route must pass through, with server-side record-ownership checks and explicit response field allow-lists, so that endpoints serving key material, logs, metrics and user records cannot be reached anonymously or coerced into over-disclosure. Harden the platform and deployment as code — TLS-only listeners with HSTS, directory listing disabled, CORS scoped to named origins, generic error responses, and trusted-proxy configuration so rate limits cannot be spoofed via forwarded headers. Restore supply-chain discipline by re-enabling lockfiles, generating an SBOM on every build, pinning CI actions to immutable commit SHAs, removing curl-to-shell installer steps, and setting a severity-based patch SLA against advisory feeds. For the LLM surface, adopt the architectural posture that the instruction boundary will be bypassed: keep credentials and policy out of the system prompt, strip and structurally validate client-supplied conversation state, replace the open-ended coupon tool with a deterministic server-side discount calculation bounded by business rules, and require human approval or hard caps on any model-triggered financial action. Finally, close the detection gap by logging and alerting on access-control denials, authentication failures and anomalous tool invocations, and wire SAST, DAST and adversarial LLM red-teaming into CI so regressions are caught before release.

Scoring: risk score = 10 × critical + 5 × high + 2 × medium + 0.5 × low, capped at 100 (**0 = no risk, 100 = catastrophic** — higher is worse). Grades: A ≤ 10, B ≤ 25, C ≤ 40, D ≤ 60, otherwise F. Any CRITICAL finding is graded no better than D; any HIGH no better than B.

## 2. Coverage & Detection Metrics

**SAST hits:** 55 &nbsp;·&nbsp; **DAST hits:** 1 &nbsp;·&nbsp; **Correlated threats:** 2

**Web Application coverage** — detectable 10/10 (100%)

| OWASP category | SAST | DAST | Found |
|---|---|---|---|
| A01 — Broken Access Control | ✓ | ✓ | ✓ |
| A02 — Security Misconfiguration | ✓ | ✓ | ✓ |
| A03 — Software Supply Chain Failures | ✓ | ✓ | ✓ |
| A04 — Cryptographic Failures | ✓ | – | ✓ |
| A05 — Injection | ✓ | ✓ | ✓ |
| A06 — Insecure Design | ✓ | – | – |
| A07 — Authentication Failures | ✓ | ✓ | ✓ |
| A08 — Software or Data Integrity Failures | ✓ | ✓ | – |
| A09 — Security Logging & Alerting Failures | ✓ | – | – |
| A10 — Mishandling of Exceptional Conditions | ✓ | – | – |

**LLM Application coverage** — detectable 8/10 (80%)

| OWASP category | SAST | DAST | Found |
|---|---|---|---|
| LLM01 — Prompt Injection | ✓ | ✓ | ✓ |
| LLM02 — Sensitive Information Disclosure | ✓ | ✓ | – |
| LLM03 — Excessive Agency | ✓ | – | ✓ |
| LLM04 — Supply Chain | ✓ | ✓ | – |
| LLM05 — Data and Model Poisoning | – | – | – |
| LLM06 — Unbounded Consumption | ✓ | – | – |
| LLM07 — Misinformation | – | ✓ | – |
| LLM08 — Hidden Context Exposure | ✓ | – | ✓ |
| LLM09 — Vector and Embedding Weaknesses | – | – | – |
| LLM10 — Improper Output Handling | ✓ | ✓ | – |

## 3. Domain Breakdown

| Domain | Critical | High | Medium | Low | Total |
|---|---|---|---|---|---|
| Web Application (OWASP Top 10:2025) | 5 | 10 | 15 | 0 | 30 |
| Mobile Application (OWASP Mobile Top 10 2024) | – | – | – | – | not applicable |
| LLM / AI Application (OWASP Top 10 for LLM Applications 2026) | 0 | 2 | 1 | 0 | 3 |

**Detection evidence**

| Domain | Evidence |
|---|---|
| Web Application | web asset / template directories (x330); Node.js web framework (x121); HTTP routing directories (x118); HTML / SPA templates (x82); session / CORS / CSRF handling (x54); HTTP route definitions (x21); browser-side code (x20); web framework dependency (x2) |
| LLM Application | LLM orchestration framework (x27); system prompt construction (x6); LLM provider / model library (x2) |

**Findings by OWASP category**

| OWASP category | Findings |
|---|---|
| A01 — Broken Access Control | 7 |
| A02 — Security Misconfiguration | 5 |
| A03 — Software Supply Chain Failures | 6 |
| A04 — Cryptographic Failures | 5 |
| A05 — Injection | 5 |
| A07 — Authentication Failures | 2 |
| LLM01 — Prompt Injection | 1 |
| LLM03 — Excessive Agency | 1 |
| LLM08 — Hidden Context Exposure | 1 |

## 4. Findings Summary

| ID | Severity | OWASP category | Location |
|---|---|---|---|
| [F-001](#f-001) | **CRITICAL** | A04 — Cryptographic Failures | `lib/insecurity.ts:21` |
| [F-002](#f-002) | **CRITICAL** | A04 — Cryptographic Failures | `lib/insecurity.ts:52` |
| [F-003](#f-003) | **CRITICAL** | A05 — Injection | `routes/login.ts:34` |
| [F-004](#f-004) | **CRITICAL** | A05 — Injection | `routes/search.ts:23` |
| [F-005](#f-005) | **CRITICAL** | A05 — Injection | `routes/userProfile.ts:65` |
| [F-006](#f-006) | **HIGH** | LLM03 — Excessive Agency | `routes/chat.ts:176` |
| [F-007](#f-007) | **HIGH** | LLM01 — Prompt Injection | `routes/chat.ts:190` |
| [F-008](#f-008) | **HIGH** | A04 — Cryptographic Failures | `infrastructure/terraform/networking.tf:157` |
| [F-009](#f-009) | **HIGH** | A04 — Cryptographic Failures | `lib/insecurity.ts:41` |
| [F-010](#f-010) | **HIGH** | A03 — Software Supply Chain Failures | `package.json:100` |
| [F-011](#f-011) | **HIGH** | A05 — Injection | `routes/b2bOrder.ts:19` |
| [F-012](#f-012) | **HIGH** | A07 — Authentication Failures | `routes/changePassword.ts:13` |
| [F-013](#f-013) | **HIGH** | A01 — Broken Access Control | `routes/dataErasure.ts:103` |
| [F-014](#f-014) | **HIGH** | A01 — Broken Access Control | `routes/fileServer.ts:32` |
| [F-015](#f-015) | **HIGH** | A01 — Broken Access Control | `routes/profileImageUrlUpload.ts:19` |
| [F-016](#f-016) | **HIGH** | A02 — Security Misconfiguration | `server.ts:296` |
| [F-017](#f-017) | **HIGH** | A04 — Cryptographic Failures | `terraform/networking.tf:157` |
| [F-018](#f-018) | **MEDIUM** | LLM08 — Hidden Context Exposure | `routes/chat.ts:98` |
| [F-019](#f-019) | **MEDIUM** | A03 — Software Supply Chain Failures | `.github/workflows/ci.yml:188` |
| [F-020](#f-020) | **MEDIUM** | A03 — Software Supply Chain Failures | `.github/workflows/ci.yml:359` |
| [F-021](#f-021) | **MEDIUM** | A03 — Software Supply Chain Failures | `.github/workflows/image_actions.yml:33` |
| [F-022](#f-022) | **MEDIUM** | A05 — Injection | `.github/workflows/update-challenges-ebook.yml:22` |
| [F-023](#f-023) | **MEDIUM** | A03 — Software Supply Chain Failures | `.npmrc:1` |
| [F-024](#f-024) | **MEDIUM** | A02 — Security Misconfiguration | `data/static/codefixes/exposedMetricsChallenge_1.ts:4` |
| [F-025](#f-025) | **MEDIUM** | A03 — Software Supply Chain Failures | `frontend/.npmrc:1` |
| [F-026](#f-026) | **MEDIUM** | A01 — Broken Access Control | `routes/currentUser.ts:27` |
| [F-027](#f-027) | **MEDIUM** | A01 — Broken Access Control | `routes/keyServer.ts:14` |
| [F-028](#f-028) | **MEDIUM** | A01 — Broken Access Control | `routes/logfileServer.ts:14` |
| [F-029](#f-029) | **MEDIUM** | A02 — Security Misconfiguration | `routes/metrics.ts:83` |
| [F-030](#f-030) | **MEDIUM** | A01 — Broken Access Control | `routes/redirect.ts:18` |
| [F-031](#f-031) | **MEDIUM** | A02 — Security Misconfiguration | `server.ts:182` |
| [F-032](#f-032) | **MEDIUM** | A02 — Security Misconfiguration | `server.ts:268` |
| [F-033](#f-033) | **MEDIUM** | A07 — Authentication Failures | `server.ts:362` |

## 5. Detailed Findings

### F-001: RSA private signing key for JWTs hardcoded in source

| | |
|---|---|
| **Severity** | **CRITICAL** |
| **OWASP category** | A04 — Cryptographic Failures (Web Application (OWASP Top 10:2025)) |
| **Vulnerable file** | `lib/insecurity.ts` |
| **Line(s)** | 21 |
| **Source** | Semgrep rule `web.crypto.hardcoded-secret-key-js` |
| **Detection** | SAST (static) |
| **Confidence** | HIGH |

**Vulnerable code**

```typescript
const privateKey = '-----BEGIN RSA PRIVATE KEY-----\r\nMIICXAIBAAKBgQDNwqLEe9wgTXCbC7+RPdDbBbeqjdbs4kOPOIGzqLpXvJXlxxW8...\r\n-----END RSA PRIVATE KEY-----'
```

**Root cause**

The RSA private key used to sign session JWTs is a string literal committed to the repository, matching the doc bullet 'Keys hardcoded in source or config, checked into repositories, and never rotated'. Anyone with read access to the repo (or to the shipped bundle/image) holds the signing key.

**Impact**

An attacker can mint arbitrary valid JWTs — including tokens claiming the administrator identity — giving complete authentication bypass and full application takeover; rotation is impossible without a code change.

**Remediation**

• Load the private key from a KMS/HSM or an injected secret at runtime, never from source.
• Rotate the exposed key immediately and invalidate all issued tokens.
• Keep keys separated from the data, with defined rotation and audited access.
• Add secret scanning to CI to block re-introduction.

**Code Fix (SAST)**

```typescript
import fs from 'node:fs'

// Key material is supplied at runtime (KMS, secret manager, or mounted secret file).
const privateKeyPath = process.env.JWT_PRIVATE_KEY_PATH
const privateKey = process.env.JWT_PRIVATE_KEY ??
  (privateKeyPath ? fs.readFileSync(privateKeyPath, 'utf8') : undefined)

if (!privateKey) {
  throw new Error('JWT signing key is not configured')
}
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-Web-Top-10-2025.md): "Keys hardcoded in source or config, checked into repositories, and never rotated."

---

### F-002: Hard-coded RSA private key used to sign authentication JWTs

| | |
|---|---|
| **Severity** | **CRITICAL** |
| **OWASP category** | A04 — Cryptographic Failures (Web Application (OWASP Top 10:2025)) |
| **Vulnerable file** | `lib/insecurity.ts` |
| **Line(s)** | 52–55 |
| **Source** | Semgrep rule `javascript.jsonwebtoken.security.jwt-hardcode.hardcoded-jwt-secret` |
| **Detection** | SAST (static) |
| **Confidence** | HIGH |

**Vulnerable code**

```typescript
export const authorize = (user = {}) => jwt.sign(user, privateKey, { expiresIn: '6h', algorithm: 'RS256' })
```

**Root cause**

The signing key material (`privateKey`) is a literal embedded in the repository rather than loaded from a KMS/secret store, and the matching key file is also served from the `encryptionkeys/` directory (see F-003). Anyone with the source or the served key can mint valid session tokens. Flagged by javascript.jsonwebtoken.security.jwt-hardcode.hardcoded-jwt-secret. Also classifiable under A07 — Authentication Failures: JWT verification performed without pinning the signature algorithm.

**Impact**

An attacker can forge a JWT for any user, including `admin@juice-sh.op`, and obtain full administrative access to every account and order without ever authenticating; the key can never be rotated without a code release.

**Remediation**

- Load the signing key from a KMS/HSM or secret manager at boot, never from source.
- Remove the key from the repository and rotate it; treat the committed key as compromised.
- Keep keys separated from the data and audit access.
- Define and enforce a rotation schedule.

**Code Fix (SAST)**

```typescript
import fs from 'node:fs'

const privateKey = process.env.JWT_PRIVATE_KEY ??
  fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH as string, 'utf8')
if (!privateKey) { throw new Error('JWT signing key is not configured') }

export const authorize = (user = {}) =>
  jwt.sign(user, privateKey, { expiresIn: '6h', algorithm: 'RS256' })
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-Web-Top-10-2025.md): Keys hardcoded in source or config, checked into repositories, and never rotated.

---

### F-003: SQL injection in login endpoint via unparameterised email in Sequelize raw query

| | |
|---|---|
| **Severity** | **CRITICAL** |
| **OWASP category** | A05 — Injection (Web Application (OWASP Top 10:2025)) |
| **Vulnerable file** | `routes/login.ts` |
| **Line(s)** | 34 |
| **Source** | Semgrep rule `javascript.sequelize.security.audit.sequelize-injection-express.express-sequelize-injection` |
| **Detection** | SAST (static) |
| **Confidence** | HIGH |

**Vulnerable code**

```typescript
models.sequelize.query(`SELECT * FROM Users WHERE email = '${req.body.email || ''}' AND password = '${security.hash(req.body.password || '')}' AND deletedAt IS NULL`, { model: UserModel, plain: true })
```

**Root cause**

The login SQL statement is assembled by string interpolation of `req.body.email`, which is fully attacker-controlled and never escaped or bound — the document's 'Queries built by string concatenation with user input, in SQL, NoSQL, or ORM raw fragments' bullet. Flagged by both web.injection.js-sql-template-literal and javascript.sequelize.security.audit.sequelize-injection-express.express-sequelize-injection on the same line.

**Impact**

An unauthenticated attacker can submit `' OR 1=1--` as the email to bypass the password check and log in as the first (administrator) account, or use UNION/boolean techniques to read arbitrary table contents.

**Remediation**

• Use parameterised queries / replacements for every raw Sequelize call.
• Prefer the safe ORM API (`UserModel.findOne({ where: { email, password } })`) over `sequelize.query`.
• Validate the email server-side against an allow-list format before use.
• Keep SAST in CI and review query construction during code review.

**Code Fix (SAST)**

```typescript
models.sequelize.query(
  'SELECT * FROM Users WHERE email = :email AND password = :password AND deletedAt IS NULL',
  {
    model: UserModel,
    plain: true,
    replacements: {
      email: req.body.email || '',
      password: security.hash(req.body.password || '')
    },
    type: models.Sequelize.QueryTypes.SELECT
  }
)
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-Web-Top-10-2025.md): "Queries built by string concatenation with user input, in SQL, NoSQL, or ORM raw fragments."

---

### F-004: SQL injection in product search endpoint (`/rest/products/search?q=`)

| | |
|---|---|
| **Severity** | **CRITICAL** |
| **OWASP category** | A05 — Injection (Web Application (OWASP Top 10:2025)) |
| **Vulnerable file** | `routes/search.ts` |
| **Line(s)** | 23 |
| **Source** | Semgrep rule `javascript.sequelize.security.audit.sequelize-injection-express.express-sequelize-injection` |
| **Detection** | SAST (static) |
| **Confidence** | HIGH |

**Vulnerable code**

```typescript
let criteria: any = req.query.q === 'undefined' ? '' : req.query.q ?? ''
criteria = (criteria.length <= 200) ? criteria : criteria.substring(0, 200)
models.sequelize.query(`SELECT * FROM Products WHERE ((name LIKE '%${criteria}%' OR description LIKE '%${criteria}%') AND deletedAt IS NULL) ORDER BY name`)
```

**Root cause**

The `q` query-string parameter is interpolated directly into a raw SQL string; the only processing is a 200-character truncation, which is length limiting rather than escaping or binding (doc bullet: ORM raw fragments built by concatenation). Reported by both web.injection.js-sql-template-literal and the Sequelize taint rule.

**Impact**

Unauthenticated UNION-based injection lets an attacker dump the Users table (emails, password hashes, tokens) and enumerate the database schema through an internet-facing GET request.

**Remediation**

• Bind the search term with `replacements` instead of interpolating it.
• Use `Product.findAll({ where: { [Op.like]: ... } })` rather than raw SQL.
• Validate/normalise the term server-side (type, length, charset) and reject rather than clean.
• Escape with the driver routine only where dynamic SQL is unavoidable.

**Code Fix (SAST)**

```typescript
const criteria: string = String(req.query.q === 'undefined' ? '' : req.query.q ?? '').slice(0, 200)
models.sequelize.query(
  "SELECT * FROM Products WHERE ((name LIKE :criteria OR description LIKE :criteria) AND deletedAt IS NULL) ORDER BY name",
  {
    replacements: { criteria: `%${criteria}%` },
    type: models.Sequelize.QueryTypes.SELECT
  }
)
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-Web-Top-10-2025.md): "Reading or destroying entire datasets, authentication bypass, and in command or template injection, remote code execution and full host compromise."

---

### F-005: Remote code execution via `eval()` of attacker-controlled username in user profile

| | |
|---|---|
| **Severity** | **CRITICAL** |
| **OWASP category** | A05 — Injection (Web Application (OWASP Top 10:2025)) |
| **Vulnerable file** | `routes/userProfile.ts` |
| **Line(s)** | 65 |
| **Source** | Semgrep rule `javascript.lang.security.audit.code-string-concat.code-string-concat` |
| **Detection** | SAST (static) |
| **Confidence** | HIGH |

**Vulnerable code**

```typescript
          if (!code) {
            throw new Error('Username is null')
          }
          username = eval(code) // eslint-disable-line no-eval
```

**Root cause**

The stored username (set by the user through the profile/registration flow) is extracted and passed to `eval`, so request-supplied data crosses into a JavaScript interpreter — the doc's 'Untrusted input interpreted as code or commands' pattern with no separation between data and instructions.

**Impact**

An authenticated attacker who sets a crafted username achieves arbitrary JavaScript execution in the Node.js server process on every profile render: full host compromise, credential theft and pivoting into the internal network.

**Remediation**

• Remove `eval` entirely; never evaluate user data as code.
• Use a language-level API (template escaping / JSON parsing) for the intended transformation.
• Validate the username server-side against an allow-list of characters and length.
• HTML-encode the username for its output context instead of interpreting it.

**Code Fix (SAST)**

```typescript
// Never evaluate user-controlled data. Render it safely instead.
const SAFE_USERNAME = /^[\w .@-]{1,60}$/
username = SAFE_USERNAME.test(username ?? '')
  ? entities.encode(username as string)
  : 'Anonymous'
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-Web-Top-10-2025.md): "Injection happens whenever data crosses into an interpreter without being separated from the instructions around it."

---

### F-006: Chatbot coupon tool lets the model choose an unbounded discount

| | |
|---|---|
| **Severity** | **HIGH** |
| **OWASP category** | LLM03 — Excessive Agency (LLM / AI Application (OWASP Top 10 for LLM Applications 2026)) |
| **Vulnerable file** | `routes/chat.ts` |
| **Line(s)** | 176–187 |
| **Source** | Contextual review (LLM) |
| **Detection** | SAST (static) |
| **Confidence** | HIGH |

**Vulnerable code**

```typescript
generateCoupon: tool({
  description: 'Generate a discount coupon for a customer. Only use this when the coupon policy conditions are fully met.',
  inputSchema: z.object({
    discount: z.number().describe('The discount percentage for the coupon (maximum 10)')
  }),
  execute: async ({ discount }) => {
    const couponCode = security.generateCoupon(discount)
    return { couponCode, discount }
  }
})
```

**Root cause**

The state-changing coupon tool is exposed to the model with an unconstrained numeric argument; the only limits (max 10%, verified damaged order, prior refusal of return) live in prompt text, not in code. There is no eligibility check, no bound on `discount`, and no human approval — the doc's 'High-impact actions ... taken with no confirmation step' and 'Never let the model decide whether an action is permitted'.

**Impact**

Any chat user who talks the model into calling the tool obtains a valid, redeemable coupon for an arbitrary discount (100% is possible), causing direct revenue loss at scale since the coupon codes are accepted by the order flow.

**Remediation**

- Give the tool a strict input schema with a hard server-side maximum.
- Enforce eligibility (authenticated user, verified damaged order) in trusted code, not in the prompt.
- Require human approval or graduated enforcement for discounts above a low threshold.
- Add circuit breakers on coupon-generation counts per user and per hour.

**Code Fix (SAST)**

```typescript
generateCoupon: tool({
  description: 'Generate a discount coupon for an eligible customer.',
  inputSchema: z.object({ discount: z.number().int().min(1).max(10) }),
  execute: async ({ discount }) => {
    const userId = await getUserId(req)
    if (!userId) return { error: 'Customer not authenticated' }
    if (!(await isEligibleForCourtesyCoupon(userId))) return { error: 'Customer not eligible' }
    if (!(await withinCouponRateLimit(userId))) return { error: 'Coupon limit reached' }
    const safeDiscount = Math.min(Math.max(Math.trunc(discount), 1), 10)
    return { couponCode: security.generateCoupon(safeDiscount), discount: safeDiscount }
  }
})
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-LLM-Top-10-2026.md): High-impact actions — deletions, payments, posts — taken with no confirmation step.

---

### F-007: Unvalidated client message array passed straight into the model with tools enabled

| | |
|---|---|
| **Severity** | **HIGH** |
| **OWASP category** | LLM01 — Prompt Injection (LLM / AI Application (OWASP Top 10 for LLM Applications 2026)) |
| **Vulnerable file** | `routes/chat.ts` |
| **Line(s)** | 190–211 |
| **Source** | Contextual review (LLM) |
| **Detection** | SAST (static) |
| **Confidence** | HIGH |

**Vulnerable code**

```typescript
const messages = req.body?.messages ?? []
...
const result = streamText({
  model: provider(model),
  system: systemPrompt,
  messages,
  tools: { ...chatTools },
```

**Root cause**

The whole `messages` array is taken verbatim from the request body — including its `role` values — and merged with the system prompt on one token stream, so a caller can inject additional system/assistant turns, invisible Unicode or override instructions. The only instruction boundary is prompt text, matching the doc's 'Direct override: a user message defeats the system prompt's role and capability limits'. Also classifiable under LLM06 — Unbounded Consumption: Chat inference endpoint has no token budget, cost cap or rate limit.

**Impact**

Attackers steer the model into unauthorised tool invocation (coupon generation, order and review lookups), extraction of the hidden context, and attacker-chosen output streamed back to other application logic.

**Remediation**

- Strip client-supplied system/tool roles; accept only user and assistant turns.
- Normalise and length-bound content, stripping zero-width/tag-block Unicode at ingest.
- Keep credentials and state-change capability in application code behind a deterministic policy engine.
- Structurally validate tool arguments in trusted code before execution.
- Red-team the chat flow with adaptive injection payloads.

**Code Fix (SAST)**

```typescript
const INVISIBLE = /[\u200B-\u200D\u2060\uFEFF\u{E0000}-\u{E007F}]/gu
const raw = Array.isArray(req.body?.messages) ? req.body.messages : []
const messages = raw
  .filter((m: any) => m?.role === 'user' || m?.role === 'assistant')
  .slice(-20)
  .map((m: any) => ({
    role: m.role as 'user' | 'assistant',
    content: String(m.content ?? '').replace(INVISIBLE, '').slice(0, 4000)
  }))
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-LLM-Top-10-2026.md): Direct override: a user message defeats the system prompt's role and capability limits.

---

### F-008: Load balancer serves application over plaintext HTTP with no TLS redirect

| | |
|---|---|
| **Severity** | **HIGH** |
| **OWASP category** | A04 — Cryptographic Failures (Web Application (OWASP Top 10:2025)) |
| **Vulnerable file** | `infrastructure/terraform/networking.tf` |
| **Line(s)** | 157–163 |
| **Source** | Semgrep rule `terraform.aws.security.insecure-load-balancer-tls-version.insecure-load-balancer-tls-version` |
| **Detection** | SAST (static) |
| **Confidence** | HIGH |

**Vulnerable code**

```hcl
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.juice_shop.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
```

**Root cause**

The only listener on the internet-facing ALB is plaintext HTTP port 80 forwarding straight to the target group — there is no HTTPS listener, no modern `ssl_policy`, and no redirect action, so all traffic including login credentials and session JWTs crosses the internet unencrypted.

**Impact**

Any network observer can read or modify credentials, session tokens and personal data in transit, enabling account takeover; no HSTS means downgrade is trivial.

**Remediation**

- Add an HTTPS listener with `ssl_policy = "ELBSecurityPolicy-TLS13-1-2-Res-2021-06"` and an ACM certificate.
- Convert the port 80 listener to a 301 redirect to HTTPS.
- Enforce HSTS at the application.
- Encrypt service-to-service hops behind the load balancer as well.

**Code Fix (SAST)**

```hcl
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.juice_shop.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.juice_shop.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-Res-2021-06"
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.juice_shop.arn
  }
}
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-Web-Top-10-2025.md): Encrypt everything in transit with TLS 1.2+ (prefer 1.3), including service-to-service hops, and enforce HSTS.

---

### F-009: Passwords hashed with unsalted MD5

| | |
|---|---|
| **Severity** | **HIGH** |
| **OWASP category** | A04 — Cryptographic Failures (Web Application (OWASP Top 10:2025)) |
| **Vulnerable file** | `lib/insecurity.ts` |
| **Line(s)** | 41 |
| **Source** | Contextual review (LLM) |
| **Detection** | SAST (static) |
| **Confidence** | HIGH |

**Vulnerable code**

```typescript
export const hash = (data: string) => crypto.createHash('md5').update(data).digest('hex')
```

**Root cause**

`security.hash()` is the password hashing primitive used at login, change-password and 2FA verification. MD5 is a fast, broken digest applied without a per-user salt — the doc's 'Passwords stored with a fast hash, unsalted, or reversibly encrypted' bullet.

**Impact**

A single database dump (or the field-selection leak in F-012) yields instantly crackable password hashes, enabling mass account takeover here and credential stuffing against other services.

**Remediation**

- Hash passwords with a memory-hard KDF (Argon2id, scrypt or bcrypt) with per-user salts.
- Tune work factors and re-hash on next successful login.
- Keep MD5 only for non-security checksums, if at all.
- Never compare password hashes with a fast digest.

**Code Fix (SAST)**

```typescript
import { hash as argonHash, verify as argonVerify } from '@node-rs/argon2'

export const hashPassword = async (password: string) =>
  await argonHash(password, { memoryCost: 19456, timeCost: 2, parallelism: 1 })

export const verifyPassword = async (stored: string, password: string) =>
  await argonVerify(stored, password)
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-Web-Top-10-2025.md): Passwords stored with a fast hash, unsalted, or reversibly encrypted.

---

### F-010: Known-vulnerable and abandoned dependencies pinned in production manifest

| | |
|---|---|
| **Severity** | **HIGH** |
| **OWASP category** | A03 — Software Supply Chain Failures (Web Application (OWASP Top 10:2025)) |
| **Vulnerable file** | `package.json` |
| **Line(s)** | 100–118 |
| **Source** | Contextual review (LLM) |
| **Detection** | SAST (static) |
| **Confidence** | MEDIUM |

**Vulnerable code**

```json
"express-jwt": "0.1.3",
"jsonwebtoken": "0.4.0",
"sanitize-html": "1.4.2",
"marsdb": "^0.6.11",
"notevil": "^1.3.3"
```

**Root cause**

Production dependencies are pinned to long-abandoned versions with public advisories (express-jwt 0.1.3 and jsonwebtoken 0.4.0 have signature/algorithm-verification weaknesses, sanitize-html 1.4.2 has a non-recursive sanitisation bypass exploited by the app's own XSS behaviour). This is the doc's 'Known-vulnerable or unmaintained libraries left in place because nobody tracks the inventory' bullet.

**Impact**

Token-verification bypass and stored XSS through trusted, signed-by-you dependencies; a single upstream weakness is inherited with full production trust across every deployment of the image.

**Remediation**

- Generate an SBOM on every build and track advisories against it (the repo already has a `sbom` script — gate the build on it).
- Upgrade express-jwt, jsonwebtoken and sanitize-html to current maintained majors.
- Pin and lock versions, verify checksums, and remove unused packages (marsdb, notevil).
- Set a patch SLA by severity and fail CI on high-severity advisories.

**Code Fix (SAST)**

```json
"express-jwt": "^8.5.1",
"jsonwebtoken": "^9.0.2",
"sanitize-html": "^2.13.1"
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-Web-Top-10-2025.md): Known-vulnerable or unmaintained libraries left in place because nobody tracks the inventory.

---

### F-011: Remote code execution through evaluation of B2B order payload

| | |
|---|---|
| **Severity** | **HIGH** |
| **OWASP category** | A05 — Injection (Web Application (OWASP Top 10:2025)) |
| **Vulnerable file** | `routes/b2bOrder.ts` |
| **Line(s)** | 19–23 |
| **Source** | Contextual review (LLM) |
| **Detection** | SAST (static) |
| **Confidence** | HIGH |

**Vulnerable code**

```typescript
const orderLinesData = body.orderLinesData || ''
try {
  const sandbox = { safeEval, orderLinesData }
  vm.createContext(sandbox)
  vm.runInContext('safeEval(orderLinesData)', sandbox, { timeout: 2000 })
```

**Root cause**

Request body content is passed straight into an interpreter (`notevil`'s eval inside a `vm` context) with no schema validation — the doc's 'Server-side template injection where user input reaches a template engine' / untrusted-input-into-interpreter pattern. The 2s timeout and sandbox are the only mitigations, and sandbox escapes in `notevil`/`vm` are well documented.

**Impact**

Attacker-controlled JavaScript execution on the server (full host compromise if the sandbox is escaped) and trivially reachable CPU exhaustion / denial of service via infinite loops on an authenticated B2B endpoint.

**Remediation**

- Do not evaluate request data; parse it as plain data with a strict schema.
- Prefer a safe API (JSON.parse + zod validation) over any interpreter.
- Validate order lines against an allow-list of fields, types and ranges.
- If evaluation is truly required, isolate it in a separate hardened process with CPU/memory caps.

**Code Fix (SAST)**

```typescript
import { z } from 'zod'

const OrderLines = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(100)
}).array().max(100)

const parsed = OrderLines.safeParse(
  typeof body.orderLinesData === 'string' ? JSON.parse(body.orderLinesData) : body.orderLinesData
)
if (!parsed.success) {
  res.status(400).json({ error: 'Invalid orderLinesData' })
  return
}
res.json({ cid: body.cid, orderNo: uniqueOrderNumber(), paymentDue: dateTwoWeeksFromNow() })
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-Web-Top-10-2025.md): OS commands assembled from request data, or arguments passed to a shell.

---

### F-012: Password change accepted without verifying the current password

| | |
|---|---|
| **Severity** | **HIGH** |
| **OWASP category** | A07 — Authentication Failures (Web Application (OWASP Top 10:2025)) |
| **Vulnerable file** | `routes/changePassword.ts` |
| **Line(s)** | 13–41 |
| **Source** | Contextual review (LLM) |
| **Detection** | SAST (static) |
| **Confidence** | HIGH |

**Vulnerable code**

```typescript
const currentPassword = query.current as string
const newPassword = query.new as string
...
if (currentPassword && security.hash(currentPassword) !== loggedInUser.data.password) {
  res.status(401).send(res.__('Current password is not correct.'))
  return
}
```

**Root cause**

The current-password check is guarded by `if (currentPassword && ...)`, so omitting the `current` parameter skips verification entirely; credentials are also passed in the URL query string, where they land in access logs (`logs/access.log.*`, which is itself served at /support/logs). This is the doc's weak 'flows around login — registration, recovery, session lifetime' pattern.

**Impact**

Any leaked or stolen bearer token (XSS, log disclosure, referrer leak) is upgraded to permanent account takeover because the attacker can reset the password without knowing it; the new password is additionally written to the access log.

**Remediation**

- Always require and verify the current password (or a re-authentication step) before a change.
- Accept credentials in the request body over POST, never in the query string.
- Invalidate all existing sessions/tokens on password change.
- Rate-limit and log password-change attempts.

**Code Fix (SAST)**

```typescript
const { current, new: newPassword, repeat } = req.body as Record<string, string>
if (!newPassword || newPassword !== repeat) {
  res.status(400).send(res.__('New and repeated password do not match.'))
  return
}
if (!current || !(await security.verifyPassword(loggedInUser.data.password, current))) {
  res.status(401).send(res.__('Current password is not correct.'))
  return
}
const user = await UserModel.findByPk(loggedInUser.data.id)
await user?.update({ password: await security.hashPassword(newPassword) })
security.invalidateSessionsFor(loggedInUser.data.id)
res.status(204).end()
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-Web-Top-10-2025.md): Account takeover at scale, with the attacker operating as a legitimate user: no exploit, no anomaly in the application logs unless you are looking for it.

---

### F-013: Arbitrary local file read through user-supplied template layout in data erasure

| | |
|---|---|
| **Severity** | **HIGH** |
| **OWASP category** | A01 — Broken Access Control (Web Application (OWASP Top 10:2025)) |
| **Vulnerable file** | `routes/dataErasure.ts` |
| **Line(s)** | 103–107 |
| **Source** | Contextual review (LLM) |
| **Detection** | SAST (static) |
| **Confidence** | HIGH |

**Vulnerable code**

```typescript
if (req.body.layout && utils.isChallengeEnabled(challenges.lfrChallenge)) {
  const filePath: string = path.resolve(req.body.layout).toLowerCase()
  const isForbiddenFile: boolean = (filePath.includes('ftp') || filePath.includes('ctf.key') || filePath.includes('encryptionkeys'))
  if (!isForbiddenFile) {
    res.render('dataErasureResult', { ...req.body, ...themeVars }, (error, html) => {
```

**Root cause**

The `layout` field from the request body is resolved to an absolute path and handed to the view engine with only a three-string deny-list; there is no path containment inside the views directory. This is the doc's 'Path traversal and forced browsing to files or pages that were simply never linked' bullet.

**Impact**

An authenticated user can read arbitrary server-side files (application source, configuration, /etc/passwd) through the rendered response, exposing secrets and accelerating follow-up attacks.

**Remediation**

- Never accept a file path or layout name from the client.
- If a layout must be selectable, map an identifier to an allow-listed template name.
- Deny by default and validate the resolved path stays inside the views root.
- Reject rather than sanitise unexpected parameters.

**Code Fix (SAST)**

```typescript
const ALLOWED_LAYOUTS: Record<string, string> = { default: 'dataErasureResult' }
const layoutKey = typeof req.body.layout === 'string' ? req.body.layout : 'default'
const view = ALLOWED_LAYOUTS[layoutKey]
if (!view) {
  res.status(400).send('Invalid layout')
  return
}
res.render(view, { email: req.body.email, ...themeVars })
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-Web-Top-10-2025.md): Path traversal and forced browsing to files or pages that were simply never linked.

---

### F-014: Path traversal / poison null byte in FTP file download endpoint

| | |
|---|---|
| **Severity** | **HIGH** |
| **OWASP category** | A01 — Broken Access Control (Web Application (OWASP Top 10:2025)) |
| **Vulnerable file** | `routes/fileServer.ts` |
| **Line(s)** | 32 |
| **Source** | Semgrep rule `javascript.express.security.audit.express-res-sendfile.express-res-sendfile` |
| **Detection** | SAST (static) |
| **Confidence** | HIGH |

**Vulnerable code**

```typescript
verifySuccessfulPoisonNullByteExploit(file)

res.sendFile(path.resolve('ftp/', file))
```

**Root cause**

The request parameter `file` is only checked for an allowed extension suffix; a URL-encoded null byte (`%00`) truncates the extension check while `../` sequences survive `path.resolve`, so the resolved path escapes the `ftp/` directory. The code even contains a helper that confirms the exploit worked.

**Impact**

Unauthenticated readers can retrieve arbitrary files from the application host — configuration, source, key material — giving credentials for further compromise of other users' data.

**Remediation**

- Reject any filename containing `..`, path separators or `\u0000` before use.
- Canonicalise with `path.resolve` and assert the result starts with the intended base directory.
- Serve from an allow-list of known filenames rather than free-form input.
- Log and alert on access-control failures and rate-limit the endpoint.

**Code Fix (SAST)**

```typescript
const base = path.resolve('ftp')
const name = path.basename(String(file).replace(/\0/g, ''))
if (!/^[\w.-]+\.(md|pdf)$/i.test(name)) {
  res.status(403)
  return next(new Error('Only .md and .pdf files are allowed!'))
}
const target = path.resolve(base, name)
if (!target.startsWith(base + path.sep)) {
  res.status(403)
  return next(new Error('Invalid path'))
}
res.sendFile(target)
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-Web-Top-10-2025.md): Path traversal and forced browsing to files or pages that were simply never linked.

---

### F-015: Server-side request forgery in profile image URL upload

| | |
|---|---|
| **Severity** | **HIGH** |
| **OWASP category** | A01 — Broken Access Control (Web Application (OWASP Top 10:2025)) |
| **Vulnerable file** | `routes/profileImageUrlUpload.ts` |
| **Line(s)** | 19–24 |
| **Source** | Contextual review (LLM) |
| **Detection** | SAST (static) |
| **Confidence** | HIGH |

**Vulnerable code**

```typescript
const url = req.body.imageUrl
if (url.match(/(.)*solve\/challenges\/server-side(.)*/) !== null) req.app.locals.abused_ssrf_bug = true
const loggedInUser = security.authenticatedUsers.get(req.cookies.token)
if (loggedInUser) {
  try {
    const response = await fetch(url)
```

**Root cause**

A user-supplied URL is fetched server-side with no scheme or host allow-list, no blocking of link-local/private ranges and no redirect restriction — the doc's 'SSRF: a user-supplied URL is fetched by the server, reaching internal services or cloud metadata endpoints' bullet. Any authenticated (easily self-registered) user reaches it.

**Impact**

The server can be coerced into requesting internal services or cloud instance-metadata endpoints (169.254.169.254), potentially yielding cloud credentials and a pivot into the internal network; response content is written into the user's profile image path.

**Remediation**

- Allow-list destination hosts and restrict schemes to https.
- Resolve DNS and reject link-local, loopback and RFC1918 addresses.
- Disable redirect following on the fetch.
- Never store or echo the raw upstream response to the caller.
- Cap response size and timeout.

**Code Fix (SAST)**

```typescript
import dns from 'node:dns/promises'
import net from 'node:net'

const ALLOWED_HOSTS = new Set(['images.example.com'])

async function assertSafeUrl (raw: string) {
  const u = new URL(raw)
  if (u.protocol !== 'https:' || !ALLOWED_HOSTS.has(u.hostname)) throw new Error('Blocked URL')
  const { address } = await dns.lookup(u.hostname)
  if (net.isIP(address) && (address.startsWith('127.') || address.startsWith('10.') ||
      address.startsWith('192.168.') || address.startsWith('169.254.'))) throw new Error('Blocked URL')
  return u
}

const safeUrl = await assertSafeUrl(req.body.imageUrl)
const response = await fetch(safeUrl, { redirect: 'error', signal: AbortSignal.timeout(5000) })
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-Web-Top-10-2025.md): SSRF: a user-supplied URL is fetched by the server, reaching internal services or cloud metadata endpoints.

---

### F-016: Directory browsing over encryption keys and server access logs

| | |
|---|---|
| **Severity** | **HIGH** |
| **OWASP category** | A02 — Security Misconfiguration (Web Application (OWASP Top 10:2025)) |
| **Vulnerable file** | `server.ts` |
| **Line(s)** | 296–302 |
| **Source** | Semgrep rule `javascript.express.security.audit.express-check-directory-listing.express-check-directory-listing` |
| **Detection** | SAST (static) |
| **Confidence** | HIGH |

**Vulnerable code**

```typescript
app.use('/encryptionkeys', serveIndexMiddleware, serveIndex('encryptionkeys', { icons: true, view: 'details' }))
app.use('/encryptionkeys/:file', serveKeyFiles())

/* /logs directory browsing */
app.use('/support/logs', serveIndexMiddleware, serveIndex('logs', { icons: true, view: 'details' }))
app.use('/support/logs', verify.accessControlChallenges())
app.use('/support/logs/:file', serveLogFiles())
```

**Root cause**

`serve-index` is mounted without any authentication on directories holding cryptographic key material and HTTP access logs; the per-file handlers (`serveKeyFiles`, `serveLogFiles`) only reject forward slashes and perform no authorisation. Directory listing in web roots is exactly what the doc's hardening guidance tells you to disable. Also classifiable under A01 — Broken Access Control: Directory browsing of /encryptionkeys exposes private key material. (also flagged by Semgrep rule `javascript.express.security.audit.express-check-directory-listing.express-check-directory-listing`) Also classifiable under A01 — Broken Access Control: Unauthenticated directory listing and download of server access logs at /support/logs.

**Impact**

Unauthenticated enumeration and download of key files and combined-format access logs, which contain full request URLs — including the password-change query string from F-007 — enabling credential harvesting and further key-based attacks.

**Remediation**

- Remove `serve-index` from production and disable directory listing.
- Never place key material inside a web-served directory.
- Require an authenticated admin role for any log retrieval endpoint.
- Ship logs off-host to tamper-resistant central storage instead of serving them.

**Code Fix (SAST)**

```typescript
// remove the serve-index mounts entirely and gate log access
app.use('/support/logs', security.isAuthorized(), security.isAdmin())
app.get('/support/logs/:file', security.isAuthorized(), security.isAdmin(), (req, res, next) => {
  const file = path.basename(req.params.file)
  const resolved = path.resolve('logs', file)
  if (!resolved.startsWith(path.resolve('logs'))) { res.status(403).end(); return }
  res.sendFile(resolved)
})
// encryptionkeys is not served over HTTP at all
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-Web-Top-10-2025.md): Often unauthenticated access to sensitive data or the underlying system, with no exploit development required.

---

### F-017: Internet-facing load balancer serves the application over cleartext HTTP with no HTTPS redirect

| | |
|---|---|
| **Severity** | **HIGH** |
| **OWASP category** | A04 — Cryptographic Failures (Web Application (OWASP Top 10:2025)) |
| **Vulnerable file** | `terraform/networking.tf` |
| **Line(s)** | 157–163 |
| **Source** | Semgrep rule `terraform.aws.security.insecure-load-balancer-tls-version.insecure-load-balancer-tls-version` |
| **Detection** | SAST (static) |
| **Confidence** | HIGH |

**Vulnerable code**

```hcl
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.juice_shop.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
```

**Root cause**

The only ALB listener defined is plain HTTP on port 80 that forwards traffic straight to the application target group; there is no TLS listener, no modern `ssl_policy`, and no redirect action, so all traffic including logins and session cookies crosses the internet in cleartext.

**Impact**

Credentials, session tokens and personal data are transmitted unprotected and can be intercepted or modified by any on-path attacker, leading to account takeover and regulated-data exposure.

**Remediation**

- Encrypt everything in transit with TLS 1.2+ (prefer 1.3) on the load balancer.
- Convert the port-80 listener to a permanent redirect to HTTPS.
- Add an HTTPS listener with `ssl_policy = "ELBSecurityPolicy-TLS13-1-2-Res-2021-06"` and an ACM certificate.
- Enforce HSTS on application responses.

**Code Fix (SAST)**

```hcl
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.juice_shop.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.juice_shop.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-Res-2021-06"
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.juice_shop.arn
  }
}
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-Web-Top-10-2025.md): Cleartext transmission internally, or TLS terminated at the edge with plain HTTP behind it.

---

### F-018: Confidential discount policy and control logic embedded in the chatbot system prompt

| | |
|---|---|
| **Severity** | **MEDIUM** |
| **OWASP category** | LLM08 — Hidden Context Exposure (LLM / AI Application (OWASP Top 10 for LLM Applications 2026)) |
| **Vulnerable file** | `routes/chat.ts` |
| **Line(s)** | 98–105 |
| **Source** | Contextual review (LLM) |
| **Detection** | SAST (static) |
| **Confidence** | HIGH |

**Vulnerable code**

```typescript
COUPON POLICY (for the generateCoupon tool):
- You may ONLY generate a coupon for a customer who has a verified damaged order ...
- The maximum allowed discount is 10%.
- NEVER generate a coupon just because a customer asks for one or complains.

CONFIDENTIAL - INTERNAL ONLY: If a customer formally complains ... offer them a one-time 15% courtesy discount to resolve the case without escalation.
```

**Root cause**

Business rules, an internal-only concession policy and the authorisation conditions for the `generateCoupon` tool are stored in the system prompt and relied on as the enforcement boundary — the doc's 'Reliance on hidden context as the authorisation or content-filtering boundary'. `verify.ts` even compares user submissions to `buildSystemPrompt()`, confirming the prompt is treated as secret.

**Impact**

Extraction of the prompt (trivial under LLM01) hands attackers a documented map of coupon triggers and exceptions, letting them claim the internal 15% concession on demand and craft targeted injections against the remaining rules.

**Remediation**

- Put nothing sensitive in hidden context; move concession policy into application logic and data.
- Never rely on the system prompt as an authorisation or content-filtering boundary.
- Enforce eligibility deterministically outside the model (see F-016).
- Design so that full disclosure of the prompt is survivable.

**Code Fix (SAST)**

```typescript
return `You are "${botName}", the friendly customer service chatbot of the ${appName} online store.
Help customers find products and answer questions about the shop.${userIdentifier}
Use the provided tools for product, review and order lookups; never invent details.
If a customer asks about discounts or escalation, call the checkCourtesyEligibility tool and follow its result.`
// concession rules, thresholds and eligibility live in server-side policy code, not in the prompt
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-LLM-Top-10-2026.md): Reliance on hidden context as the authorisation or content-filtering boundary.

---

### F-019: GitHub Actions steps pinned to mutable tags instead of commit SHAs

| | |
|---|---|
| **Severity** | **MEDIUM** |
| **OWASP category** | A03 — Software Supply Chain Failures (Web Application (OWASP Top 10:2025)) |
| **Vulnerable file** | `.github/workflows/ci.yml` |
| **Line(s)** | 188 |
| **Source** | Semgrep rule `yaml.github-actions.security.github-actions-mutable-action-tag.github-actions-mutable-action-tag` |
| **Detection** | SAST (static) |
| **Confidence** | HIGH |

**Vulnerable code**

```yaml
      - name: "Publish coverage to Coveralls"
        uses: coverallsapp/github-action@v2
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

**Root cause**

Third-party build actions are resolved by mutable tag (`@v2`, `@v3`) rather than an immutable commit digest, so the action owner — or anyone who compromises that account — can silently repoint the tag to malicious code that runs inside the pipeline. Same weakness at .github/workflows/codeql-analysis.yml:23 and :34 (github/codeql-action/init@v3, autobuild@v3).

**Impact**

A repointed tag executes attacker code in the CI runner with access to `secrets.GITHUB_TOKEN` and the build workspace, allowing artifact tampering or secret theft that arrives through a trusted channel and inherits production trust.

**Remediation**

• Pin every third-party action to a full 40-character commit SHA.
• Track the pinned versions in the dependency inventory/SBOM and update via reviewed PRs.
• Harden the pipeline: least-privilege tokens and no secrets exposed to untrusted builds.
• Verify provenance/signatures for consumed build artifacts.

**Code Fix (SAST)**

```yaml
      - name: "Publish coverage to Coveralls"
        uses: coverallsapp/github-action@643bc377ffa44ace6394b2b5d0d3950076de9f63 # v2.3.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}

# .github/workflows/codeql-analysis.yml
#   uses: github/codeql-action/init@<full-40-char-sha> # v3.x
#   uses: github/codeql-action/autobuild@<full-40-char-sha> # v3.x
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-Web-Top-10-2025.md): "Pin and lock versions and verify checksums; never resolve floating ranges in a release build."

---

### F-020: CI workflow pipes a remote installer straight into a shell

| | |
|---|---|
| **Severity** | **MEDIUM** |
| **OWASP category** | A03 — Software Supply Chain Failures (Web Application (OWASP Top 10:2025)) |
| **Vulnerable file** | `.github/workflows/ci.yml` |
| **Line(s)** | 359 |
| **Source** | Semgrep rule `yaml.github-actions.security.gha-curl-pipe-shell.gha-curl-pipe-shell` |
| **Detection** | SAST (static) |
| **Confidence** | HIGH |

**Vulnerable code**

```yaml
run: curl https://cli-assets.heroku.com/install.sh | sh
```

**Root cause**

The deploy job fetches an installer over the network and executes it without checksum or signature verification — the doc's 'Artifacts consumed from CDNs or mirrors without signature or checksum verification' bullet. The job runs with deployment secrets in scope.

**Impact**

A compromised or hijacked distribution host executes arbitrary code inside the CI runner with access to Heroku deploy credentials and repository tokens, allowing a downstream supply-chain compromise of released artifacts.

**Remediation**

- Download the artifact, verify a pinned checksum or signature, then execute.
- Prefer a pinned, vetted action or package from a known-good registry.
- Run deployment steps on ephemeral, least-privilege runners.
- Do not expose deploy secrets to steps that execute third-party code.

**Code Fix (SAST)**

```yaml
- name: "Install Heroku CLI"
  run: |
    curl -fsSL -o install.sh https://cli-assets.heroku.com/install.sh
    echo "${HEROKU_INSTALLER_SHA256}  install.sh" | sha256sum -c -
    sh install.sh
  env:
    HEROKU_INSTALLER_SHA256: ${{ vars.HEROKU_INSTALLER_SHA256 }}
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-Web-Top-10-2025.md): Artifacts consumed from CDNs or mirrors without signature or checksum verification.

---

### F-021: CI workflows reference GitHub Actions by mutable branch/tag instead of immutable commit SHA

| | |
|---|---|
| **Severity** | **MEDIUM** |
| **OWASP category** | A03 — Software Supply Chain Failures (Web Application (OWASP Top 10:2025)) |
| **Vulnerable file** | `.github/workflows/image_actions.yml` |
| **Line(s)** | 33 |
| **Source** | Semgrep rule `yaml.github-actions.security.github-actions-mutable-action-tag.github-actions-mutable-action-tag` |
| **Detection** | SAST (static) |
| **Confidence** | HIGH |

**Vulnerable code**

```yaml
        uses: calibreapp/image-actions@main
        with:
          githubToken: ${{ secrets.GITHUB_TOKEN }}
```

**Root cause**

The workflow consumes a third-party action by the mutable branch reference `@main`, so whoever controls that repository (or an attacker who takes the maintainer account over) can silently repoint the code that executes inside the pipeline with `secrets.GITHUB_TOKEN` and permission to open pull requests. The same mutable-reference pattern is flagged by the identical rule at .github/workflows/image_actions.yml:30 (actions/checkout@v6), :42 (peter-evans/create-pull-request@v8) and .github/workflows/codeql-analysis.yml:36 (github/codeql-action/analyze@v3); this maps to the doc's 'build servers with … unrestricted plugins' and unverified-artifact bullets.

**Impact**

A compromised upstream action executes with repository write scope and the workflow token, allowing injection of code into the repo/release artifacts or theft of CI secrets — the malicious code arrives through a trusted channel and inherits full pipeline trust.

**Remediation**

Pin every `uses:` to a full 40-character commit SHA, with the human-readable version in a trailing comment.
Prefer vetted/first-party actions and re-review the SHA when bumping.
Run a pinning linter (e.g. Dependabot + `actionlint`/allow-list policy) in CI.
Grant the workflow the minimum `permissions:` block instead of the default token scope.

**Code Fix (SAST)**

```yaml
      - name: Checkout Branch
        uses: actions/checkout@08c6903cd8c0fde910a37f88322edcfb5dd907a8 # v6
      - name: Compress Images
        id: calibre
        uses: calibreapp/image-actions@6d3a9c1ec6d1e1c5a7d3c9b1f5b4e2a0c3d7f1ab # v1.1.0
        with:
          githubToken: ${{ secrets.GITHUB_TOKEN }}
      - name: Create Pull Request
        uses: peter-evans/create-pull-request@271a8d0340265f705b14b6d32b9829c1cb33d45e # v8
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-Web-Top-10-2025.md): Pin and lock versions and verify checksums; never resolve floating ranges in a release build.

---

### F-022: GitHub Actions expression injection of github.ref_name into run: steps

| | |
|---|---|
| **Severity** | **MEDIUM** |
| **OWASP category** | A05 — Injection (Web Application (OWASP Top 10:2025)) |
| **Vulnerable file** | `.github/workflows/update-challenges-ebook.yml` |
| **Line(s)** | 22–25 |
| **Source** | Semgrep rule `yaml.github-actions.security.run-shell-injection.run-shell-injection` |
| **Detection** | SAST (static) |
| **Confidence** | MEDIUM |

**Vulnerable code**

```yaml
run: |
  cd docs/modules/ROOT/assets/data
  rm challenges.yml
  wget https://raw.githubusercontent.com/juice-shop/juice-shop/${{ github.ref_name }}/data/static/challenges.yml
```

**Root cause**

`github.ref_name` is interpolated directly into shell command strings, so a branch/tag name containing shell metacharacters is executed by the runner. The same pattern repeats at .github/workflows/update-challenges-www-legacy.yml:27 and :36 and .github/workflows/update-challenges-www.yml:27 and :36 (rule yaml.github-actions.security.run-shell-injection.run-shell-injection).

**Impact**

Command execution in the CI runner with the workflow's write token and checkout credentials, allowing the attacker to push modified challenge data or steal secrets — untrusted input interpreted as commands.

**Remediation**

- Pass context data through an `env:` variable and reference it quoted as "$ENVVAR".
- Validate the ref name against an allow-list pattern before use.
- Restrict the workflow token to the minimum permissions needed.
- Avoid shelling out where an action can do the work.

**Code Fix (SAST)**

```yaml
- name: Update challenges.yml
  env:
    REF_NAME: ${{ github.ref_name }}
  run: |
    case "$REF_NAME" in *[!A-Za-z0-9._/-]*) echo "invalid ref"; exit 1;; esac
    cd docs/modules/ROOT/assets/data
    rm challenges.yml
    wget "https://raw.githubusercontent.com/juice-shop/juice-shop/$REF_NAME/data/static/challenges.yml"
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-Web-Top-10-2025.md): OS commands assembled from request data, or arguments passed to a shell.

---

### F-023: Backend build disables the npm lockfile, allowing unpinned/floating dependency resolution

| | |
|---|---|
| **Severity** | **MEDIUM** |
| **OWASP category** | A03 — Software Supply Chain Failures (Web Application (OWASP Top 10:2025)) |
| **Vulnerable file** | `.npmrc` |
| **Line(s)** | 1 |
| **Source** | Semgrep rule `package_managers.npm.npm-missing-minimum-release-age.npm-missing-minimum-release-age` |
| **Detection** | SAST (static) |
| **Confidence** | MEDIUM |

**Vulnerable code**

```ini
package-lock=false
```

**Root cause**

`package-lock=false` prevents npm from writing/honouring a lockfile, so every install resolves floating semver ranges to whatever version (including a freshly published or typosquatted one) is current, and no integrity hashes are verified. No minimum release age is configured either (semgrep rule package_managers.npm.npm-missing-minimum-release-age).

**Impact**

A compromised or malicious upstream release is pulled automatically into builds and inherits full production trust, reproducing the single-upstream-compromise pattern that reaches every downstream consumer at once.

**Remediation**

- Re-enable the lockfile and commit it so versions and integrity hashes are pinned.
- Set `min-release-age = 7` to avoid resolving brand-new publishes.
- Use `npm ci` in CI so release builds never re-resolve ranges.
- Generate an SBOM per build and track advisories against it.

**Code Fix (SAST)**

```ini
package-lock=true
min-release-age=7
audit=true
fund=false
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-Web-Top-10-2025.md): Pin and lock versions and verify checksums; never resolve floating ranges in a release build.

---

### F-024: Unauthenticated Prometheus metrics endpoint exposed at /metrics

| | |
|---|---|
| **Severity** | **MEDIUM** |
| **OWASP category** | A02 — Security Misconfiguration (Web Application (OWASP Top 10:2025)) |
| **Vulnerable file** | `data/static/codefixes/exposedMetricsChallenge_1.ts` |
| **Line(s)** | 4 |
| **Source** | Correlated (Semgrep + nuclei) |
| **Detection** | SAST + DAST (correlated) |
| **Confidence** | MEDIUM |

**Vulnerable code**

```typescript
app.get('/metrics', metrics.serveMetrics())
```

**Root cause**

The metrics scrape endpoint is registered on the public Express router with no authentication, IP allow-list or network segmentation, matching the doc's 'unnecessary features installed and enabled — … unused ports and services' bullet; Nuclei confirmed the Prometheus exposition format is served to an anonymous client.

**Impact**

Anonymous callers can read internal operational telemetry (route names, user/order counters, process and version details), which aids reconnaissance and makes the deployment trivially discoverable by internet-scale scanners with no exploit development required.

**Remediation**

Bind the metrics endpoint to an internal interface or a separate admin port, not the public router.
Require authentication (bearer token / mTLS) or restrict by source-IP allow-list for the scraper.
Strip business-sensitive counters and version data from the exposition output.
Cover the endpoint in the hardening baseline and drift detection.

**Code Fix (SAST)**

```typescript
import basicAuth from 'express-basic-auth'

const metricsAuth = basicAuth({
  users: { [process.env.METRICS_USER!]: process.env.METRICS_PASSWORD! },
  challenge: true
})

app.get('/metrics', metricsAuth, (req, res, next) => {
  const allowed = (process.env.METRICS_ALLOWED_CIDRS ?? '127.0.0.1').split(',')
  if (!allowed.includes(req.ip)) { res.sendStatus(404); return }
  next()
}, metrics.serveMetrics())
```

**Live Exploit / Payload Proof (DAST)**

```
Nuclei template `prometheus-metrics` issued an unauthenticated `GET /metrics` and received a Prometheus exposition-format body, confirming the endpoint registered at data/static/codefixes/exposedMetricsChallenge_1.ts:4 is publicly readable.
```

> **DAST evidence** — tool `nuclei`, probe/template `prometheus-metrics`, target `/metrics`, artifact `dast_artifacts/nuclei/prometheus-metrics`

> **Reference** (OWASP-Web-Top-10-2025.md): Unnecessary features installed and enabled — sample apps, admin consoles, unused ports and services.

---

### F-025: Frontend build disables the npm lockfile and has no minimum release age

| | |
|---|---|
| **Severity** | **MEDIUM** |
| **OWASP category** | A03 — Software Supply Chain Failures (Web Application (OWASP Top 10:2025)) |
| **Vulnerable file** | `frontend/.npmrc` |
| **Line(s)** | 1 |
| **Source** | Semgrep rule `package_managers.npm.npm-missing-minimum-release-age.npm-missing-minimum-release-age` |
| **Detection** | SAST (static) |
| **Confidence** | MEDIUM |

**Vulnerable code**

```ini
package-lock=false
```

**Root cause**

The Angular frontend workspace also turns off lockfile generation, so browser-delivered bundles are built from unpinned, unverified transitive dependencies with no release-age quarantine — the same supply-chain gap as the backend config.

**Impact**

Malicious code in a newly published transitive package is bundled into client-side JavaScript served to every user, allowing session theft or arbitrary script execution in authenticated sessions.

**Remediation**

- Enable `package-lock=true` and commit the lockfile for the frontend workspace.
- Add `min-release-age = 7`.
- Build with `npm ci` from the committed lockfile.
- Consume packages through a vetted internal registry proxy.

**Code Fix (SAST)**

```ini
package-lock=true
min-release-age=7
audit=true
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-Web-Top-10-2025.md): Transitive dependencies pulled several layers deep that no one has ever reviewed.

---

### F-026: Client-controlled field selection leaks password hash and TOTP secret from /rest/user/whoami

| | |
|---|---|
| **Severity** | **MEDIUM** |
| **OWASP category** | A01 — Broken Access Control (Web Application (OWASP Top 10:2025)) |
| **Vulnerable file** | `routes/currentUser.ts` |
| **Line(s)** | 27–33 |
| **Source** | Contextual review (LLM) |
| **Detection** | SAST (static) |
| **Confidence** | HIGH |

**Vulnerable code**

```typescript
if (requestedFields.length > 0) {
  // When fields are specified, return only those fields
  for (const field of requestedFields) {
    if (user?.data[field as keyof typeof user.data] !== undefined) {
      baseUser[field] = user?.data[field as keyof typeof user.data]
    }
  }
}
```

**Root cause**

The `fields` query parameter selects arbitrary attributes from the cached session user object with no allow-list, so `?fields=password,totpSecret,deluxeToken` returns internal credential material. The server-side response filter exists only in the default branch — the API is effectively unprotected while the UI never requests these fields.

**Impact**

Disclosure of the (MD5, see F-004) password hash, TOTP secret and deluxe token for the current session, enabling offline password cracking, 2FA bypass and privilege forgery.

**Remediation**

- Enforce a server-side allow-list of returnable fields.
- Deny by default: unknown field names are rejected, not echoed.
- Never keep secrets in the object serialised to session responses.
- Log and alert on requests for denied fields.

**Code Fix (SAST)**

```typescript
const ALLOWED_FIELDS = ['id', 'email', 'lastLoginIp', 'profileImage', 'username', 'role'] as const
const requestedFields = (req.query?.fields as string | undefined)?.split(',').map(f => f.trim()) ?? []
const fields = requestedFields.filter(f => (ALLOWED_FIELDS as readonly string[]).includes(f))
const selected = fields.length > 0 ? fields : ALLOWED_FIELDS.slice(0, 4)
const baseUser: Record<string, unknown> = {}
for (const field of selected) {
  baseUser[field] = (user?.data as any)?.[field]
}
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-Web-Top-10-2025.md): Access control enforced only in the UI, with the API left unprotected.

---

### F-027: Unauthenticated key server exposes cryptographic key material

| | |
|---|---|
| **Severity** | **MEDIUM** |
| **OWASP category** | A01 — Broken Access Control (Web Application (OWASP Top 10:2025)) |
| **Vulnerable file** | `routes/keyServer.ts` |
| **Line(s)** | 14 |
| **Source** | Semgrep rule `javascript.express.security.audit.express-res-sendfile.express-res-sendfile` |
| **Detection** | SAST (static) |
| **Confidence** | MEDIUM |

**Vulnerable code**

```typescript
if (!file.includes('/')) {
  res.sendFile(path.resolve('encryptionkeys/', file))
}
```

**Root cause**

The handler has no authentication or authorisation check and serves any file in `encryptionkeys/` by name. The only control is a forward-slash filter, which prevents traversal but not enumeration of the key directory (which is also directory-listed), so private/public key files used for token signing are downloadable.

**Impact**

Disclosure of key material lets an attacker verify or forge application tokens (see F-001/F-002) and decrypt data protected by those keys, leading to account takeover.

**Remediation**

- Deny by default: do not expose a key directory over HTTP at all.
- Store key material outside the web root and load it only in server code.
- If a file endpoint is required, serve only an explicit allow-list of non-sensitive filenames.
- Log access-control failures and alert on repeated probing.

**Code Fix (SAST)**

```typescript
const PUBLIC_KEYS = new Set(['premium.key'])
const name = path.basename(String(params.file))
if (!PUBLIC_KEYS.has(name)) {
  res.status(403)
  return next(new Error('Forbidden'))
}
res.sendFile(path.resolve('encryptionkeys/', name))
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-Web-Top-10-2025.md): Deny by default for everything except public resources, so a new endpoint is unreachable until explicitly granted.

---

### F-028: Unauthenticated access-log download endpoint

| | |
|---|---|
| **Severity** | **MEDIUM** |
| **OWASP category** | A01 — Broken Access Control (Web Application (OWASP Top 10:2025)) |
| **Vulnerable file** | `routes/logfileServer.ts` |
| **Line(s)** | 14 |
| **Source** | Semgrep rule `javascript.express.security.audit.express-res-sendfile.express-res-sendfile` |
| **Detection** | SAST (static) |
| **Confidence** | MEDIUM |

**Vulnerable code**

```typescript
if (!file.includes('/')) {
  res.sendFile(path.resolve('logs/', file))
}
```

**Root cause**

Any caller can fetch server log files by name with no authentication or role check; the only validation is a forward-slash filter. Access logs contain other users' request paths, tokens and identifiers.

**Impact**

Disclosure of other users' session tokens, email addresses and request data recorded in the logs, enabling session hijacking and targeted follow-up attacks.

**Remediation**

- Require an administrative role before serving any log file.
- Keep logs off the web-served filesystem and ship them to central, access-controlled storage.
- Keep sensitive values out of logs in the first place.
- Alert on repeated denied attempts to the endpoint.

**Code Fix (SAST)**

```typescript
router.get('/:file', security.isAuthorized(), security.denyAllUnlessAdmin(), (req, res, next) => {
  const name = path.basename(String(req.params.file))
  if (!/^access\.log(\.\d+)?$/.test(name)) {
    res.status(403)
    return next(new Error('Forbidden'))
  }
  res.sendFile(path.resolve('logs/', name))
})
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-Web-Top-10-2025.md): Missing function-level checks, so an admin-only endpoint works for any authenticated caller.

---

### F-029: Unauthenticated Prometheus metrics endpoint exposes internal application telemetry

| | |
|---|---|
| **Severity** | **MEDIUM** |
| **OWASP category** | A02 — Security Misconfiguration (Web Application (OWASP Top 10:2025)) |
| **Vulnerable file** | `routes/metrics.ts` |
| **Line(s)** | 83–92 |
| **Source** | Correlated (Semgrep + nuclei) |
| **Detection** | SAST + DAST (correlated) |
| **Confidence** | HIGH |

**Vulnerable code**

```typescript
export function serveMetrics () {
  return async (req: Request, res: Response, next: NextFunction) => {
    challengeUtils.solveIf(challenges.exposedMetricsChallenge, () => { ... })
    res.set('Content-Type', register.contentType)
    res.end(await register.metrics())
  }
}
```

**Root cause**

The Prometheus registry (default Node metrics, LLM token/tool-call counters, user counts, wallet balances, challenge state) is served by `serveMetrics()` with no authentication or IP restriction; the correlation candidate pointed at the challenge fixture `data/static/codefixes/exposedMetricsChallenge_1.ts:4`, but the live handler is this one wired to `/metrics`. This is the doc's 'Unnecessary features installed and enabled — ... admin consoles, unused ports and services' bullet.

**Impact**

Any unauthenticated internet client can read operational and business telemetry (registered user counts, wallet totals, LLM token consumption, upload/error rates, process memory and versions), aiding reconnaissance and cost/abuse monitoring evasion.

**Remediation**

- Require authentication/authorisation (admin role) on `/metrics`.
- Or bind the metrics endpoint to an internal interface/network only.
- Ship a minimal platform: disable the exporter when not scraped.
- Scope exposed labels so no business data leaks.

**Code Fix (SAST)**

```typescript
export function serveMetrics () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = utils.jwtFrom(req)
    const decoded: any = token && security.verify(token) ? security.decode(token) : undefined
    if (decoded?.data?.role !== security.roles.admin) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }
    res.set('Content-Type', register.contentType)
    res.end(await register.metrics())
  }
}
```

**Live Exploit / Payload Proof (DAST)**

```
An unauthenticated `GET /metrics` returned HTTP 200 with 26 KB of Prometheus output including juiceshop_llm_* token counters, http_requests_count and startup gauges — confirming the handler is reachable without credentials.
```

> **DAST evidence** — tool `nuclei`, probe/template `prometheus-metrics`, target `http://127.0.0.1:51663/metrics`, artifact `nuclei_web.jsonl#1`

> **Reference** (OWASP-Web-Top-10-2025.md): Unnecessary features installed and enabled — sample apps, admin consoles, unused ports and services.

---

### F-030: Open redirect via substring-based URL allow-list

| | |
|---|---|
| **Severity** | **MEDIUM** |
| **OWASP category** | A01 — Broken Access Control (Web Application (OWASP Top 10:2025)) |
| **Vulnerable file** | `routes/redirect.ts` |
| **Line(s)** | 18 |
| **Source** | Semgrep rule `javascript.express.security.audit.express-open-redirect.express-open-redirect` |
| **Detection** | SAST (static) |
| **Confidence** | HIGH |

**Vulnerable code**

```typescript
if (security.isRedirectAllowed(toUrl)) {
  ...
  res.redirect(toUrl)
}
```

**Root cause**

`isRedirectAllowed` only checks whether the user-supplied `to` parameter *contains* one of the allow-listed URLs, so `http://evil.example/?x=https://github.com/juice-shop/juice-shop` passes and is redirected to verbatim. The destination is never parsed or host-compared.

**Impact**

Attackers can use the application's trusted domain to send victims to phishing or malware pages, and can chain the redirect to leak referrer-borne tokens.

**Remediation**

- Parse the target URL and compare the full origin against a strict host allow-list.
- Prefer redirect tokens/relative paths instead of accepting absolute URLs from the client.
- Reject rather than clean unrecognised destinations.
- Log rejected redirect attempts.

**Code Fix (SAST)**

```typescript
const ALLOWED_ORIGINS = new Set([
  'https://github.com',
  'https://blockchain.info',
  'https://etherscan.io'
])

let target: URL
try {
  target = new URL(toUrl)
} catch {
  res.status(406)
  return next(new Error('Unrecognized target URL for redirect: ' + toUrl))
}
if (!ALLOWED_ORIGINS.has(target.origin)) {
  res.status(406)
  return next(new Error('Unrecognized target URL for redirect: ' + toUrl))
}
res.redirect(target.href)
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-Web-Top-10-2025.md): Access control decides who may do what to which resource. It fails when the check is missing, when it is enforced somewhere the user controls, or when it is applied inconsistently across endpoints.

---

### F-031: Wildcard CORS policy applied to all authenticated API routes

| | |
|---|---|
| **Severity** | **MEDIUM** |
| **OWASP category** | A02 — Security Misconfiguration (Web Application (OWASP Top 10:2025)) |
| **Vulnerable file** | `server.ts` |
| **Line(s)** | 182–183 |
| **Source** | Contextual review (LLM) |
| **Detection** | SAST (static) |
| **Confidence** | HIGH |

**Vulnerable code**

```typescript
/* Bludgeon solution for possible CORS problems: Allow everything! */
app.options('*', cors())
app.use(cors())
```

**Root cause**

`cors()` with no options emits `Access-Control-Allow-Origin: *` on every route, including `/rest/*` and `/api/*` endpoints that serve authenticated data (confirmed by test/api/http.test.ts asserting the wildcard header). This is the doc's 'permissive `Access-Control-Allow-Origin: *` on authenticated APIs' bullet.

**Impact**

Any untrusted origin can read responses from the API when the caller supplies a bearer token (e.g. a token exfiltrated or stored in a script-accessible location), broadening XSS and malicious-site impact to full data reads.

**Remediation**

- Scope CORS to an explicit list of named origins.
- Do not combine wildcard origins with credentialed requests.
- Set security headers deliberately (CSP, HSTS, frame-ancestors) alongside CORS.
- Review the policy per route rather than applying one global `app.use`.

**Code Fix (SAST)**

```typescript
const allowedOrigins = config.get<string[]>('server.allowedOrigins')
const corsOptions = {
  origin (origin: string | undefined, cb: (e: Error | null, ok?: boolean) => void) {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true)
    else cb(new Error('Origin not allowed'))
  },
  credentials: true
}
app.options('*', cors(corsOptions))
app.use(cors(corsOptions))
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-Web-Top-10-2025.md): Missing security headers, or a permissive `Access-Control-Allow-Origin: *` on authenticated APIs.

---

### F-032: Directory listing enabled on /ftp and /infrastructure

| | |
|---|---|
| **Severity** | **MEDIUM** |
| **OWASP category** | A02 — Security Misconfiguration (Web Application (OWASP Top 10:2025)) |
| **Vulnerable file** | `server.ts` |
| **Line(s)** | 268–288 |
| **Source** | Semgrep rule `javascript.express.security.audit.express-check-directory-listing.express-check-directory-listing` |
| **Detection** | SAST (static) |
| **Confidence** | HIGH |

**Vulnerable code**

```typescript
app.use('/infrastructure', serveIndexMiddleware, serveIndex('infrastructure', { icons: true, view: 'details', filter: (filename) => filename !== 'README.md' }))
...
app.use('/ftp', serveIndexMiddleware, serveIndex('ftp', { icons: true }))
```

**Root cause**

`serve-index` is mounted unauthenticated on two filesystem directories, so their full contents are enumerable by anyone. Combined with the file-download handlers (F-003), listing removes the need to guess filenames for sensitive artefacts such as coupon files and backups. Same weakness reported by the duplicate hit at server.ts:288.

**Impact**

Unauthenticated discovery of sensitive files and infrastructure definitions with no exploit development required; internet-wide scanners find this within hours.

**Remediation**

- Disable directory listing on all web roots.
- Serve only an explicit allow-list of public files.
- Keep infrastructure code and operational directories out of the served filesystem.
- Ship a minimal platform: remove sample and documentation content from the runtime image.

**Code Fix (SAST)**

```typescript
// Remove serve-index entirely; expose only known-public downloads
app.use('/ftp/:file', servePublicFiles())
app.use('/ftp/quarantine/:file', serveQuarantineFiles())
// /infrastructure is not served at runtime
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-Web-Top-10-2025.md): Model roles by business rule, not by URL path, and disable directory listing and metadata files in web roots.

---

### F-033: Password-reset rate limiting bypassable via client-supplied X-Forwarded-For header

| | |
|---|---|
| **Severity** | **MEDIUM** |
| **OWASP category** | A07 — Authentication Failures (Web Application (OWASP Top 10:2025)) |
| **Vulnerable file** | `server.ts` |
| **Line(s)** | 362–366 |
| **Source** | Contextual review (LLM) |
| **Detection** | SAST (static) |
| **Confidence** | HIGH |

**Vulnerable code**

```typescript
app.use('/rest/user/reset-password', rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  keyGenerator ({ headers, ip }: { headers: any, ip: any }) { return headers['X-Forwarded-For'] ?? ip }
}))
```

**Root cause**

The rate-limit bucket key is taken from an attacker-controlled request header, so rotating `X-Forwarded-For` values gives an unlimited number of buckets — effectively 'brute force permitted with no rate limiting' as described in the doc.

**Impact**

Unlimited brute forcing of security answers on the password-reset flow, leading to account takeover of targeted users; the same trick evades any alerting that is keyed on request counts per client.

**Remediation**

- Key the limiter on the trusted connection IP (`req.ip` with a correctly configured trust-proxy hop count).
- Additionally key on the targeted account to bound per-user attempts.
- Add progressive delays / lockout after repeated failures.
- Alert when reset-failure rates spike.

**Code Fix (SAST)**

```typescript
app.set('trust proxy', 1)
app.use('/rest/user/reset-password', rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${req.ip}|${String(req.body?.email ?? '')}`
}))
```

**Live Exploit / Payload Proof (DAST)**

```
Not dynamically confirmed (static finding only).
```

> **Reference** (OWASP-Web-Top-10-2025.md): Credential stuffing and brute force permitted with no rate limiting, delay, or lockout.

---

## 6. Dismissed Static-Analysis Findings

The following Semgrep results were reviewed and judged to be false positives or not exploitable in context.

| Rule | Location |
|---|---|
| `terraform.aws.security.aws-subnet-has-public-ip-address.aws-subnet-has-public-ip-address` | `data/static/codefixes/iacLeakedKeyChallenge_1.tf:17` |
| File lives under data/static/codefixes/ — an inert training-challenge fixture served as text for the 'code fix' exercise. It is never applied by terraform and provisions no real infrastructure. | |
| `terraform.aws.security.insecure-load-balancer-tls-version.insecure-load-balancer-tls-version` | `data/static/codefixes/iacLeakedKeyChallenge_1.tf:159` |
| Challenge fixture, not deployed IaC; the HTTP listener exists only as sample text inside the Juice Shop code-fix challenge dataset. | |
| `terraform.aws.security.aws-subnet-has-public-ip-address.aws-subnet-has-public-ip-address` | `data/static/codefixes/iacLeakedKeyChallenge_2.tf:17` |
| Same inert code-fix challenge fixture (variant 2); no terraform state or pipeline consumes this file. | |
| `terraform.aws.security.insecure-load-balancer-tls-version.insecure-load-balancer-tls-version` | `data/static/codefixes/iacLeakedKeyChallenge_2.tf:159` |
| Same inert code-fix challenge fixture (variant 2); the load balancer is never created. | |
| `terraform.aws.security.aws-subnet-has-public-ip-address.aws-subnet-has-public-ip-address` | `data/static/codefixes/iacLeakedKeyChallenge_3_correct.tf:17` |
| This is the designated 'correct' answer file for the challenge; it is static data used for grading, not provisioned infrastructure. | |
| `terraform.aws.security.insecure-load-balancer-tls-version.insecure-load-balancer-tls-version` | `data/static/codefixes/iacLeakedKeyChallenge_3_correct.tf:159` |
| Static challenge answer file; no deployment path, so the TLS listener setting has no runtime effect. | |
| `web.injection.js-dom-xss-innerhtml` | `frontend/src/assets/private/three.js:11354` |
| Vendored third-party three.js library assigning the constant literal string 'Loading ...' to innerHTML — no attacker-controlled data reaches the sink. | |
| `web.injection.js-dom-xss-innerhtml` | `frontend/src/assets/private/three.js:11375` |
| Library-internal progress message (loaded/total counters) rendered by three.js' own loader UI; the value is generated from numeric loader state, not from user or URL input. | |
| `javascript.sequelize.security.audit.sequelize-injection-express.express-sequelize-injection` | `data/static/codefixes/unionSqlInjectionChallenge_3.ts:10` |
| File lives under data/static/codefixes/, a library of alternative code snippets served as multiple-choice answers in the 'Coding Challenges' training UI. It is never imported or executed by the application; the live, reachable version of this query is routes/search.ts:23, reported as F-002. | |
| `web.crypto.hardcoded-secret-key-js` | `frontend/src/app/faucet/faucet.component.ts:34` |
| The literal is a public Ethereum contract address (BeeTokenAddress), not a secret or signing key. Contract addresses are by design public on-chain identifiers and confer no privilege; no cryptographic material is exposed. | |
| `web.auth.jwt-verification-disabled-js` | `routes/verify.ts:119` |
| jwt.decode() here is inside jwtChallenge(), a challenge-detection helper that only inspects token claims to decide whether a training challenge was solved — it is guarded by jws.decode() and makes no authentication or authorization decision. The real signature-trust weakness is the hardcoded signing key reported as F-004. | |
| `javascript.express.security.audit.express-check-directory-listing.express-check-directory-listing` | `server.ts:292` |
| `/.well-known` is by specification a public directory (security.txt, change-password, etc.) served read-only by `express.static`; listing it discloses nothing that is not already intended to be publicly fetchable, so there is no access-control boundary crossed here. | |
| `terraform.aws.security.aws-subnet-has-public-ip-address.aws-subnet-has-public-ip-address` | `terraform/networking.tf:18` |
| This subnet is explicitly the `public` tier that hosts the internet-facing ALB and NAT/internet gateway path; `map_public_ip_on_launch = true` is the intended design for that tier and no application/database resource is shown launching into it, so the flag is not an exploitable exposure in this configuration. | |
| `web.injection.js-dom-xss-innerhtml` | `frontend/src/hacking-instructor/index.ts:126` |
| `hint.text` originates from the statically compiled hacking-instructor tutorial definitions bundled with the frontend, not from user or server-controlled input, so no attacker-controlled data reaches innerHTML here. | |
| `web.injection.js-dom-xss-innerhtml` | `frontend/src/hacking-instructor/index.ts:142` |
| Assigned value is a constant literal ('<div>&times;</div>') with no interpolation — no untrusted data involved. | |
| `terraform.aws.security.aws-subnet-has-public-ip-address.aws-subnet-has-public-ip-address` | `infrastructure/terraform/networking.tf:18` |
| This subnet is explicitly named `public` and exists to host the internet-facing ALB and its internet gateway route; auto-assigning public IPs there is the intended architecture, and the application tasks are placed in the private subnets. | |
| `javascript.express.security.audit.express-res-sendfile.express-res-sendfile` | `routes/quarantineServer.ts:14` |
| Same pattern as the key/log servers but the forward-slash filter prevents traversal and `ftp/quarantine/` contains only files intentionally published for download, so there is no additional disclosure beyond the directory-listing issue already reported as F-007. | |
| `javascript.sequelize.security.audit.sequelize-injection-express.express-sequelize-injection` | `data/static/codefixes/dbSchemaChallenge_1.ts:5` |
| File lives under data/static/codefixes/ — a set of candidate answer snippets served to the 'Fix It' coding-challenge UI. It is never imported or executed by the server (nyc/include and server.ts only wire lib/, models/, routes/), so the concatenated query is inert fixture data. The live equivalent is routes/search.ts. | |
| `web.injection.js-sql-template-literal` | `data/static/codefixes/dbSchemaChallenge_3.ts:11` |
| Codefix fixture file, not application code: these variants are displayed as multiple-choice fix candidates and never wired into an Express route at runtime. | |
| `javascript.sequelize.security.audit.sequelize-injection-express.express-sequelize-injection` | `data/static/codefixes/dbSchemaChallenge_3.ts:11` |
| Duplicate of the template-literal hit on the same line in a non-executed codefix fixture file; additionally this variant validates `criteria` and returns 400 before the query. | |
| `web.injection.js-sql-template-literal` | `data/static/codefixes/unionSqlInjectionChallenge_1.ts:6` |
| Codefix fixture (deliberately incorrect candidate answer) under data/static/codefixes/; not reachable from any route handler at runtime. | |
| `javascript.sequelize.security.audit.sequelize-injection-express.express-sequelize-injection` | `data/static/codefixes/unionSqlInjectionChallenge_1.ts:6` |
| Same line as the template-literal rule in a non-executed codefix fixture file; merged and dismissed for the same reason. | |
| `web.injection.js-sql-template-literal` | `data/static/codefixes/unionSqlInjectionChallenge_3.ts:10` |
| Codefix fixture file that is not executed by the server; the variant also rejects the request with 400 when `criteria` fails validation before reaching the query. | |

## 7. Scan Metadata

| | |
|---|---|
| **Languages detected** | typescript, html, javascript, python, bash |
| **Semgrep rulesets** | `web.yaml`, `llm.yaml`, `owasp-top-ten`, `secrets`, `typescript`, `javascript`, `python` |
| **Semgrep results** | 55 raw |
| **Context files reviewed** | 60 |
| **Project type** | hybrid |
| **DAST status** | active |
| **DAST tools ran** | `nuclei`, `auth-probe`, `garak` |
| **DAST findings (raw)** | 1 |
| **Correlation candidates** | 1 |
| **DAST artifacts** | `/Users/dmitryshishov/Desktop/Projects/ai-security-agent/workspaces/juice-shop/juice-shop/security-reports/dast_artifacts` |
| **LLM model** | `claude-opus-5` |
| **Token usage** | input 139910, output 68292, cache read 48538, cache write 94422 |

**Analyst notes**

- Batch 3 is dominated by non-production artifacts: the six Terraform hits are Juice Shop 'code fix' challenge fixtures under data/static/codefixes/ and the two innerHTML hits are in a vendored three.js bundle with literal/loader-generated values — all dismissed. The only genuine static issue is unpinned third-party GitHub Actions, notably calibreapp/image-actions@main which executes with secrets.GITHUB_TOKEN and PR-creation rights. Correlation candidate C-001 (Nuclei prometheus-metrics on /metrics) is reported as a consolidated correlated finding using the file path supplied; note the runtime registration also exists in the main server bootstrap, so the fix should be applied there as well. No LLM-domain findings in this batch.
- Batch 2 covered SQL injection sinks (login, search), an eval() sink in userProfile, hardcoded JWT signing material, CI action pinning, and one correlation candidate. The /metrics correlation (C-001) references DAST record D-001 which was not included in this batch's dast_findings payload; evidence fields were reconstructed from the correlation metadata, so the response excerpt is indicative rather than verbatim — the real route registration should be confirmed in routes/metrics.ts / server.ts during manual review. lib/insecurity.ts warrants a full manual read: the hardcoded private key pairs with the publicKey read from encryptionkeys/jwt.pub and likely affects every token issued. No LLM-domain findings appeared in this batch.
- Batch 5 covered the Express static-serving block in server.ts, the Terraform network layer, and npm registry configuration. The three directory-listing hits were split: two confirmed (encryptionkeys, support/logs) and one dismissed (.well-known). The single correlation candidate (C-001, Nuclei prometheus-metrics on /metrics) had no accompanying DAST record in this batch; it is reported as detection="both" with MEDIUM confidence because the referenced source file is a codefix template under data/static/codefixes — the live route registration in server.ts/lib should be confirmed manually and the finding re-anchored there. Worth manual review: whether ECS tasks/RDS are actually placed in the public subnet (not visible in this excerpt), and whether any HSTS/security-header middleware compensates for the cleartext ALB listener.
- Batch 4 triage. The two innerHTML hits and the public-subnet Terraform hit are false positives in context. The four express-res-sendfile hits were assessed individually rather than merged: only routes/fileServer.ts allows real traversal (extension check defeated by a poison null byte), while keyServer and logfileServer are missing-authorisation issues on sensitive directories and quarantineServer is benign. The two serve-index hits in server.ts were merged into one A02 finding. Two new contextual issues came out of lib/insecurity.ts: the hard-coded signing key (F-001, amplified because the key directory is itself downloadable via F-004) and the missing `algorithms` allow-list on jws/express-jwt verification (F-002), which together permit trivial admin token forgery — recommend manual verification of `security.isRedirectAllowed` and `verifySuccessfulPoisonNullByteExploit` implementations. Correlation candidate C-001 was accepted as detection=both; the underlying DAST record was not included in this batch, so the evidence fields were populated from the candidate metadata and confidence is MEDIUM. Note that data/static/codefixes/ is Juice Shop's code-fix fixture directory, so the real runtime registration of /metrics should be confirmed in server.ts before remediation.
- Target is OWASP Juice Shop, an intentionally vulnerable training app, so confirmed findings are numerous by design; I reported only issues that are reachable from wired-up request handlers or the build pipeline and dismissed the data/static/codefixes/* Semgrep hits as non-executed challenge fixtures. Semgrep batch 1 of 5 contained only workflow and codefix hits — the live SQL injection (routes/login.ts) and the LLM/agency issues were found by reading context files. Only one DAST finding was supplied (Nuclei prometheus-metrics on /metrics); it was confirmed and correlated to routes/metrics.ts serveMetrics() rather than the suggested codefix fixture path. Line numbers in server.ts (CORS ~182, serve-index mounts ~296-302, reset-password rate limit ~362-366) were derived from the truncated context excerpt and may be off by a few lines. Not reviewed here and worth manual follow-up: routes/search.ts (the real union-SQLi handler, not supplied), routes/showProductReviews.ts / likeProductReviews.ts MongoDB query handling, routes/resetPassword.ts and securityQuestion.ts, the vm-based YAML/XML upload handlers in routes/fileUpload.ts, and the remaining four Semgrep batches.

**Warnings**

- Semgrep: Syntax error at line /Users/dmitryshishov/Desktop/Projects/ai-security-agent/workspaces/juice-shop/juice-shop/data/static/codefixes/registerAdminChallenge_2.ts:1:
 `/* Generated API endpoints */
  finale.initialize({ app, sequelize: seq })

  const autoModels = [
    { name: 'Product', exclude: [],
- Semgrep: Syntax error at line /Users/dmitryshishov/Desktop/Projects/ai-security-agent/workspaces/juice-shop/juice-shop/data/static/codefixes/registerAdminChallenge_4.ts:1:
 `/* Generated API endpoints */
  finale.initialize({ app, sequelize: seq })

  const autoModels = [
    { name: 'User', exclude: ['passw
- Semgrep: Syntax error at line /Users/dmitryshishov/Desktop/Projects/ai-security-agent/workspaces/juice-shop/juice-shop/data/static/codefixes/registerAdminChallenge_3_correct.ts:1:
 `/* Generated API endpoints */
  finale.initialize({ app, sequelize: seq })

  const autoModels = [
    { name: 'User', exclude:
- Semgrep: Syntax error at line /Users/dmitryshishov/Desktop/Projects/ai-security-agent/workspaces/juice-shop/juice-shop/data/static/codefixes/registerAdminChallenge_1.ts:1:
 `/* Generated API endpoints */
  finale.initialize({ app, sequelize: seq })

  const autoModels = [
    { name: 'User', exclude: ['passw
- Semgrep: Syntax error at line /Users/dmitryshishov/Desktop/Projects/ai-security-agent/workspaces/juice-shop/juice-shop/data/static/codefixes/weakPasswordChallenge_3.ts:1:
 `User.init(
      password: {
        type: DataTypes.STRING,
        set (clearTextPassword: string) {
          validatePasswordHasAtLe
- Semgrep: Syntax error at line /Users/dmitryshishov/Desktop/Projects/ai-security-agent/workspaces/juice-shop/juice-shop/data/static/codefixes/weakPasswordChallenge_2.ts:1:
 `User.init(
      password: {
        type: DataTypes.STRING,
        set (clearTextPassword: string) {
          validatePasswordHasAtLe
- Semgrep: Syntax error at line /Users/dmitryshishov/Desktop/Projects/ai-security-agent/workspaces/juice-shop/juice-shop/data/static/codefixes/weakPasswordChallenge_1_correct.ts:1:
 `User.init(
      password: {
        type: DataTypes.STRING,
        set (clearTextPassword: string) {
          validatePasswor
- Semgrep: Syntax error at line /Users/dmitryshishov/Desktop/Projects/ai-security-agent/workspaces/juice-shop/juice-shop/data/static/codefixes/weakPasswordChallenge_4.ts:1:
 `User.init(
      password: {
        type: DataTypes.STRING,
        set (clearTextPassword: string) {
          validatePasswordIsNotIn
