Here is the Markdown content for the page Hayrok CommerceHub Demo — powered by a controlled Juice Shop fork:
1. Executive Summary
Hayrok CommerceHub is a realistic, synthetic commerce application used to demonstrate and qualify Hayrok’s Governed Adversarial Exposure Validation platform.
CommerceHub represents a modern business application with:
Customer-facing shopping workflows
User accounts and authentication
Products, baskets, orders, payments, refunds, and promotions
Administrative and support functions
REST APIs and browser-driven workflows
Multi-user and optional multi-organization authorization boundaries
File, webhook, integration, and reporting capabilities
Realistic telemetry and security controls
Deliberately controlled vulnerable conditions
Secure equivalents for negative-control testing
CommerceHub is not an unrestricted vulnerable application and is not a public hacking game. It is a controlled validation target whose vulnerable behaviors are:
Explicitly registered
Versioned
Isolated


Reproducible
Activatable by policy
Observable through telemetry
Independently verifiable
Resettable after every run
Paired with secure or mitigated behavior
The product uses a controlled Juice Shop fork to accelerate delivery of the frontend, common commerce workflows, authentication flows, product catalog, basket, checkout, and existing web vulnerability coverage. Hayrok-owned companion services add enterprise authorization, deterministic business-logic scenarios, evidence-rich APIs, secure controls, telemetry, and HVR lifecycle management.

2. Product Vision
2.1 Vision statement
CommerceHub will provide a realistic but completely synthetic environment in which Hayrok can demonstrate that it does more than identify possible weaknesses.
Hayrok must be able to prove:
The asset and attack surface were discovered.
The appropriate validation objective and scenarios were selected.
The plan remained inside approved scope.
The intended behavior was executed safely.
Exploitability or control effectiveness was independently confirmed.
Complete evidence was collected.
Findings were generated with defensible technical and business context.
The environment was reset and verified after execution.

2.2 Product positioning
CommerceHub is:
A controlled, telemetry-rich commerce application designed to demonstrate governed adversarial validation across web, API, identity, business-logic, detection, and evidence workflows.
It is not:
A production commerce platform
A customer data-processing environment
A public capture-the-flag service
A replacement for other specialized HVR target packs
A source of unrestricted attack infrastructure
The canonical implementation of Hayrok’s own customer platform

3. Strategic Role in the Hayrok Validation Range
CommerceHub serves four strategic roles.
3.1 Customer demonstration target
CommerceHub gives prospects a familiar business application through which they can understand:
Internet exposure
Authentication and authorization risks
API risks
Business-logic abuse
Control detection and prevention
Evidence collection
Risk prioritization
Revalidation

3.2 Engineering qualification target
Hayrok engineering teams use CommerceHub to qualify:
Recon
Scenario Recommendation Engine
Planner
Approval Service
Execution agents
Validation Agent
Evidence Fabric
CSE
HRE
Findings Service
Reporting
AGIE
Runtime Presence Validation

3.3 Regression environment
CommerceHub provides deterministic regression scenarios for:
Platform releases
Model changes
Tool upgrades
Prompt changes
Policy changes
Gateway changes
Detection rule changes
Evidence-contract changes

3.4 Sales and investor narrative
CommerceHub supports a simple story:
Traditional tools report that CommerceHub may be vulnerable. Hayrok proves whether a realistic attacker can reach the weakness, whether the weakness is exploitable, whether security controls detect or prevent it, what evidence supports the result, and what business outcome is exposed.
4. Target Users and Stakeholders
4.1 External personas
CISO
Needs to understand:
Whether material risk is real
Whether controls work
Whether critical workflows are exposed
Whether evidence supports executive decisions

Security Director
Needs to understand:
Coverage across assets and objectives
Validation progress
Detection and prevention effectiveness
Remediation priorities

Application Security Engineer
Needs:
Technical requests and responses
Reproduction details
Affected parameters and endpoints
Secure-versus-vulnerable comparison
Revalidation results

SOC and Detection Engineer
Needs:
Attack timeline
Detection outcome
Relevant logs and alerts
Detection latency
Control misses

Auditor or GRC stakeholder
Needs:
Evidence lineage
Policy approvals
Test scope
Results mapped to controls
Tamper-evident audit history

4.2 Internal personas
Hayrok product managers
Security scenario engineers
Agent engineers
Platform engineers
Sales engineers
Customer success
Quality assurance
Detection content engineers
Security researchers

5. Product Principles
5.1 Controlled vulnerability
No vulnerability is enabled merely because insecure code exists.
Every scenario must be associated with:
A scenario ID
An approved state
An environment
A range run
A start and expiration time
A responsible owner
A cleanup procedure

