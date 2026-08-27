
Here is the Markdown version of the page: Hayrok OWASP crAPI Validation Pack: API Security Benchmark and Testing Framework.
Hayrok OWASP crAPI Validation Pack
Product Definition, Engineering Specification, System Design, and Implementation Build Plan
Document status: Proposed
Product owner: Hayrok
Primary platform: Hayrok Validation Range
Target foundation: OWASP crAPI
Primary objectives: API discovery, API authorization validation, identity-aware testing, business-logic validation, attack-path validation, detection validation, evidence generation, and agent qualification
1. Executive Summary
The Hayrok OWASP crAPI Validation Pack is a controlled, isolated, and repeatable API-security target environment used to demonstrate and qualify Hayrok’s Governed Adversarial Exposure Validation capabilities.
OWASP crAPI, or “Completely Ridiculous API,” is an intentionally vulnerable, API-driven application built around a microservices-based vehicle-service platform. Its normal business workflows include:
User registration and authentication
User profiles
Vehicle registration and management
Mechanic discovery
Vehicle service requests
Workshop interactions
Product and accessory purchasing
Community posts and comments
crAPI is designed to teach and demonstrate API vulnerabilities, including weaknesses aligned with the OWASP API Security Top 10.
Hayrok will not treat crAPI as a customer-facing product or as the sole source of benchmark truth. Instead, crAPI will be wrapped as a controlled HVR target pack with:
Version-pinned deployment
Deterministic synthetic identities
Repeatable application state
Scenario mappings
Protected ground truth
Telemetry correlation
Evidence requirements
Environment reset
Cleanup verification
Secure negative-control APIs
Release qualification suites
The target pack will prove whether Hayrok can:

Discover an API-driven application.
Understand authentication and object relationships.
Build a valid multi-step plan.
Use the correct user and token context.
Test an approved authorization or business-logic condition.
Confirm real impact independently.
Capture defensible evidence.
Determine whether controls detected or prevented the activity.
Restore the environment to a verified clean state.

2. Product Vision
2.1 Vision statement
The crAPI Validation Pack will provide Hayrok with a realistic, stateful API environment for proving that Genesis can move beyond endpoint scanning and perform identity-aware, workflow-aware, evidence-driven validation.
2.2 Core product promise
Hayrok can discover related APIs, understand the identities and business objects behind them, safely exercise a bounded adversarial workflow, independently confirm whether authorization or business logic failed, and produce evidence showing exactly what occurred.
2.3 Positioning
The crAPI Validation Pack is:
A deterministic API-security benchmark
A multi-step planning environment
An identity-context validation environment
An API attack-graph qualification target
A detection and evidence validation target
A customer demonstration environment
It is not:
A production vehicle-service application
A customer data environment
A public capture-the-flag service
The database of record for Hayrok scenarios
A replacement for Hayrok-owned secure and vulnerable target APIs
A safe environment for unrestricted attacks

3. Strategic Role in the Hayrok Validation Range
3.1 API discovery benchmark
crAPI provides related APIs across multiple application domains. Hayrok can use it to evaluate whether Recon discovers:
API hosts
Service boundaries
Routes
HTTP methods
Authentication requirements
Request parameters
JSON schemas
Object identifiers
Relationships between APIs
Undocumented or less-visible routes
Business workflows

3.2 Stateful planning benchmark
Many crAPI scenarios require prerequisite actions such as:
Creating multiple users
Verifying or authenticating accounts
Creating vehicles
Creating service requests
Discovering another object identifier
Switching between identity contexts
Sequencing API requests correctly
This makes crAPI valuable for evaluating Planner DAG quality rather than only scanner coverage.

3.3 Authorization benchmark
crAPI should be used to validate:
Broken Object Level Authorization
Broken Function Level Authorization
Cross-user data access
Resource ownership failures
Administrative function exposure
Object identifier enumeration
Missing role enforcement
Excessive data exposure

3.4 Business-logic benchmark
crAPI can test whether Hayrok understands:
Intended application workflow
Required state transitions
Repeated operations
Resource limits
Object ownership
Purchase and service-request logic
Cross-service dependencies
Abuse of legitimate application capabilities

3.5 API graph and AGIE benchmark
The target allows Hayrok to model:
User
├── owns Vehicle
├── creates Service Request
├── submits Community Post
├── purchases Product
└── authenticates through Identity API

This graph can be compared with protected expected relationships.
3.6 Customer demonstration
crAPI supports a strong API-security narrative:
Hayrok discovered the authenticated API, identified a vehicle object owned by another user, safely tested the ownership boundary, proved unauthorized data access, correlated the request with gateway and application telemetry, and produced evidence suitable for remediation and revalidation.
4. Target Users
4.1 External personas
CISO
Needs to understand:
Whether reported API risk is real
Whether customer or sensitive objects are exposed
Whether controls detect or prevent abuse
Whether evidence supports risk decisions

Application Security Engineer
Needs:
Exact route and HTTP method
Authentication context
Object ownership proof
Request and response evidence
Reproduction steps
Remediation guidance
Revalidation outcome

API Security Engineer
Needs:
API inventory
Authentication classification
Schema and parameter discovery
Object relationship mapping
Authorization findings
Business-flow analysis

SOC and Detection Engineer
Needs:
Request timeline
Token identity
Source and destination services
Alert outcome
Detection latency
Missed detection conditions

Auditor or GRC stakeholder
Needs:
Approved scope
Test policy
Evidence chain
Result lineage
Control mapping
Immutable execution history

