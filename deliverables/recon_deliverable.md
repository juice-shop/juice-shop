# Reconnaissance Deliverable: OWASP Juice Shop

## 0) HOW TO READ THIS

This document provides a comprehensive attack surface analysis of the OWASP Juice Shop application running at `http://localhost:3001`. It synthesizes initial scanning results, live application exploration, and source code correlation to map all potential attack vectors.

**Key Sections for Next Agents:**
- Section 4 provides a complete API endpoint inventory with vulnerability indicators
- Section 5 catalogs all user input vectors that require testing 
- Section 6 contains the network/interaction map - use this to understand system boundaries and data flows
- All code references include file paths and line numbers for precise targeting

Start with Section 6.3 (Flows) to understand how entities communicate, then reference Section 4 for specific endpoint details.

## 1. Executive Summary

OWASP Juice Shop is a deliberately vulnerable Node.js web application designed for security training. The application runs on Express.js with an Angular frontend and SQLite database, intentionally implementing numerous security vulnerabilities across all layers. The primary attack surface includes web APIs (`/api/*`, `/rest/*`), file upload endpoints, FTP directory browsing, authentication mechanisms, and administrative interfaces.

The application exposes over 40 distinct API endpoints with various authentication requirements, implements weak security controls by design, and includes hardcoded secrets throughout the codebase. Critical vulnerabilities are present in authentication (SQL injection, weak hashing), file handling (path traversal, XXE), input validation (XSS, injection), and information disclosure (metrics, directory listings).

## 2. Technology & Service Map

- **Frontend:** Angular SPA with TypeScript, Material Design components, Socket.io for real-time features
- **Backend:** Node.js with Express.js framework, TypeScript, deprecated JWT libraries (express-jwt 0.1.3, jsonwebtoken 0.4.0)
- **Database:** SQLite with Sequelize ORM and raw SQL queries, file-based storage at `data/juiceshop.sqlite`
- **Infrastructure:** Local development server on port 3001, no external cloud dependencies
- **Identified Subdomains:** None (single domain application)
- **Open Ports & Services:** 
  - Port 3001: HTTP web server (Express.js)
  - Internal SQLite database file access

## 3. Authentication & Session Management Flow

- **Entry Points:** 
  - `/rest/user/login` - Primary login endpoint with SQL injection vulnerability
  - `/api/Users` - User registration via REST API
  - `/rest/user/reset-password` - Password reset functionality
  - `/rest/2fa/*` - Two-factor authentication endpoints

- **Mechanism:** 
  1. User submits credentials via POST to `/rest/user/login`
  2. Backend executes vulnerable SQL query: `SELECT * FROM Users WHERE email = '${req.body.email}' AND password = '${security.hash(req.body.password)}'`
  3. MD5 password hash comparison (insecure by design)
  4. JWT token generated using hardcoded RSA private key
  5. Token returned to client with 6-hour expiration
  6. Subsequent requests use Bearer token in Authorization header
  7. Session data stored in in-memory `tokenMap` structure

- **Code Pointers:** 
  - Login handler: `routes/login.ts:18-84`
  - JWT utilities: `lib/insecurity.ts:23` (hardcoded keys)
  - Token verification: `lib/insecurity.ts:43-65`
  - Registration: Auto-generated via finale-rest in `server.ts:472-503`

## 4. API Endpoint Inventory