5.2 Secure baseline first
The default CommerceHub environment must be secure.
The environment enters vulnerable, detection-only, mitigated, or prevention states only through the HVR control plane.
5.3 Deterministic execution
Each scenario must use predictable fixtures, identities, resources, and terminal markers.
5.4 Independent truth
The same component performing the security test must not determine whether the test succeeded.
The HVR Ground Truth Oracle must independently inspect:
Application state
Data state
Audit events
Control events
Synthetic terminal markers

5.5 Synthetic data only
CommerceHub must never contain:
Real customer records
Real credentials
Real payment information
Real employee data
Production API keys
Production integrations
Production cloud access

5.6 Upstream replaceability
The controlled Juice Shop fork is an implementation dependency, not the product boundary.
Hayrok-owned components must isolate CommerceHub from upstream implementation details.
5.7 Observable by design
All business and security-relevant actions must be observable and correlated to:
range_run_id
scenario_id
environment_id
request_id
trace_id
Synthetic user identity
Tenant or organization context
Tool and agent identity

6. Product Scope
6.1 MVP scope
The MVP includes:
Commerce storefront
Product catalog
Product search
User registration and login
Customer profile
Shopping basket
Checkout
Orders and order details
Product reviews
Administrative product management
Support workflow
Native Juice Shop scenario compatibility
Hayrok scenario registry
HVR Adapter
Ground Truth Oracle interface
Seed and reset
Envoy routing
OpenTelemetry integration
OpenSearch integration
Splunk event forwarding
Scenario state management
Secure companion APIs
Initial scenario suite
Docker Compose developer deployment
EKS qualification deployment
Terraform infrastructure starter

6.2 Post-MVP scope
Auth0 enterprise identity profile
AGS and OPA enforcement
Organization administration
Membership and role administration
File service
Webhook service
Refund service
Loyalty and gift-card workflows
Synthetic payment provider
Cloudflare control profiles
Runtime application self-protection profile
Mobile API façade
GraphQL API
AI support assistant
Advanced supply-chain scenarios
Multi-region deployment
Automated scenario authoring toolkit
Customer-specific demo themes

6.3 Out of scope
Real payment processing
Production deployment
Real order fulfillment
Customer-created arbitrary vulnerable code
Unrestricted shell access
Arbitrary external targets
Persistent public vulnerable environments
Production-grade commerce availability
Customer production data ingestion

7. Product Experience
7.1 CommerceHub customer experience
The application should appear to be a credible commerce SaaS application rather than an obvious security training environment.
Primary navigation:
Home
Products
Categories
Search
Basket
Orders
Account
Support
Administrative navigation:
Overview
Products
Orders
Customers
Promotions
Reviews
Refunds
Integrations
Audit Activity
7.2 Branding
CommerceHub should use:
Hayrok-compatible visual system
CommerceHub product name
Synthetic company identity
Synthetic product catalog
Synthetic support information
Hayrok attribution within an About or Notices page
No visible scoreboard in customer demo mode
No challenge-solved notifications
No training hints
No OWASP branding presented as Hayrok ownership

7.3 Environment modes
Demo mode
Purpose:
Customer walkthroughs
Sales demonstrations
Investor demonstrations
Behavior:
Polished branding
Selected scenarios only
Hidden challenge mechanics
Curated sample data
Guided Hayrok validation runs

Qualification mode
Purpose:
Automated engineering regression
Behavior:
Deterministic fixtures
Machine-readable state
Full telemetry
Strict reset
Scenario-specific entry points
Oracle-enabled evaluation

Research mode
Purpose:
Scenario development and agent experimentation
Behavior:
Expanded diagnostic visibility
Debug telemetry
Developer-only challenge information
Isolated local or disposable environment

Training mode
Purpose:
Internal demonstrations and education
Behavior:
Optional scoreboard
Optional hints
Multiple seeded identities
Guided scenario walkthroughs

8. Controlled Fork Strategy
8.1 Repository strategy
Use a controlled-fork model:
OWASP Juice Shop upstream
        ↓
Hayrok upstream mirror
        ↓
Pinned integration branch
        ↓
Hayrok customization layer
        ↓
Approved CommerceHub release
Recommended repositories:
hayrok-commercehub/
├── upstream/
│   └── juice-shop/
├── commercehub-overlay/
├── companion-services/
├── hvr-adapter/
├── oracle-adapter/
├── scenario-registry/
├── telemetry/
├── infrastructure/
├── tests/
└── documentation/
8.2 Fork governance
Every upstream update requires:
Version review
License review
Challenge compatibility review
Configuration-schema review
Security review
Scenario regression
Evidence-contract regression
Performance regression
Deployment verification
Approval before promotion

8.3 Upstream ownership boundary
Use upstream Juice Shop for:
Storefront
Product catalog
Basket
Checkout
Native account workflows
Existing challenges
Basic UI and backend foundation
Use Hayrok-owned services for:
Scenario state management
Multi-organization authorization tests
Secure negative controls
Business-logic scenarios
File scenarios
Webhook scenarios
Enterprise identity
Telemetry normalization
Truth verification
HVR lifecycle