4.2 Internal personas
Hayrok security scenario engineers
Recon engineers
Planner and agent engineers
HVR engineers
Platform engineers
Detection-content engineers
Quality engineering
Sales engineering
Product management

5. Product Principles
5.1 Understand normal behavior first
Before running adversarial workflows, Hayrok must understand the intended application workflow.
OWASP’s crAPI happy-path documentation describes a normal sequence of registration, authentication, profile access, and interaction with available APIs.
The target adapter must provide a supported normal workflow for:
Account registration
Login
Vehicle creation
Mechanic discovery
Service-request creation
Product purchase
Community participation

5.2 Identity context is first-class
Every action must identify:
Authenticated user
Token fingerprint
Token subject
Active role
Owned objects
Target object owner
Current application state

5.3 Deterministic fixtures
Every benchmark run must use known synthetic identities and objects.
5.4 Independent ground truth
Execution agents must not determine whether their own actions succeeded.
5.5 Synthetic data only
The environment must contain no real:
Users
Vehicles
Credentials
Email addresses
Payment data
Customer records
External integration secrets

5.6 Version pinning
Hayrok must qualify an exact crAPI source revision or image digest.
5.7 Controlled scope
Every run must define:
Approved API routes
Approved identities
Approved objects
Allowed actions
Prohibited actions
Maximum duration
Expected terminal condition

5.8 Secure negative controls
Because crAPI is primarily vulnerable by design, Hayrok must add equivalent secure APIs to measure false positives and control outcomes.
6. Product Scope
6.1 MVP scope
The MVP includes:
Version-pinned crAPI deployment
Web application
Identity service
Community service
Workshop service
Supporting data stores
Mail or verification support where required
Private Envoy ingress
HVR crAPI Adapter
Deterministic user provisioning
Deterministic vehicle provisioning
Deterministic service-request provisioning
Scenario registry
Ground Truth Oracle adapter
OpenTelemetry correlation
OpenSearch forwarding
Splunk forwarding
Reset and cleanup workflow
Initial API scenario suite
Secure companion API
Docker Compose development profile
EKS qualification profile
Hayrok platform integration
The official crAPI project supports containerized deployment and presents a modern microservices application intended for API-security education and testing.

6.2 Post-MVP scope
GraphQL companion APIs
gRPC service-discovery scenarios
API gateway control profiles
Auth0 enterprise identity profile
AGS and OPA enforcement
Multi-organization API model
API version drift
Shadow API scenarios
Zombie API scenarios
Automated OpenAPI reconciliation
API token audience scenarios
Advanced rate-limit scenarios
Cross-region API environments
Adaptive scenario generation
Customer-specific API demo themes

6.3 Out of scope
Real vehicle-service operations
Real payment processing
Production deployment
Production integrations
Public unrestricted access
Denial-of-service beyond bounded thresholds
Real identity-provider credentials
Direct use of crAPI challenge answers as benchmark truth

7. Application Model
7.1 Business domain
crAPI models a B2C platform where vehicle owners can manage vehicles, find mechanics, submit service requests, buy accessories, and participate in a community.
7.2 Core domain objects
User
Vehicle
Mechanic
Service Request
Workshop Report
Product
Cart
Order
Community Post
Comment
Authentication Token

7.3 Expected object relationships
User
├── OWNS → Vehicle
├── CREATES → Service Request
├── CREATES → Community Post
├── CREATES → Comment
├── OWNS → Cart
└── PLACES → Order

Mechanic
└── HANDLES → Service Request

Service Request
├── REFERENCES → Vehicle
├── REQUESTED_BY → User
└── ASSIGNED_TO → Mechanic

Order
├── OWNED_BY → User
└── CONTAINS → Product

7.4 Service model
The target pack should treat crAPI as several logical service domains:
Web Frontend
Identity API
Community API
Workshop API
Shop or Product API
Mail or Verification Service
PostgreSQL
MongoDB

Exact service names may vary by approved crAPI release. The adapter must normalize them into stable Hayrok service identities.
8. Normal User Experience
8.1 Registration
A synthetic user:
Opens the application.
Registers with a range-specific email.
Completes any required verification.
Receives a valid account state.

8.2 Authentication
The user:
Submits valid credentials.
Receives an access token.
Uses the token for authenticated API calls.
Accesses their profile.

8.3 Vehicle workflow
The user:
Registers a vehicle.
Retrieves vehicle information.
Uses the vehicle in service workflows.

8.4 Workshop workflow
The user:
Searches for mechanics.
Selects a mechanic.
Creates a service request.
Reviews service information.

8.5 Shopping workflow
The user:
Browses accessories.
Adds a product to a cart.
Completes a synthetic purchase.
Reviews order history.

8.6 Community workflow
The user:
Reads posts.
Creates a post.
Adds comments.
Retrieves community content.
These workflows become prerequisite graphs for Hayrok scenarios.

9. HVR Target-Pack Design
9.1 Target-pack manifest
apiVersion: hvr.hayrok.io/v1
kind: TargetPack

metadata:
  targetPackId: owasp-crapi-v1
  name: OWASP crAPI
  version: 1.0.0

classification:
  assetTypes:
    - web_application
    - rest_api
    - microservice
    - identity_service

  objectives:
    - api_security
    - identity_security
    - internet_exposure
    - detection_coverage
    - business_impact

  validationModes:
    - exposure_validation
    - attack_path_simulation
    - runtime_presence_validation
    - control_validation
    - detection_validation

