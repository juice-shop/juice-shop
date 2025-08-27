---
  1. Executive Summary

  OWASP Juice Shop is an intentionally vulnerable web application designed as a training platform to demonstrate common security vulnerabilities in modern web applications. The
  application presents an exceptionally critical security posture by design, featuring numerous deliberate vulnerabilities that create extensive attack surfaces across
  authentication, authorization, data handling, and input validation mechanisms. The codebase implements insecure practices throughout, with hardcoded secrets, SQL injection
  vulnerabilities via raw query execution, weak authentication using deprecated JWT libraries, and multiple XSS vectors.

  The application's architecture prioritizes educational value over security, making it an ideal controlled environment for penetration testing training while highlighting how
  modern web application stacks can be compromised. Critical security concerns include raw SQL query construction without parameterization, intentionally weak password hashing
  using MD5, exposed administrative functionality, and deliberately implemented backdoors for challenge completion. The trust boundaries are essentially non-existent by design,
  creating opportunities for privilege escalation and data access violations that mirror real-world application vulnerabilities.

  2. Architecture & Technology Stack

  - Framework & Language: Node.js/Express.js backend with TypeScript, Angular frontend. Express middleware stack includes deliberately weakened security controls with
  commented-out XSS protection and permissive CORS configuration. The middleware chain includes rate limiting that can be bypassed and JWT verification using outdated libraries
  with known vulnerabilities.
  - Architectural Pattern: Three-tier architecture with Angular SPA frontend, Express REST API backend, and SQLite database. The pattern implements deliberate trust boundary
  violations where client-side validation can be bypassed, server-side authorization is inconsistent, and database access includes raw SQL query construction. The separation of
  concerns is intentionally compromised to create training scenarios.
  - Critical Security Components: Authentication uses deprecated express-jwt 0.1.3 and jsonwebtoken 0.4.0 libraries with hardcoded RSA keys. Authorization middleware implements
  role-based access control but includes deliberate bypasses. Session management relies on JWT tokens with weak signing algorithms and exposed secrets. Input sanitization uses
  outdated sanitize-html 1.4.2 with multiple bypass opportunities built-in for educational purposes.

  3. Authentication & Authorization Deep Dive

  The authentication system implements multiple deliberate vulnerabilities that create extensive training opportunities. The primary login mechanism in routes/login.ts:34 uses raw
   SQL query construction: SELECT * FROM Users WHERE email = '${req.body.email}' AND password = '${security.hash(req.body.password)}', making it directly vulnerable to SQL
  injection attacks. Password security is intentionally weakened using MD5 hashing without salt in lib/insecurity.ts:43, allowing for rainbow table attacks and brute force
  scenarios.

  JWT token management relies on deprecated libraries with hardcoded RSA keys stored in encryptionkeys/jwt.pub and embedded private keys in lib/insecurity.ts:23. The authorization
   middleware includes deliberate bypasses and inconsistent enforcement, with some endpoints protected while others remain exposed. Two-factor authentication is available but can
  be bypassed through various challenge mechanisms. The system includes multiple pre-configured users with weak credentials designed for specific training challenges, including
  admin accounts with predictable passwords.

  Session management stores authenticated user data in an in-memory tokenMap structure that can be manipulated, and includes user role elevation opportunities where customer
  accounts can be promoted to administrative roles through various exploitation techniques. The authentication flow includes specific challenge verification logic that rewards
  successful exploitation attempts.

  4. Data Security & Storage

  - Database Security: Uses SQLite with file-based storage at data/juiceshop.sqlite. Database access includes both ORM (Sequelize) operations and raw SQL queries, with the raw
  queries being intentionally vulnerable to injection. No encryption at rest, and database file permissions allow direct access in development environments.
  - Data Flow Security: Sensitive data flows through the application without consistent protection. User passwords are hashed using MD5, personal information is stored in
  plaintext, and payment card data (in Card model) lacks proper encryption. File upload functionality allows various file types with minimal validation, creating opportunities for
   malicious file upload scenarios.
  - Multi-tenant Data Isolation: No multi-tenancy implementation - the application operates as a single-tenant system with all users sharing the same database instance. User data
  separation relies entirely on application-layer authorization checks, which are deliberately weakened to create training scenarios.

  5. Attack Surface Analysis

  - External Entry Points: The application exposes multiple vulnerable endpoints including file upload at /file-upload, FTP directory browsing at /ftp, authentication endpoints at
   /rest/user/login, product search with NoSQL injection potential, and administrative interfaces with weak access controls. Web3/blockchain integration endpoints provide
  additional attack vectors through smart contract interaction. The Angular frontend includes numerous client-side validation bypasses.
  - Internal Service Communication: Communication between frontend and backend relies on JWT tokens with weak validation. Inter-service trust is minimal with extensive logging of
  security-sensitive operations. The application includes WebSocket functionality for real-time features with minimal authorization checks.
  - Input Validation Patterns: Input validation is intentionally inconsistent and bypassable. The application uses multiple sanitization approaches (legacy, secure, and HTML
  sanitization) but implements them with deliberate weaknesses. File upload validation includes MIME type checking with known bypasses, and form input validation can be
  circumvented through various techniques including null byte injection and encoding manipulation.
  - Background Processing: Includes chatbot functionality, memory creation with file upload, and challenge verification logic that runs in response to user actions. These
  background processes include deliberate race conditions and state manipulation opportunities designed for advanced penetration testing scenarios.

  6. Infrastructure & Operational Security

  - Secrets Management: Hardcoded secrets throughout the codebase including JWT signing keys, database credentials ("username", "password" for SQLite), and API keys. The
  lib/insecurity.ts file contains exposed cryptographic keys and a hardcoded HMAC secret. Configuration files in the config/ directory expose sensitive settings and challenge
  answers.
  - Configuration Security: Multiple configuration variants expose different vulnerability sets. The default configuration includes weak security settings, disabled XSS
  protection, and permissive CORS policies. Environment separation is minimal with shared secrets and exposed development settings in production builds.
  - External Dependencies: Includes numerous outdated and vulnerable dependencies by design, including deprecated JWT libraries, old sanitization libraries, and various packages
  with known security issues. The package.json reveals the intentional use of vulnerable versions for educational purposes.
  - Monitoring & Logging: Basic logging using Winston with console output. Prometheus metrics endpoint at /metrics exposes application internals. Access logging stores detailed
  request information including potential exploitation attempts. The monitoring setup includes Grafana dashboard configuration for observing attack patterns during training
  scenarios.

  7. Overall Codebase Indexing

  The codebase follows a traditional Node.js/Express application structure with TypeScript implementation throughout. The root directory contains primary application entry points
  (app.ts, server.ts), Docker configuration, and build orchestration via Grunt. The /routes directory houses 40+ route handlers implementing various vulnerable endpoints, while
  /models contains Sequelize ORM models for 20+ database entities. The /lib directory includes utility functions and security-related code with intentional vulnerabilities,
  particularly in insecurity.ts which serves as a central repository of weak security implementations.

  Frontend code resides in /frontend with Angular components, services, and assets. The /data directory contains static configuration, user data, challenge definitions, and
  database initialization scripts. Configuration management uses multiple YAML files in /config directory for different deployment scenarios. The testing framework encompasses
  both API tests using Frisby and end-to-end tests with Cypress, specifically designed to verify that vulnerabilities remain exploitable. Build processes include TypeScript
  compilation, frontend bundling, and Docker containerization with intentionally permissive security contexts.

  8. Critical File Paths

  - Configuration:
    - config/default.yml
    - Dockerfile
    - docker-compose.test.yml
    - package.json
    - config.schema.yml
    - swagger.yml
  - Authentication & Authorization:
    - routes/login.ts
    - routes/verify.ts
    - routes/2fa.ts
    - lib/insecurity.ts
    - routes/authenticatedUsers.ts
    - routes/changePassword.ts
    - routes/resetPassword.ts
  - API & Routing:
    - server.ts
    - app.ts
    - routes/angular.ts
    - routes/currentUser.ts
    - routes/userProfile.ts
    - routes/basket.ts
    - routes/search.ts
  - Data Models & DB Interaction:
    - models/index.ts
    - models/user.ts
    - models/basket.ts
    - models/card.ts
    - models/product.ts
    - models/securityAnswer.ts
    - data/datacreator.ts
  - Dependency Manifests:
    - package.json
    - frontend/package.json
  - Sensitive Data & Secrets Handling:
    - lib/insecurity.ts
    - encryptionkeys/jwt.pub
    - encryptionkeys/premium.key
  - Middleware & Input Validation:
    - routes/fileUpload.ts
    - routes/verify.ts
    - routes/captcha.ts
    - routes/imageCaptcha.ts
  - Logging & Monitoring:
    - lib/logger.ts
    - routes/metrics.ts
    - monitoring/grafana-dashboard.json
  - Infrastructure & Deployment:
    - Dockerfile
    - docker-compose.test.yml
    - Gruntfile.js