8.4 Patch strategy
Patches should be grouped into:
branding/
configuration/
telemetry/
challenge-visibility/
correlation/
compatibility/
Avoid implementing most new Hayrok scenarios directly inside upstream files.
9. Functional Requirements
9.1 Storefront
The storefront must support:
Browsing products
Searching products
Product details
Product reviews
Basket management
Checkout
Order confirmation
Order history
User profile management

9.2 Administrative workflows
Administrators must be able to:
Create and update products
Change pricing
Review orders
Manage promotions
Moderate reviews
View synthetic customer accounts
Process synthetic refunds
Manage integrations

9.3 Organization model
Hayrok companion services should support:
Tenant
Organization
User
Membership
Role
Resource ownership
Example:

Tenant: CommerceHub Demo
├── Organization A: Northstar Retail
│   ├── Alice
│   └── Order A
└── Organization B: Meridian Supply
    ├── Bob
    └── Order B
This model enables deterministic BOLA, BFLA, cross-tenant, excessive-data, and role-escalation testing.
9.4 HVR lifecycle
The HVR Adapter must support:
Environment readiness
Scenario inventory
Environment preparation
Identity creation
Fixture creation
Scenario activation
Scenario expiration
Scenario reset
Full environment reset
Truth retrieval
Cleanup verification

9.5 Scenario states
Supported states:
SECURE
VULNERABLE
DETECTION_ONLY
MITIGATED
PREVENTION
DISABLED
SECURE
The secure implementation is active.
VULNERABLE
The intended vulnerable behavior is active.
DETECTION_ONLY
The behavior is exploitable, but expected detection telemetry is active.
MITIGATED
The underlying weakness may remain, but terminal impact is blocked.
PREVENTION
The action is blocked before vulnerable behavior occurs.
DISABLED
The scenario is not available.
10. Initial Scenario Catalog
10.1 Web scenarios
Scenario ID
Scenario
Expected proof
CH-WEB-XSS-001
Stored review XSS
Controlled browser execution marker
CH-WEB-XSS-002
Reflected search XSS
Controlled response and browser marker
CH-WEB-FILE-001
Restricted file access
Protected synthetic document returned
CH-WEB-PATH-001
Path traversal
Synthetic file outside approved path accessed
CH-WEB-UPLOAD-001
Unsafe upload
Disallowed synthetic file accepted
CH-WEB-SESSION-001
Weak session handling
Session boundary bypass confirmed
10.2 API scenarios
Scenario ID
Scenario
Expected proof
CH-API-BOLA-001
Cross-organization order access
User A receives Order B marker
CH-API-BFLA-001
Customer invokes admin function
Administrative state changes
CH-API-MASS-001
Membership role mass assignment
Member becomes synthetic admin
CH-API-EXCESS-001
Excessive data exposure
Restricted attributes returned
CH-API-RATE-001
Missing rate control
Bounded threshold exceeded
CH-API-TOKEN-001
Token validation weakness
Invalid claim combination accepted
10.3 Business-logic scenarios
Scenario ID
Scenario
Expected proof
CH-BIZ-PRICE-001
Client-controlled product price
Order total differs from server price
CH-BIZ-DISCOUNT-001
Promotion stacking
Discount exceeds allowed policy
CH-BIZ-REFUND-001
Duplicate refund
Refund issued more than once
CH-BIZ-INVENTORY-001
Inventory race
Oversell marker reached
CH-BIZ-GIFTCARD-001
Gift-card reuse
Balance redeemed repeatedly
CH-BIZ-CHECKOUT-001
Workflow step bypass
Order completes without required step
10.4 Integration scenarios
Scenario ID
Scenario
Expected proof
CH-INT-SSRF-001
Webhook URL SSRF
Synthetic internal callback reached
CH-INT-SIGN-001
Weak webhook verification
Invalid signature accepted
CH-INT-KEY-001
Exposed integration key
Synthetic integration endpoint reached
CH-INT-REDIRECT-001
Unsafe redirect
Redirect reaches controlled destination
10.5 Secure controls
Every positive scenario must have:
A secure counterpart
A denied counterpart where relevant
A negative input that must not trigger a finding
A cross-scope containment test
A cleanup test

11. System Architecture
11.1 Logical architecture
Authorized Demo User or Hayrok Agent
                |
                v
          Cloudflare Edge
                |
                v
         AWS Load Balancer
                |
                v
             Envoy
      _________|____________
     |                      |
     v                      v
CommerceHub Juice Shop   Hayrok Companion APIs
Frontend + Backend       Orders / Files / Webhooks
     |                      |
     |                      v
     |                PostgreSQL / Redis
     |
     v