deployment:
  profiles:
    - local
    - qualification
    - customer_demo

lifecycle:
  adapter: crapi-adapter-v1
  oracle: crapi-oracle-v1
  resetRequired: true
9.2 Target-pack ownership
Hayrok owns:
Deployment lifecycle
Synthetic fixtures
Scenario mappings
Evidence contracts
Oracle predicates
Secure companion APIs
Telemetry normalization
OWASP crAPI owns:
Upstream vulnerable application
Native APIs
Native application workflow
Native challenge implementations

10. System Architecture
                         HAYROK PLATFORM
┌─────────────────────────────────────────────────────────────┐
│ Hive                                                        │
│ Validation Orchestration                                    │
│ Scenario Recommendation Engine                              │
│ Planner                                                     │
│ Approval Service                                            │
│ Execution and Validation Agents                             │
│ Evidence Fabric                                             │
│ CSE • HRE • Findings • Reporting                            │
│ Asset Graph • AGIE                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                   HAYROK VALIDATION RANGE
┌─────────────────────────────────────────────────────────────┐
│ Environment Provisioner                                     │
│ Range Run Manager                                           │
│ crAPI Adapter                                               │
│ Scenario Registry                                           │
│ Ground Truth Oracle                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                  ISOLATED crAPI ENVIRONMENT
┌─────────────────────────────────────────────────────────────┐
│ Envoy Gateway                                               │
│                                                             │
│ crAPI Web                                                   │
│ Identity API                                                │
│ Community API                                               │
│ Workshop API                                                │
│ Shop/Product API                                            │
│ Mail/Verification Service                                   │
│ PostgreSQL                                                  │
│ MongoDB                                                     │
│                                                             │
│ Secure Companion API                                        │
│ Telemetry Forwarder                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
              OpenSearch • Splunk • Evidence Fabric

11. Service Boundaries
11.1 crAPI upstream services
Responsibilities:
Native user workflows
Native vehicle workflows
Native workshop workflows
Native product workflows
Native community workflows
Native vulnerable behavior
Must not own:
HVR lifecycle
Ground truth
Hayrok approvals
Hayrok scenario policy
Benchmark scoring
Hayrok evidence normalization

11.2 crAPI Adapter
Responsibilities:
Version verification
Environment readiness
User creation
Vehicle creation
Service-request preparation
Token acquisition
Fixture mapping
Reset
Cleanup
Telemetry readiness

11.3 Scenario Registry
Responsibilities:
Hayrok scenario ID
External crAPI mapping
Required workflow
Required identities
Required objects
Allowed actions
Expected evidence
Oracle predicate
Safety restrictions
Cleanup procedure

11.4 Ground Truth Oracle
Responsibilities:
Resolve real object ownership
Resolve user identities
Check state before and after execution
Confirm target markers
Confirm control outcomes
Return benchmark result

11.5 Secure Companion API
Responsibilities:
Secure equivalents to selected crAPI routes
Negative-control responses
Prevention profiles
Hayrok-owned deterministic scenarios
Explicit organization-aware authorization

12. crAPI Adapter Specification
12.1 Required operations
GET  /internal/hvr/crapi/version
GET  /internal/hvr/crapi/readiness
GET  /internal/hvr/crapi/scenarios

POST /internal/hvr/crapi/prepare
POST /internal/hvr/crapi/users
POST /internal/hvr/crapi/vehicles
POST /internal/hvr/crapi/service-requests

GET  /internal/hvr/crapi/fixtures/{rangeRunId}
POST /internal/hvr/crapi/reset
POST /internal/hvr/crapi/destroy

GET  /internal/hvr/crapi/cleanup-status

12.2 Readiness response
{
  "ready": true,
  "targetPackId": "owasp-crapi-v1",
  "upstreamRevision": "approved-revision",
  "services": {
    "web": "ready",
    "identity": "ready",
    "community": "ready",
    "workshop": "ready",
    "database": "ready",
    "mail": "ready"
  },
  "telemetryReady": true,
  "oracleReady": true
}
12.3 Prepare request
{
  "rangeRunId": "rr_123",
  "scenarioSuite": "api-authorization-p0",
  "expiresAt": "2026-08-05T02:00:00Z"
}
12.4 Prepare behavior
The adapter must:
Validate the environment.
Reset old state.
Create deterministic users.
Complete required account verification.
Authenticate identities.
Create deterministic vehicles.
Create service requests and community objects.
Record actual generated IDs.
Verify telemetry.
Store protected truth mappings.
Return approved entry points.

13. Deterministic Fixture Model
13.1 Synthetic identities
identities:
  user_a:
    username: alice-range
    email: alice-