| Method | Endpoint Path | Authentication Required? | Description & Code Pointer |
|---|---|---|---|
| POST | /rest/user/login | No | **SQL Injection vulnerable login**. See `routes/login.ts:34`. |
| POST | /api/Users | No | User registration via finale-rest. See `server.ts:396-410`. |
| GET | /api/Products | No | Product listing via ORM. See `server.ts:472-503`. |
| GET | /rest/products/search | No | **SQL Injection vulnerable search**. See `routes/search.ts:23`. |
| GET | /rest/user/whoami | Yes (Bearer) | **JSONP injection vulnerable**. See `routes/currentUser.ts:26`. |
| GET | /api/Challenges | No | Security challenges listing. See `server.ts:365-367`. |
| GET | /api/SecurityQuestions | No | Password recovery questions. See `server.ts:379-381`. |
| POST | /api/SecurityAnswers | No | Security answer submission. See auto-generated endpoints. |
| GET | /api/Feedbacks | No | Customer feedback listing. See `server.ts:472-503`. |
| POST | /api/Feedbacks | Yes (Bearer) | Submit feedback (XSS vulnerable). See auto-generated endpoints. |
| GET | /api/BasketItems | Yes (Bearer) | Shopping cart items. See `server.ts:472-503`. |
| POST | /api/BasketItems | Yes (Bearer) | Add cart items. See `server.ts:472-503`. |
| GET | /rest/basket/:id | Yes (Bearer) | Basket operations. See `routes/basket.ts`. |
| POST | /rest/basket/:id/checkout | Yes (Bearer) | Order placement. See `routes/basket.ts`. |
| GET | /api/Cards | Yes (Bearer) | Payment methods. See `server.ts:472-503`. |
| GET | /api/Addresss | Yes (Bearer) | User addresses. See `server.ts:472-503`. |
| POST | /file-upload | No | **Multiple vulnerabilities: XXE, Zip Slip, YAML bomb**. See `routes/fileUpload.ts:19-146`. |
| POST | /profile/image/file | Yes (Bearer) | Profile image upload. See `routes/profileImageFile.ts`. |
| GET | /ftp/* | No | **Directory traversal vulnerable**. See `server.ts:268-270`. |
| GET | /metrics | No | **Information disclosure - Prometheus metrics**. See `routes/metrics.ts:66-76`. |
| POST | /rest/user/change-password | Yes (Bearer) | Password change. See `routes/changePassword.ts`. |
| POST | /rest/user/reset-password | No | Password reset. See `routes/resetPassword.ts`. |
| GET | /rest/user/data-export | Yes (Bearer) | GDPR data export. See `routes/dataExport.ts`. |
| POST | /rest/2fa/setup | Yes (Bearer) | 2FA enrollment. See `routes/2fa.ts`. |
| POST | /rest/2fa/verify | Yes (Bearer) | 2FA token verification. See `routes/verify.ts`. |
| GET | /rest/captcha | No | CAPTCHA generation. See `routes/captcha.ts`. |
| POST | /rest/web3/submitKey | No | Blockchain key submission. See `routes/web3.ts`. |
| GET | /rest/track-order/:id | No | Order tracking. See `routes/trackOrder.ts`. |
| GET | /rest/wallet/balance | Yes (Bearer) | Wallet balance. See `routes/wallet.ts`. |
| POST | /rest/memories | Yes (Bearer) | Photo memories upload. See `routes/memories.ts`. |
| POST | /b2b/v2/orders | Yes (Bearer) | B2B order placement. See `routes/b2b.ts`. |

## 5. Potential Input Vectors for Vulnerability Analysis

- **URL Parameters:** 
  - `?q=` (product search - SQL injection)
  - `?callback=` (JSONP injection in whoami)
  - `/:id` path parameters (basket, order tracking)
  - FTP file paths (directory traversal)

- **POST Body Fields (JSON/Form):** 
  - `email`, `password` (SQL injection in login)
  - `username`, `securityAnswer` (registration fields)
  - `comment`, `rating` (feedback - XSS)
  - `currentPassword`, `newPassword` (password change)
  - `answer` (security question bypass)
  - File upload fields: `file`, `filename` (various upload endpoints)
  - Basket manipulation: `ProductId`, `quantity`
  - Profile data: `image`, `username`

- **HTTP Headers:** 
  - `Authorization: Bearer <token>` (JWT manipulation)
  - `Content-Type` (bypasses in file upload)
  - `X-Forwarded-For` (if logged)
  - Custom challenge headers

- **Cookie Values:** 
  - Session cookies (if any)
  - Language preferences
  - Tracking cookies

## 6. Network & Interaction Map

### 6.1 Entities

| Title | Type | Zone | Tech | Data | Notes |
|---|---|---|---|---|---|
| OWASP-Juice-Shop | Service | App | Node/Express | PII, Tokens, Payments | Main vulnerable web application |
| SQLite-Database | DataStore | Data | SQLite 3 | PII, Tokens, Secrets | File-based database with user data |
| Angular-Frontend | Service | Edge | Angular/TS | Public | Single-page application frontend |
| FTP-Directory | Service | Edge | Static Files | Public, Secrets | Directory browsing with sensitive files |
| File-Upload-Storage | DataStore | Data | Filesystem | Secrets, Malicious | Stores uploaded files with path traversal |
| Metrics-Endpoint | Service | App | Prometheus | Internal | Exposes internal application metrics |
| User-Browser | ExternAsset | Internet | Browser | PII | End user web browser |
| JWT-TokenStore | DataStore | App | In-Memory | Tokens | Token validation and user sessions |

### 6.2 Entity Metadata

| Title | Metadata Key: Value; Key: Value; Key: Value |
|---|---|
| OWASP-Juice-Shop | Hosts: `http://localhost:3001`; Endpoints: `/api/*`, `/rest/*`, `/ftp/*`; Auth: JWT Bearer, None; Dependencies: SQLite-Database, File-Upload-Storage |
| SQLite-Database | Engine: `SQLite 3`; Location: `data/juiceshop.sqlite`; Consumers: `OWASP-Juice-Shop`; Encryption: `None`; Tables: Users, Products, Challenges, Feedbacks |
| Angular-Frontend | Framework: `Angular + TypeScript`; Assets: `/assets/*`; Communication: `HTTP REST, WebSocket`; Auth: `JWT Bearer Token`; Features: Product catalog, user management |
| FTP-Directory | Path: `/ftp/*`; Engine: `serve-index + express.static`; Access: `Public`; Contents: Sensitive files, backups, quarantine folder; Vulnerabilities: Directory traversal |
| File-Upload-Storage | Paths: `uploads/complaints/`, `frontend/dist/frontend/assets/public/images/uploads/`; Engines: `Multer, ZIP extraction`; Consumers: File upload endpoints; Vulnerabilities: Path traversal, XXE |
| Metrics-Endpoint | Path: `/metrics`; Format: `Prometheus`; Data: Application metrics, counters, gauges; Access: `Public`; Exposure: Internal application state |
| JWT-TokenStore | Type: `In-Memory Map`; Signing: `RSA with hardcoded keys`; Expiration: `6 hours`; Algorithm: `RS256`; Storage: `lib/insecurity.ts tokenMap` |

### 6.3 Flows (Connections)

| FROM → TO | Channel | Path/Port | Guards | Touches |
|---|---|---|---|---|
| User-Browser → Angular-Frontend | HTTPS | `:3001 /` | None | Public |
| User-Browser → OWASP-Juice-Shop | HTTPS | `:3001 /api/*` | None | Public |
| User-Browser → OWASP-Juice-Shop | HTTPS | `:3001 /rest/user/login` | None | PII |
| User-Browser → OWASP-Juice-Shop | HTTPS | `:3001 /rest/*` | auth:user | PII, Tokens |
| User-Browser → FTP-Directory | HTTPS | `:3001 /ftp/*` | None | Secrets |
| User-Browser → Metrics-Endpoint | HTTPS | `:3001 /metrics` | None | Internal |
| OWASP-Juice-Shop → SQLite-Database | File | `data/juiceshop.sqlite` | filesystem-access | PII, Tokens, Secrets |
| OWASP-Juice-Shop → File-Upload-Storage | File | `uploads/*` | filesystem-access | Secrets, Malicious |
| OWASP-Juice-Shop → JWT-TokenStore | Memory | `In-process` | None | Tokens |
| Angular-Frontend → OWASP-Juice-Shop | HTTPS | `:3001 /socket.io` | websocket | Public |

### 6.4 Guards Directory

| Guard Name | Category | Statement |
|---|---|---|
| auth:user | Auth | Requires valid JWT Bearer token in Authorization header with user role or higher. |
| auth:admin | Auth | Requires valid JWT Bearer token with admin role (bypassed in various challenges). |
| filesystem-access | Env | Direct file system access from Node.js process - no network restrictions. |
| websocket | Protocol | WebSocket connection for real-time challenge notifications and updates. |

---