Native Juice Shop Store

HVR Control Plane
     |
     v
CommerceHub HVR Adapter
     |
     +--> Scenario Registry
     +--> Seed Service
     +--> Reset Service
     +--> Readiness Service
     +--> Oracle Adapter

All components
     |
     v
OpenTelemetry Collector
     |
     +--> OpenSearch
     +--> Splunk
     +--> Evidence Fabric
11.2 Service boundaries
CommerceHub Juice Shop
Responsibilities:
Storefront
Native commerce workflows
Native challenges
Native authentication profile
Product and basket behavior
Must not own:
HVR lifecycle
Ground truth
Hayrok scenario registry
Enterprise authorization
Benchmark evaluation

Companion API
Responsibilities:
Deterministic Hayrok-owned scenarios
Organization-aware APIs
Secure/vulnerable provider selection
Business-logic scenarios
Structured security events

HVR Adapter
Responsibilities:
Lifecycle orchestration
Scenario preparation
Scenario activation
Scenario expiration
Reset
Readiness
Fixture provisioning

Oracle Adapter
Responsibilities:
Protected truth extraction
Ownership verification
Terminal-state verification
Expected control-event verification
Cleanup verification

Scenario Registry
Responsibilities:
Scenario definitions
Version
State
required fixtures
allowed actions
expected evidence
cleanup procedure
safety constraints

Telemetry Adapter
Responsibilities:
Correlation metadata
Structured event normalization
Secret redaction
Export to observability systems