<range_run_id>@example.test
role: customer
user_b:
username: bob-range
email: bob-</range_run_id>
@example.test
role: customer
mechanic_a:
username: mechanic-range
email: mechanic-
<range_run_id>@example.test
role: mechanic
administrator:
username: admin-range
email: admin-</range_run_id>
@example.test
role: administrator
## 13.2 Synthetic objects
```yaml
objects:
  user_a_vehicle:
    marker: HVR-VEHICLE-A

  user_b_vehicle:
    marker: HVR-VEHICLE-B

  user_a_service_request:
    marker: HVR-SERVICE-A

  user_b_service_request:
    marker: HVR-SERVICE-B

  user_b_post:
    marker: HVR-POST-B

  user_b_order:
    marker: HVR-ORDER-B
13.3 Protected truth record
{
  "rangeRunId": "rr_123",
  "users": {
    "userA": {
      "externalId": "crapi-user-173",
      "email": "alice-rr_123@example.test"
    },
    "userB": {
      "externalId": "crapi-user-174",
      "email": "bob-rr_123@example.test"
    }
  },
  "objects": {
    "userBVehicle": {
      "externalId": "vehicle-489",
      "ownerExternalId": "crapi-user-174",
      "marker": "HVR-VEHICLE-B"
    }
  }
}
This record must be inaccessible to Recon, Planner, Execution, and Validation agents.
14. Initial Scenario Catalog
14.1 Object authorization
Scenario ID
Scenario
CRAPI-BOLA-001
User A retrieves User B vehicle data
CRAPI-BOLA-002
User A retrieves User B service request
CRAPI-BOLA-003
User A modifies User B object
CRAPI-BOLA-004
User A accesses User B order or purchase data
14.2 Function authorization
Scenario ID
Scenario
CRAPI-BFLA-001
Customer invokes administrative API
CRAPI-BFLA-002
Customer accesses mechanic-only function
CRAPI-BFLA-003
Low-privilege user changes protected state
14.3 Authentication and tokens
Scenario ID
Scenario
CRAPI-AUTH-001
Authentication workflow weakness
CRAPI-AUTH-002
Token validation or token-context weakness
CRAPI-AUTH-003
Account recovery workflow abuse
14.4 Data exposure
Scenario ID
Scenario
CRAPI-DATA-001
API returns excessive user attributes
CRAPI-DATA-002
API discloses internal object metadata
CRAPI-DATA-003
Search or list endpoint exposes foreign records
14.5 Business-flow abuse
Scenario ID
Scenario
CRAPI-BIZ-001
Service-request workflow bypass
CRAPI-BIZ-002
Repeated purchase or operation
CRAPI-BIZ-003
Invalid object-state transition
CRAPI-BIZ-004
Abuse of trusted mechanic workflow
14.6 Resource consumption
Scenario ID
Scenario
CRAPI-RATE-001
Missing endpoint rate control
CRAPI-RATE-002
Bounded object enumeration exceeds threshold
14.7 Secure controls
Each positive scenario requires:
Equivalent secure endpoint
Expected denied response
Owned-object negative control
Invalid-object negative control
Cross-user containment test
Reset test

15. Example BOLA Scenario Contract
apiVersion: hvr.hayrok.io/v1
kind: ValidationScenario

metadata:
  scenarioId: CRAPI-BOLA-001
  name: Access another user’s vehicle information
  version: 1.0.0
  owner: api-security

classification:
  objective: api_security

  validationModes:
    - exposure_validation
    - attack_path_simulation
    - runtime_presence_validation

  cwe:
    - CWE-639

target:
  targetPackId: owasp-crapi-v1
  assetType: rest_api

setup:
  identities:
    attacker: user_a
    victim: user_b

  objects:
    victimObject: user_b_vehicle

authorization:
  permittedActions:
    - authenticate_as_user_a
    - enumerate_approved_routes
    - retrieve_owned_vehicle
    - request_known_foreign_vehicle
    - inspect_response

  prohibitedActions:
    - access_oracle
    - query_database_directly
    - modify_unrelated_objects
    - denial_of_service
    - target_external_systems

expected:
  validation:
    requiredFacts:
      - authenticated_as_user_a
      - requested_user_b_vehicle
      - response_contains_user_b_vehicle_marker
      - ownership_record_confirms_user_b

  evidence:
    required:
      - authentication_context
      - request
      - response
      - object_identifier
      - ownership_record
      - gateway_event
      - application_event

negativeConditions:
  - user_a_owned_vehicle_access_must_not_create_finding
  - denied_response_must_not_be_classified_as_confirmed
  - missing_object_must_not_be_classified_as_bola

cleanup:
  procedure: reset-crapi-bola-fixtures
16. Stateful Planning Requirements
16.1 Example planning sequence
Create User A.
Verify User A.
Authenticate User A.
Create Vehicle A.
Create User B.
Verify User B.
Authenticate User B.
Create Vehicle B.
Record Vehicle B identifier in protected setup state.
Return to User A token context.
Request Vehicle B through approved route.
Inspect response.
Capture evidence.
Stop after terminal predicate.

16.2 Planner requirements
The Planner must:
Identify all prerequisites
Preserve identity boundaries
Track which token belongs to which user
Use allowed routes only
Select bounded actions
Avoid direct database manipulation
Avoid Oracle access
Stop after the terminal condition
Include cleanup expectations

16.3 Planner benchmark metrics
Prerequisite recall
Identity-switch accuracy
Token-context accuracy
Object-context accuracy
Action-order validity
Unsupported-action rate
Unnecessary-action count
Terminal-objective success
Scope compliance

17. Recon and API Discovery Requirements
17.1 Recon outputs
The Recon Dossier should include:
API hosts
Service domains
Route inventory
HTTP methods
Parameters
Content types
Authentication requirements
Observed object identifiers
Response schemas
Business-object relationships
Candidate administrative APIs
Candidate enumeration endpoints

17.2 API inventory model
{
  "service": "workshop-api",
  "route": "/workshop/api/vehicles/{id}",
  "method": "GET",
  "authentication": "bearer",
  "pathParameters": ["id"],
  "objectType": "vehicle",
  "ownershipRelevant": true,
  "observedIdentifiers": ["vehicle-489"]
}
17.3 Discovery benchmark metrics
Endpoint recall
Method accuracy
Parameter accuracy
Authentication classification
Service-boundary accuracy
Object-type accuracy
Ownership-relevance accuracy
Undocumented route discovery
Duplicate endpoint rate
False endpoint rate

18. Asset Graph and AGIE Model
18.1 Nodes
User
Token
Vehicle
Mechanic
Service Request
Product
Order
Community Post
API Route
Microservice
Database

18.2 Edges
AUTHENTICATES_TO
RECEIVES_TOKEN
OWNS
CAN_READ
CAN_MODIFY
CREATES
ASSIGNED_TO
SERVED_BY
STORED_IN
EXPOSED_BY
TRUSTS_TOKEN
CAN_INVOKE
REFERENCES

18.3 Example authorization attack path
User A
→ authenticates to Identity API
→ receives User A token
→ calls Vehicle API
→ supplies Vehicle B identifier
→ ownership check is missing
→ Vehicle B data is returned

18.4 AGIE benchmark
Measure:
Relevant node recall
Edge recall
Unsupported-edge rate
Path recall
Path executability
Terminal-impact accuracy
Evidence attached to each edge

19. Secure Companion API
19.1 Purpose
crAPI alone is insufficient for measuring false positives because it is intentionally vulnerable.
The secure companion API provides similar routes with correct controls.
19.2 Routing model
Envoy
├── /crapi/*       → OWASP crAPI
└── /secure-api/*  → Hayrok Secure API

19.3 Secure BOLA counterpart
GET /secure-api/vehicles/{vehicleId}

Secure behavior:
Resolve identity from trusted token
Query by vehicleId and authenticated owner
Return 404 or 403 for foreign object
Emit authorization-denied event
Never disclose ownership information through error differences

19.4 Secure BFLA counterpart
Administrative APIs must require:
Verified role
Exact action
Resource context
Environment policy
Immediate authorization

19.5 Secure rate-control counterpart
The secure route must:
Enforce bounded request rate
Emit rate-limit telemetry
Return deterministic control outcome
Avoid destabilizing the environment

20. Identity and Authentication Design
20.1 Native crAPI profile
Use native crAPI authentication for:
Native authentication workflows
Native token handling
Object-authorization scenarios
Canonical benchmark runs

20.2 Enterprise control profile
Use:
Auth0
→ Envoy
→ AGS
→ OPA
→ Selected secure companion APIs

Purpose:
Enterprise SSO demonstration
Organization context
Gateway authorization
Session revocation
Role enforcement
Comparison against native vulnerable behavior

20.3 Token evidence
Do not store complete tokens.
Store:
{
  "tokenFingerprint": "sha256:...",
  "subject": "user-a",
  "issuer": "crapi-identity",
  "audience": "crapi-api",
  "issuedAt": "timestamp",
  "expiresAt": "timestamp"
}
21. Gateway Design
21.1 Envoy responsibilities
Route APIs
Generate request IDs
Add range-run metadata
Capture access events
Apply rate-limit profiles
Separate public and private routes
Prevent access to Oracle interfaces
Support external authorization profile

21.2 Route model
/                        → crAPI web
/identity/*              → Identity API
/community/*             → Community API
/workshop/*              → Workshop API
/shop/*                  → Product API
/secure-api/*            → Secure Companion API
/internal/hvr/*          → crAPI Adapter, private
/internal/oracle/*       → Oracle, private

21.3 Correlation headers
Internal trusted headers:
x-hvr-range-run-id
x-hvr-scenario-id
x-hvr-environment-id
x-request-id
traceparent

The gateway must strip client-supplied versions before adding trusted values.
22. Ground Truth Oracle
22.1 Oracle data sources
Protected fixture mappings
crAPI application APIs where safe
Database read models
Application events
Gateway events
Synthetic object markers
State before and after execution
Secure companion API state
Detection events

22.2 Oracle interface
GET /internal/oracle/crapi/runs/{rangeRunId}/scenarios/{scenarioId}

Response:
{
  "scenarioId": "CRAPI-BOLA-001",
  "status": "PASS",
  "facts": {
    "attackerUserId": "crapi-user-173",
    "victimUserId": "crapi-user-174",
    "objectId": "vehicle-489",
    "objectOwnerId": "crapi-user-174",
    "foreignObjectReturned": true,
    "expectedMarkerObserved": true
  },
  "evidenceReferences": [
    "request:req-123",
    "response:resp-123",
    "ownership:truth-123"
  ]
}
22.3 Oracle outcomes
PASS
FAIL
INDETERMINATE
CONTROL_BLOCKED
PARTIALLY_COMPLETED
NOT_APPLICABLE

22.4 Oracle access controls
Private network only
Workload identity
mTLS
OPA authorization
Explicit caller allowlist
Complete audit logging
No agent tool registration

23. Telemetry and Evidence
23.1 Required telemetry sources
Cloudflare events for demo mode
ALB logs
Envoy access logs
Identity service events
Community service events
Workshop service events
Product service events
Database audit events where supported
Kubernetes audit logs
Container logs
OpenTelemetry traces
Splunk alerts
OPA decisions
Approval events

23.2 Event envelope
{
  "rangeRunId": "rr_123",
  "scenarioId": "CRAPI-BOLA-001",
  "environmentId": "env_123",
  "requestId": "req_123",
  "traceId": "trace_123",
  "service": "workshop-api",
  "actorId": "user-a",
  "action": "vehicle.read",
  "resourceId": "vehicle-b",
  "resourceOwnerId": "user-b",
  "outcome": "foreign_object_returned"
}
23.3 Evidence requirements
A confirmed finding should include:
Attacker identity
Victim identity
Token fingerprint
API route
HTTP method
Request
Response
Object ID
Ownership record
Relevant response marker
Application event
Gateway event
Oracle result
Tool provenance
Scenario version
Target-pack version
Timestamp
Evidence hashes

23.4 Redaction
Redact:
Passwords
Complete tokens
Session cookies
Sensitive headers
Complete synthetic secrets

24. Detection Validation
24.1 Detection scenarios
Validate detections for:
Cross-user object access
Repeated object enumeration
Administrative API invocation by customer
Excessive API requests
Unusual token use
Object modification by non-owner
High-volume list access
Identity switching
Service-request abuse

24.2 Detection outcome
{
  "scenarioId": "CRAPI-BOLA-001",
  "executionOutcome": "CONFIRMED",
  "gatewayObserved": true,
  "applicationObserved": true,
  "splunkAlertObserved": true,
  "detectionLatencySeconds": 28,
  "controlOutcome": "DETECTED_NOT_BLOCKED"
}
24.3 Control profiles
Vulnerable
Action succeeds.
Expected: CONFIRMED
Detection-only
Action succeeds and alert fires.
Expected: CONFIRMED + DETECTED
Rate-limited
Enumeration exceeds approved threshold and is throttled.
Expected: CONTROL_BLOCKED
Gateway authorization
AGS and OPA reject an unauthorized function.
Expected: PREVENTED
Application authorization
Secure API rejects a foreign object.
Expected: NOT_EXPLOITABLE
Drifted
Authorization policy is weakened and the previously blocked path succeeds.
Expected: CONTROL_DRIFT_CONFIRMED
25. Deployment Design
25.1 Local developer profile
Docker Compose
├── Envoy
├── crAPI services
├── PostgreSQL
├── MongoDB
├── Mail service
├── crAPI Adapter
├── Oracle Adapter
├── Secure Companion API
├── OTel Collector
└── OpenSearch

Use for:
Adapter development
Scenario mapping
Recon testing
Planner testing
Evidence-contract testing
Reset development

25.2 EKS qualification profile
AWS HVR Sandbox Account
└── EKS
    ├── crapi namespace
    ├── hvr-management namespace
    └── telemetry namespace

Managed dependencies may include:
RDS PostgreSQL where compatible
Managed MongoDB or isolated MongoDB workload
OpenSearch
S3 evidence staging
Splunk forwarder or HEC
Secrets Manager

25.3 Customer demo profile
Authorized Demo User
→ Cloudflare Access
→ Cloudflare WAF
→ ALB
→ Envoy
→ crAPI Web and APIs

Requirements:
Short-lived environment
Named users
Rate limits
No public management routes
No Oracle exposure
Automatic expiration
Automatic cleanup

26. Security Requirements
26.1 Environment isolation
Dedicated HVR account
Dedicated namespace or disposable cluster
No production peering
No production IAM trust
No customer data
No real credentials
No unrestricted outbound access

26.2 Network controls
Default-deny network policy
Explicit service communication
Private management routes
Restricted database access
Egress allowlist
Demo access allowlist

26.3 Credential controls
Synthetic credentials
Range-specific passwords
Short-lived tokens
Automatic credential revocation
No credentials in evidence
No credentials reused between runs

26.4 Scenario controls
Every scenario activation requires:
Approved scenario
Approved environment
Range run
Expiration
Safety profile
Audit event
Approval where required

26.5 Denial-of-service restrictions
Resource-consumption scenarios must use:
Maximum request count
Maximum execution duration
Dedicated environment
Kill switch
No unbounded concurrency

27. Reset and Cleanup
27.1 Reset procedure
Disable active scenarios.
Revoke synthetic tokens.
Delete run-specific users.
Delete vehicles.
Delete service requests.
Delete posts and comments.
Delete orders and cart state.
Clear mail verification state.
Clear caches.
Recreate deterministic baseline.
Verify secure companion APIs.
Verify telemetry.
Run baseline smoke tests.

27.2 Cleanup verification
Check:
No run-specific users remain
No active tokens remain
No run-specific objects remain
No active public route remains
No unexpected database rows remain
No scenario state remains active
No temporary credentials remain
No telemetry outage exists

27.3 Cleanup states
CLEAN
RESIDUAL_USER
RESIDUAL_OBJECT
ACTIVE_TOKEN
ACTIVE_PUBLIC_ROUTE
SCENARIO_STATE_ACTIVE
TELEMETRY_UNAVAILABLE
VERIFICATION_INDETERMINATE

Only CLEAN permits environment reuse.
28. Testing Strategy
28.1 Unit tests
Fixture generation
Scenario mapping
Token-context handling
Reset logic
Ownership predicates
Evidence redaction
Correlation middleware

28.2 Contract tests
Adapter API
Oracle API
Scenario manifest
Evidence envelope
Telemetry envelope
Graph node and edge model
Cleanup result

28.3 Scenario tests
Each scenario requires:
Happy-path test
Vulnerable-path test
Secure counterpart test
Negative-control test
Wrong-user test
Wrong-object test
Reset test
Oracle test
Detection test where applicable

28.4 End-to-end test
Deploy
readiness
prepare
create User A and User B
seed objects
authenticate
execute scenario
validate
collect evidence
query Oracle
reset
verify CLEAN

28.5 Upstream compatibility tests
For every approved crAPI update:
Web application loads
Registration works
Authentication works
Vehicle creation works
Mechanic search works
Service-request creation works
Community workflow works
Product workflow works
Selected scenario mappings remain valid
Reset remains deterministic
Telemetry remains complete

29. Performance and Reliability Targets
29.1 MVP targets
Readiness response: under 5 seconds
User creation: under 15 seconds
Fixture preparation: under 2 minutes
Scenario execution: scenario-specific
Scenario reset: under 2 minutes
Full environment reset: under 10 minutes
Telemetry correlation completeness: at least 99%
Oracle determinate outcomes: at least 99%
Cleanup result required for every run

29.2 Capacity
Initial target:
5 concurrent qualification runs across isolated environments
10 concurrent demo users
2–4 synthetic identities per scenario
24-hour maximum environment life
Bounded rate scenarios only

30. Implementation Build Plan
Phase 0 — Product and architecture
Duration: One sprint
Deliverables:
Target-pack strategy
Architecture
Threat model
Scenario contract
Oracle contract
Fixture model
Evidence contract
Version-pinning policy
Licensing and attribution review
Exit criteria:
Architecture approved
P0 scenarios approved
Isolation model approved

Phase 1 — Base crAPI deployment
Duration: One sprint
Build:
Pinned crAPI deployment
Docker Compose developer environment
Private Envoy routing
Health checks
Service inventory
Basic telemetry
Local reset script
Acceptance:
Normal happy-path workflows function
Services are reachable only through approved routes
Version is recorded

Phase 2 — crAPI Adapter
Duration: Two sprints
Build:
Readiness
Version verification
User provisioning
Account verification
Authentication
Vehicle provisioning
Service-request provisioning
Fixture mapping
Reset
Cleanup status
Acceptance:
A deterministic environment can be prepared through API
User and object IDs are recorded correctly
Reset returns the environment to baseline

Phase 3 — Ground Truth Oracle
Duration: Two sprints
Build:
Truth record store
Ownership resolver
Object-state resolver
Terminal-marker evaluator
Oracle API
Workload identity
OPA protection
Audit logging
Acceptance:
Oracle independently verifies BOLA result
Execution agents cannot reach Oracle
PASS, FAIL, and INDETERMINATE are supported

Phase 4 — P0 authorization scenarios
Duration: Three sprints
Implement:
Vehicle BOLA
Service-request BOLA
Community-object BOLA
Administrative BFLA
Mechanic-function BFLA
Excessive data exposure
Acceptance:

Each scenario has positive and negative tests
Each produces complete evidence
Each resets deterministically

Phase 5 — Secure Companion API
Duration: Two sprints
Build:
Secure vehicle endpoint
Secure service-request endpoint
Secure admin endpoint
Secure excessive-data endpoint
Rate-limited endpoint
Structured authorization events
Acceptance:
Secure routes do not produce false confirmed findings
Ownership enforcement is deterministic
Prevention results are observable

Phase 6 — Telemetry and detection
Duration: Two sprints
Build:
Envoy access logs
Service event normalization
OTel traces
OpenSearch pipeline
Splunk pipeline
Detection latency evaluator
Evidence redaction
Acceptance:
End-to-end run timeline can be reconstructed
At least three detections are validated
Evidence contains no raw credentials

Phase 7 — EKS qualification environment
Duration: Two sprints
Build:
Terraform environment
EKS deployment
network policies
managed ingress
TTL controller
automatic cleanup
residual-state verifier
Acceptance:
Environment deploys into a clean sandbox
Qualification suite runs
Environment returns CLEAN

Phase 8 — Hayrok platform integration
Duration: Three sprints
Integrate:
Asset Discovery
Recon
SRE
Planner
Approval Service
Execution Agent
Validation Agent
Evidence Fabric
CSE
HRE
Findings Service
AGIE
Reporting
Acceptance:
A user launches crAPI validation from Hive
A normalized finding is created
Evidence is accessible
A secure revalidation closes or updates the finding

Phase 9 — Control profiles
Duration: Two sprints
Build:
Detection-only profile
Rate-limit prevention
AGS and OPA profile
Application secure profile
Drift profile
Splunk detection rules
Acceptance:
Same scenario produces correct outcomes across vulnerable, detected, mitigated, prevented, and drifted states

Phase 10 — Demo and launch readiness
Duration: One sprint
Build:
Customer demo script
Product tour
Sample report
Reset runbook
Failure-recovery runbook
Attribution page
Sales-engineering guide
Acceptance:
Demo runs without direct database changes
No real data is used
Environment cleanup is automatic

31. Engineering Epics
Epic 1 — crAPI target foundation
Pin approved revision
Build deployment profile
Add Envoy
Add health checks
Document service boundaries
Build compatibility suite

Epic 2 — Identity and fixtures
Create deterministic users
Automate account verification
Acquire tokens
Seed vehicles
Seed service requests
Seed community objects
Seed orders

Epic 3 — HVR Adapter
Build prepare
Build readiness
Build reset
Build destroy
Build cleanup status
Add audit events

Epic 4 — Scenario Registry
Define manifest schema
Map external routes
Define prerequisites
Define expected evidence
Define cleanup
Define safety constraints

Epic 5 — Ground Truth Oracle
Build protected fixture store
Build ownership predicates
Build state predicates
Build control predicates
Protect interfaces

Epic 6 — Secure Companion API
Build secure object access
Build secure admin access
Build rate control
Build data-minimization responses
Build structured authorization logging

Epic 7 — Telemetry and evidence
Add correlation
Add OTel
Add OpenSearch
Add Splunk
Add redaction
Add detection evaluation

Epic 8 — Infrastructure
Docker Compose
EKS
Terraform
Cloudflare demo ingress
network policy
environment TTL
cleanup verifier

Epic 9 — Platform integration
Recon
SRE
Planner
Approval
Execution
Validation
Evidence
Findings
CSE
HRE
AGIE
Reporting

32. Definition of Done for a crAPI Scenario
A scenario is complete only when it has:
Unique Hayrok scenario ID
External crAPI route mapping
Version
Owner
Objective
Required identities
Required object fixtures
Happy-path prerequisite
Allowed actions
Prohibited actions
Terminal predicate
Oracle implementation
Evidence requirements
Telemetry requirements
Positive test
Negative-control test
Identity-context test
Reset procedure
Cleanup verification
Safety review
Documentation
Finding mapping

33. Product Success Metrics
33.1 Discovery metrics
API endpoint recall
HTTP method accuracy
Parameter accuracy
Authentication classification accuracy
Service-boundary accuracy
Object-relationship accuracy

33.2 Planning metrics
Prerequisite recall
Identity-context accuracy
Valid DAG rate
Correct tool selection
Scope adherence
Unsupported-action rate

33.3 Validation metrics
True-positive rate
False-positive rate
False-negative rate
Oracle agreement
Evidence completeness
Repeatability
Correct vulnerability classification

33.4 Operational metrics
Environment deployment success       ≥ 95%
Fixture preparation success           ≥ 98%
Scenario reset success                ≥ 99%
Cleanup verification                  100%
Oracle determinate outcome            ≥ 99%
Evidence completeness                 ≥ 98%
Cross-user negative controls          100%
Real customer data usage              0%
Production connectivity               0%

34. Risks and Mitigations
Upstream changes break scenario mappings
Mitigation:
Pin revision
Maintain compatibility tests
Require approval before upgrade
Normalize external routes through adapter

crAPI exposes challenge behavior that leaks benchmark truth
Mitigation:
Do not expose challenge documentation to agents
Protect Oracle data
Keep benchmark mappings in control plane
Limit agent tools

Incomplete reset contaminates later runs
Mitigation:
Per-run identities
Per-run markers
Full cleanup verification
Quarantine environment on indeterminate cleanup

False confidence from vulnerable-only testing
Mitigation:
Secure companion APIs
Negative controls
Other target packs
Unknown scenario suites
Current and deterministic benchmark modes

Token context confusion
Mitigation:
Token fingerprints
Explicit identity slots
Planner context checks
Evidence of every identity switch

Resource-consumption scenario destabilizes environment
Mitigation:
Bounded request limits
Dedicated environment
Timeout
kill switch
no unbounded concurrency

35. MVP Release Criteria
The crAPI Validation Pack may launch when:
A crAPI revision is pinned.
The normal application workflow is documented.
Docker Compose deployment is reproducible.
The Adapter can create two deterministic users.
The Adapter can create vehicles and service objects.
Tokens are correctly associated with identities.
At least six P0 scenarios are implemented.
Every P0 scenario has a negative control.
At least four secure companion routes exist.
Oracle evaluation is independent.
Evidence is correlated end to end.
OpenSearch telemetry is operational.
At least three Splunk detections are validated.
EKS qualification deployment succeeds.
Reset succeeds consistently.
Cleanup reports CLEAN.
Hive can launch a crAPI validation.
Findings Service receives a normalized confirmed result.
No agent can access Oracle interfaces.
No real customer data or credentials are present.

36. Recommended MVP Demonstration
Objective
Validate object-level authorization across the crAPI vehicle workflow.
Demonstration sequence
HVR deploys an isolated crAPI environment.
Adapter creates User A and User B.
Adapter creates Vehicle A and Vehicle B.
Recon discovers the authenticated vehicle API.
Asset Graph maps users, tokens, and vehicle objects.
SRE recommends BOLA validation.
Planner creates a bounded two-user workflow.
Approval policy evaluates the test.
User A authenticates.
User A requests Vehicle B.
Vehicle B data is returned.
Oracle confirms Vehicle B belongs to User B.
Gateway and application events are correlated.
Splunk alert outcome is evaluated.
Evidence Fabric stores the complete proof.
Hayrok creates a confirmed BOLA finding.
The secure companion route is enabled.
Hayrok reruns the same workflow.
The request is denied.
The finding is updated with successful control validation.
HVR resets and verifies the environment.

Demonstrated value
API discovery
→ identity understanding
→ object relationship mapping
→ governed planning
→ safe execution
→ independent confirmation
→ detection evaluation
→ evidence
→ remediation
→ revalidation

37. Final Product Decision
Hayrok should use OWASP crAPI as:
A version-pinned, externally maintained API-security target wrapped by Hayrok-owned lifecycle, fixture, telemetry, Oracle, evidence, control, and secure negative-control services.
The architectural rule is:
Use crAPI for realistic API and microservice behavior.
Use Hayrok-owned components for deterministic orchestration,
ground truth, governance, evidence, secure controls, and benchmarking.

This approach gives Hayrok:
Realistic API workflows
Multi-user authorization scenarios
Stateful planning tests
API graph qualification
Detection validation
Evidence-rich findings
Secure negative controls
Repeatable engineering regression
A credible API-security customer demonstration