12. Component Design
12.1 Envoy Gateway
Routes:
/                     → Juice Shop
/api/native/*          → Juice Shop APIs
/api/v1/orders/*       → Companion Orders API
/api/v1/files/*        → Companion Files API
/api/v1/webhooks/*     → Companion Webhook API
/api/v1/admin/*        → Companion Admin API
/internal/hvr/*        → HVR Adapter, private only
/internal/oracle/*     → Oracle Adapter, private only
Responsibilities:
Route separation
Request IDs
HVR correlation headers
Access logging
Rate-limit profiles
External authorization profile
Request-size limits
Public/private route enforcement

12.2 Companion service provider model
Use a provider interface for each scenario-capable operation.
interface OrderAccessProvider {
  getOrder(
    orderId: string,
    context: RequestContext
  ): Promise
<Order>;
}
Implementations:
SecureOrderAccessProvider
VulnerableOrderAccessProvider
MitigatedOrderAccessProvider
PreventionOrderAccessProvider
The resolver selects the provider from the approved scenario state.
Business services must not contain unstructured checks such as:
```shell
if vulnerable then skip security
Provider isolation is required for maintainability, auditability, and testing.
12.3 Scenario registry record
{
  "scenarioId": "CH-API-BOLA-001",
  "version": "1.0.0",
  "name": "Cross-organization order access",
  "category": "api_authorization",
  "objective": "api_security",
  "state": "SECURE",
  "allowedStates": [
    "SECURE",
    "VULNERABLE",
    "DETECTION_ONLY",
    "MITIGATED",
    "PREVENTION"
  ],
  "requiredFixtures": [
    "user_a",
    "user_b",
    "order_b"
  ],
  "expectedEvidence": [
    "identity_context",
    "request",
    "response",
    "ownership_record",
    "audit_event"
  ],
  "cleanupProcedure": "reset-order-authorization"
}
13. Data Model
13.1 Core entities
Tenant
id
name
status
created_at
Organization
id
tenant_id
name
slug
status
User
id
email
display_name
status
synthetic
Membership
id
organization_id
user_id
role
status
Product
id
sku
name
description
price_cents
inventory_count
organization_id
status
Order
id
organization_id
user_id
status
subtotal_cents
discount_cents
total_cents
payment_status
created_at
OrderItem
id
order_id
product_id
quantity
unit_price_cents
ScenarioDefinition
scenario_id
version
name
category
objective
risk_level
manifest
status
ScenarioActivation
id
environment_id
range_run_id
scenario_id
state
activated_by
activated_at
expires_at
approval_reference
AuditEvent
id
range_run_id
scenario_id
request_id
trace_id
actor_id
organization_id
action
resource_type
resource_id
outcome
metadata
created_at
TruthRecord
id
environment_id
range_run_id
scenario_id
truth_type
encrypted_value
created_at
expires_at
14. API Design
14.1 HVR lifecycle API
Readiness
GET /internal/hvr/readiness
Response:
{
  "ready": true,
  "version": "commercehub-1.0.0",
  "upstreamVersion": "pinned-approved-version",
  "databaseReady": true,
  "telemetryReady": true,
  "oracleReady": true,
  "activeRangeRun": null
}
Prepare environment
POST /internal/hvr/prepare
Request:
{
  "rangeRunId": "rr_123",
  "suite": "api-security-p0",
  "expiresAt": "2026-08-05T01:00:00Z"
}
Activate scenario
POST /internal/hvr/scenarios/{scenarioId}/activate
Request:
{
  "rangeRunId": "rr_123",
  "state": "VULNERABLE",
  "approvalReference": "apr_456",
  "expiresAt": "2026-08-05T01:00:00Z"
}
Reset scenario
POST /internal/hvr/scenarios/{scenarioId}/reset
Reset environment
POST /internal/hvr/reset
Cleanup status
GET /internal/hvr/cleanup-status
14.2 Oracle API
GET /internal/oracle/runs/{rangeRunId}/scenarios/{scenarioId}
Response:
{
  "scenarioId": "CH-API-BOLA-001",
  "status": "PASS",
  "facts": {
    "attackerUser": "user-a",
    "victimOwner": "user-b",
    "victimOrder": "order-b",
    "foreignObjectReturned": true
  },
  "evidenceReferences": [
    "evt_123",
    "request_123",
    "ownership_123"
  ]
}
Oracle routes must require:
Private network
Workload identity
mTLS
Explicit OPA authorization
No access by execution agents

15. Authentication and Authorization
15.1 Identity profiles
Native profile
Uses native Juice Shop authentication.
Purpose:
Native authentication challenges
Session tests
Password-reset tests
Token behavior tests

Enterprise profile
Uses:
Auth0
→ Envoy
→ AGS
→ OPA
→ Companion API
Purpose:
SSO demonstrations
Organization context
Role-based access
Gateway authorization
Session revocation
Approval enforcement

15.2 Trusted context
The backend may trust only identity information established by:
Verified Auth0 token
AGS
Signed internal context
Istio workload identity
Reject client-supplied:

x-user-id
x-tenant-id
x-org-id
x-role
x-is-admin
except in explicitly marked local development mode.
15.3 Authorization model
OPA inputs:
{
  "actor": {
    "userId": "user-a",
    "roles": ["org_member"],
    "organizationId": "org-a"
  },
  "action": "order.read",
  "resource": {
    "type": "order",
    "id": "order-b",
    "organizationId": "org-b"
  },
  "environment": "qualification",
  "scenarioState": "SECURE"
}
16. Security Requirements
16.1 Environment isolation
CommerceHub must run only in:
HVR sandbox accounts
Dedicated namespaces or clusters
Approved local developer environments
It must not have:
Production VPC peering
Production credentials
Production DNS trust
Customer integrations
Shared production databases

16.2 Network controls
Default-deny internal network policy
Explicit service-to-service allowlist
Restricted outbound access
Private HVR and Oracle routes
Edge allowlists for demos
Automatic expiration of public routes

16.3 Secret controls
Synthetic credentials only
Secrets stored in approved secret store
No secrets committed to repository
No raw token logging
Evidence redaction
Short-lived access credentials
Automatic revocation during cleanup

16.4 Scenario activation controls
High-risk scenarios require:
Approval reference
Approved environment
Allowed scenario
Approved state
Maximum duration
Kill switch
Complete audit event

16.5 Supply-chain controls
Pinned upstream commit or release
Pinned base image digest
SBOM generation
Image signing
Vulnerability scanning
License attribution
Patch review
Provenance verification

17. Telemetry and Evidence
17.1 Correlation envelope
Every event should include:
{
  "rangeRunId": "rr_123",
  "scenarioId": "CH-API-BOLA-001",
  "environmentId": "env_123",
  "requestId": "req_123",
  "traceId": "trace_123",
  "actorId": "user-a",
  "organizationId": "org-a",
  "service": "orders-api",
  "action": "order.read",
  "outcome": "authorization_bypassed"
}
17.2 Telemetry sources
Cloudflare events
ALB access logs
Envoy access logs
Juice Shop logs
Companion service logs
PostgreSQL audit events
Redis events where applicable
Kubernetes audit logs
Falco
OpenTelemetry traces
Splunk detections
Approval decisions
OPA decisions
HVR lifecycle events

17.3 Evidence requirements
A confirmed finding must include:
Scope
Identity context
Target resource
Request
Response
Relevant state before execution
Relevant state after execution
Control outcome
Oracle result
Tool provenance
Scenario version
Application version
Timestamp
Evidence hash

17.4 Evidence redaction
Redact:
Session tokens
Passwords
Complete synthetic secrets
Authorization headers
Cookies
Internal management credentials
Retain fingerprints and safe metadata.

18. Ground Truth and Benchmarking
18.1 Oracle rules
The Oracle must:
Use protected data
Be read-only during evaluation
Remain inaccessible to agents
Evaluate objective predicates
Return PASS, FAIL, INDETERMINATE, or CONTROL_BLOCKED
Record the facts supporting its outcome

18.2 Benchmark dimensions
Recon
Endpoint recall
Method accuracy
Parameter accuracy
Authentication classification
Technology identification
Asset duplication rate

Planner
Valid prerequisites
Correct action order
Correct identity
Correct scenario
Correct tool selection
Safety compliance
Stopping behavior

Execution
Scope compliance
Tool success
Retry behavior
Time to objective
Unnecessary action count

Validation
True positive
False positive
False negative
Evidence completeness
Repeatability
Technical classification accuracy

Detection
Alert produced
Alert quality
Correlation quality
Detection latency
Prevention outcome

19. Deployment Design
19.1 Local development
Docker Compose
├── Envoy
├── Juice Shop
├── Companion API
├── HVR Adapter
├── Oracle Adapter
├── PostgreSQL
├── Redis
├── OTel Collector
└── OpenSearch
Purpose:
Fast development
Scenario tests
Contract tests
UI customization
Adapter testing

19.2 EKS qualification environment
AWS HVR Sandbox Account
└── EKS Cluster
    ├── commercehub namespace
    ├── telemetry namespace
    └── management namespace
Workloads:
Envoy gateway
Juice Shop
Companion APIs
HVR Adapter
Oracle Adapter
OTel Collector
Managed services:
RDS PostgreSQL
ElastiCache Redis
S3 evidence staging
OpenSearch
Splunk forwarder or HEC
Secrets Manager

19.3 Customer demo environment
Cloudflare Access
→ Cloudflare WAF
→ ALB
→ Envoy
→ CommerceHub
Controls:
Named audience
Demo expiration
IP or identity restriction
Rate limit
No Oracle exposure
No internal HVR exposure
Automatic teardown

20. Availability and Performance Targets
CommerceHub is a demo and qualification system, but it still requires predictable behavior.
20.1 MVP service objectives
Readiness response: under 3 seconds
Scenario activation: under 10 seconds
Scenario reset: under 60 seconds
Full data reset: under 5 minutes
Basic page response p95: under 1.5 seconds
Companion API p95: under 500 milliseconds
Audit-event persistence: under 5 seconds
Telemetry correlation completeness: at least 99%
Cleanup verification: deterministic result required

20.2 Capacity
MVP target:
10 concurrent demo users
5 concurrent automated validation runs per isolated environment
100 requests per second short-term test capacity
Maximum environment lifespan of 24 hours
Qualification environments recreated regularly

21. Reset and Cleanup
21.1 Scenario reset
Must:
Restore affected database rows
Delete scenario-created objects
Clear audit events where allowed
Restore scenario state to SECURE
Revoke temporary credentials
Remove temporary files
Verify fixture integrity

21.2 Full reset
Must:
Disable all scenarios.
Revoke all short-lived identities.
Clear application databases.
Recreate deterministic fixtures.
Clear Redis.
Remove scenario files.
Purge synthetic queues.
Restore secure control profiles.
Verify telemetry.
Run baseline tests.

21.3 Cleanup states
CLEAN
RESIDUAL_DATA
RESIDUAL_IDENTITY
RESIDUAL_SCENARIO_STATE
ACTIVE_PUBLIC_ROUTE
TELEMETRY_UNAVAILABLE
VERIFICATION_INDETERMINATE
Only CLEAN permits environment reuse.
22. Testing Strategy
22.1 Unit tests
Scenario provider selection
Authorization filters
Pricing calculations
Reset handlers
Truth predicates
Redaction
State expiration

22.2 Contract tests
HVR API
Oracle API
Scenario manifest schema
Evidence envelope
Telemetry envelope
OPA input
Auth0 claim normalization

22.3 Scenario tests
Every scenario requires:
Secure test
Vulnerable test
Mitigated test where applicable
Prevention test where applicable
Detection test
Negative-control test
Cross-organization containment test
Reset test

22.4 End-to-end tests
Prepare
→ seed
→ activate
→ execute
→ validate
→ collect evidence
→ query Oracle
→ reset
→ verify secure baseline
22.5 Upstream compatibility tests
For each Juice Shop update:
Storefront load
Login
Product search
Basket
Checkout
Order creation
Configuration load
Selected native challenges
Branding
Telemetry injection
Envoy routes
HVR adapter integration

23. Implementation Build Plan
Phase 0 — Product and architecture foundation
Duration: one sprint
Deliverables:
Product requirements approved
Architecture approved
Controlled-fork policy
Repository structure
Scenario contract schema
Evidence contract
HVR lifecycle contract
Threat model
Licensing and attribution plan
Exit criteria:
Product and engineering owners approve boundaries
MVP scenario list approved
Security isolation model approved

Phase 1 — Controlled fork and branded application
Duration: two sprints
Build:
Upstream mirror
Pinned fork
CommerceHub configuration
Product catalog
Branding
Demo users
Demo organizations
Hidden training mechanics
Notices page
Local Docker deployment
Acceptance:
CommerceHub appears as a coherent synthetic commerce application
Native shopping workflow operates
Upstream reference remains traceable
Build is reproducible

Phase 2 — HVR lifecycle and scenario registry
Duration: two sprints
Build:
HVR Adapter
Readiness
Prepare
Seed
Reset
Scenario activation
Scenario expiration
Scenario registry
Protected Oracle API
Audit events
Acceptance:
A scenario can be activated and reset through a signed HVR request
The secure baseline is verified after reset
Agents cannot access Oracle endpoints

Phase 3 — Companion API and P0 scenarios
Duration: three sprints
Build:
Tenant and organization model
Orders API
Membership API
Pricing API
Secure provider registry
Vulnerable provider registry
P0 scenarios:

BOLA
BFLA
Mass assignment
Price manipulation
Duplicate refund
Webhook SSRF
Acceptance:

Every scenario passes secure and vulnerable tests
Every scenario has an Oracle predicate
Every scenario emits structured telemetry
Every scenario resets deterministically

Phase 4 — Telemetry and evidence
Duration: two sprints
Build:
OTel instrumentation
Envoy access logs
OpenSearch integration
Splunk forwarding
Evidence normalization
Secret redaction
Trace correlation
Detection result ingestion
Acceptance:
One range run can be reconstructed end to end
Required evidence fields are complete
Splunk detection results correlate to the scenario

Phase 5 — EKS qualification environment
Duration: two sprints
Build:
Terraform foundation
EKS manifests or Helm charts
RDS
Redis
private networking
Cloudflare demo ingress
environment TTL
cleanup automation
residual-resource verification
Acceptance:
Environment deploys from a clean account
Qualification suite completes
Environment returns CLEAN after teardown

Phase 6 — Hayrok platform integration
Duration: three sprints
Integrate:
Validation Orchestration
Scenario Recommendation Engine
Planner
Approval Service
Evidence Fabric
Findings Service
CSE
HRE
Reporting
AGIE
Acceptance:
User can launch a CommerceHub validation from Hive
Plan receives policy and approval evaluation
Evidence produces a finding
Finding can be revalidated
Results appear in reports

Phase 7 — Enterprise identity and controls
Duration: two to three sprints
Build:
Auth0 profile
AGS
OPA policies
organization roles
Cloudflare control profiles
Envoy rate limits
WAF prevention
detection-only profiles
control drift variants
Acceptance:
Same scenario can run as vulnerable, detected, mitigated, and prevented
Hayrok reports the correct control outcome

Phase 8 — Demo hardening and launch
Duration: one sprint
Build:
Demo scripts
Guided use cases
Sample reports
Dashboard presets
Failure recovery
Runbooks
product documentation
sales engineering guide
attribution review
Acceptance:
A sales engineer can run the demo from a documented script
No manual database changes are required
Environment resets reliably
No real data or credentials exist

24. Proposed Engineering Epics
Epic 1 — CommerceHub foundation
Create controlled upstream mirror
Establish version-pinning workflow
Create branded application configuration
Replace products and synthetic users
Create notices and attribution page
Disable demo-inappropriate training UI

Epic 2 — HVR lifecycle
Build readiness endpoint
Build prepare workflow
Build deterministic seed
Build scenario reset
Build full reset
Build cleanup verifier
Add environment TTL

Epic 3 — Scenario registry
Define scenario manifest schema
Implement registry storage
Implement activation policies
Implement state expiration
Implement scenario audit history
Implement provider resolver

Epic 4 — Companion services
Build orders service
Build membership service
Build refund service
Build file service
Build webhook service
Build integration service

Epic 5 — Oracle
Build truth-record service
Build ownership predicates
Build business-state predicates
Build control predicates
Protect Oracle interfaces
Implement PASS/FAIL/INDETERMINATE semantics

Epic 6 — Telemetry
Instrument services
Add correlation middleware
Add audit-event model
Configure OTel Collector
Add OpenSearch pipeline
Add Splunk pipeline
Add redaction

Epic 7 — Infrastructure
Create Docker Compose environment
Create EKS deployment
Create Terraform account composition
Add Cloudflare integration
Add Envoy configuration
Add Secrets Manager
Add lifecycle automation

Epic 8 — Platform integration
Integrate orchestration
Integrate approval
Integrate Evidence Fabric
Integrate Findings Service
Integrate CSE and HRE
Integrate Reporting
Integrate AGIE

25. Definition of Done for a Scenario
A scenario is complete only when all items are satisfied:
Unique scenario ID
Versioned manifest
Product owner
Security owner
Secure implementation
Vulnerable implementation
Mitigated or prevented state where applicable
Deterministic identities
Deterministic resources
Terminal marker
Ground-truth predicate
Evidence requirements
Audit events
Detection requirements
Positive test
Negative-control test
Cross-scope containment test
Reset procedure
Cleanup verification
Safety review
Documentation
Platform finding mapping

26. Product Success Metrics
26.1 Demo effectiveness
Time to first validation
Percentage of demos completed without manual recovery
Prospect understanding of “possible versus validated risk”
Evidence report completion rate
Follow-up design-partner interest

26.2 Engineering effectiveness
Scenario pass rate
Reset reliability
Evidence completeness
Environment deployment success
Cleanup success
Regression detection rate
False-positive rate
False-negative rate

26.3 Platform effectiveness
Recon recall
Planner success
Secure execution rate
Oracle agreement
Detection correlation
Finding quality
Revalidation success
Control-outcome accuracy
Initial target thresholds:

Environment deployment success       ≥ 95%
Scenario reset success                ≥ 99%
Evidence completeness                 ≥ 98%
Oracle determinate outcomes           ≥ 99%
Cross-tenant containment              100%
Production connectivity               0%
Real credential use                   0%
P0 scenario regression pass rate      100%
27. Risks and Mitigations
Heavy upstream modifications
Risk:
Difficult upgrades
Challenge breakage
Security patch delays
Mitigation:
Overlay strategy
Companion services
Patch categorization
Automated upstream compatibility suite

Demo recognized as Juice Shop
Risk:
Reduced perceived product originality
Mitigation:
Complete branding
Realistic catalog
Hayrok-owned workflows
Hide training mechanics
Focus demo on Hayrok’s governed validation and evidence
Preserve legal attribution without foregrounding it

Vulnerable environment exposure
Risk:
Abuse
Unexpected costs
External compromise
Mitigation:
Short-lived environments
Cloudflare Access
allowlists
no production trust
default-deny egress
kill switch
automatic teardown

Benchmark leakage
Risk:
Agents access answers or truth
Mitigation:
Separate Oracle network plane
workload identity
mTLS
OPA
no Oracle routes in agent tools

False benchmark confidence
Risk:
Passing CommerceHub does not imply universal security quality
Mitigation:
Use multiple target packs
Include secure negative controls
Use adaptive and unknown scenarios
Treat CommerceHub as one qualification source

28. MVP Release Criteria
CommerceHub MVP may launch when:
Controlled fork is pinned and reproducible.
Core storefront works.
Branding is complete.
Training mechanics are hidden in demo mode.
HVR readiness, prepare, activation, reset, and cleanup work.
At least six Hayrok-owned P0 scenarios exist.
Each P0 scenario has a secure negative control.
Oracle evaluation is independent.
Evidence is correlated end to end.
OpenSearch telemetry is available.
At least three Splunk detections are validated.
EKS deployment works in a sandbox account.
Cleanup reports CLEAN.
Platform can create a normalized finding.
A documented customer demo can be run without database manipulation.
License and attribution review is complete.
Security review confirms there is no path to production infrastructure.

29. Recommended MVP Demonstration Story
Objective
Validate the security of CommerceHub’s order-management workflow.
Demo flow
1. Hayrok discovers CommerceHub.
2. Recon identifies authenticated order APIs.
3. SRE recommends an API authorization scenario.
4. Planner creates a bounded cross-organization test.
5. Approval policy evaluates the action.
6. User A authenticates.
7. User A requests User B’s synthetic order.
8. CommerceHub returns the foreign order marker.
9. Splunk records an authorization anomaly.
10. Oracle confirms the order belongs to User B.
11. Evidence Fabric stores request, response, identity and ownership proof.
12. Hayrok creates a confirmed BOLA finding.
13. Control profile is changed to prevention.
14. Hayrok reruns the scenario.
15. Envoy/AGS/OPA blocks the request.
16. Finding shows successful remediation and control effectiveness.
This demonstration communicates the entire Hayrok value proposition:
Discovery
→ recommendation
→ governed planning
→ safe execution
→ independent validation
→ detection evaluation
→ evidence
→ finding
→ remediation
→ revalidation
30. Final Product Decision
Hayrok should build CommerceHub as:
A controlled Juice Shop-based application experience, surrounded by Hayrok-owned lifecycle, scenario, authorization, telemetry, truth, evidence, and enterprise companion services.
The core architectural rule is:
Use Juice Shop to accelerate the realistic web application.
Use Hayrok-owned services to create deterministic, governed,
evidence-rich validation behavior.
This approach provides:
Fast initial delivery
Realistic customer workflows
Mature web-security coverage
Upstream maintainability
Hayrok-owned differentiation
Secure negative controls
Deterministic engineering qualification
A clear path from demonstration to production-grade validation scenarios

https://hayrok.atlassian.net/wiki/spaces/ESA/pages/707887111/Hayrok+CommerceHub+Demo+powered+by+a+controlled+Juice+Shop+fork</Order>