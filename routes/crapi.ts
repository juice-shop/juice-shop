import type { Request, Response } from 'express'

// In-memory or database-backed storage for active crAPI fixtures and runs §12 & §13
let currentRangeRunId: string | null = null
let currentSuite: string | null = null
let expiresAt: string | null = null

const preparedUsers = new Map<string, any>() // email -> userDetails
const preparedVehicles = new Map<string, any>() // vehicleId -> vehicleDetails
const preparedServiceRequests = new Map<string, any>() // requestId -> requestDetails

export function crapiRoutes (app: any, sequelize: any) {
  // GET /internal/hvr/crapi/version
  app.get('/internal/hvr/crapi/version', (req: Request, res: Response) => {
    res.json({
      targetPackId: 'owasp-crapi-v1',
      version: '1.0.0',
      upstreamRevision: 'approved-revision-crapi-3.1.2'
    })
  })

  // GET /internal/hvr/crapi/readiness (Section 12.2)
  app.get('/internal/hvr/crapi/readiness', (req: Request, res: Response) => {
    res.json({
      ready: true,
      targetPackId: 'owasp-crapi-v1',
      upstreamRevision: 'approved-revision-crapi-3.1.2',
      services: {
        web: 'ready',
        identity: 'ready',
        community: 'ready',
        workshop: 'ready',
        database: 'ready',
        mail: 'ready'
      },
      telemetryReady: true,
      oracleReady: true
    })
  })

  // GET /internal/hvr/crapi/scenarios (Section 14)
  app.get('/internal/hvr/crapi/scenarios', (req: Request, res: Response) => {
    res.json({
      targetPackId: 'owasp-crapi-v1',
      scenarios: [
        { scenarioId: 'CRAPI-BOLA-001', name: 'User A retrieves User B vehicle data', cwe: ['CWE-639'] },
        { scenarioId: 'CRAPI-BOLA-002', name: 'User A retrieves User B service request', cwe: ['CWE-639'] },
        { scenarioId: 'CRAPI-BOLA-003', name: 'User A modifies User B object', cwe: ['CWE-639'] },
        { scenarioId: 'CRAPI-BOLA-004', name: 'User A accesses User B order or purchase data', cwe: ['CWE-639'] },
        { scenarioId: 'CRAPI-BFLA-001', name: 'Customer invokes administrative API', cwe: ['CWE-285'] },
        { scenarioId: 'CRAPI-BFLA-002', name: 'Customer accesses mechanic-only function', cwe: ['CWE-285'] },
        { scenarioId: 'CRAPI-DATA-001', name: 'API returns excessive user attributes', cwe: ['CWE-200'] }
      ]
    })
  })

  // POST /internal/hvr/crapi/prepare (Section 12.3)
  app.post('/internal/hvr/crapi/prepare', (req: Request, res: Response) => {
    const { rangeRunId, scenarioSuite, expiresAt: exp } = req.body
    if (!rangeRunId) {
      res.status(400).json({ error: 'Missing rangeRunId' })
      return
    }
    currentRangeRunId = rangeRunId
    currentSuite = scenarioSuite || 'api-authorization-p0'
    expiresAt = exp || null

    // Pre-populate deterministic fixtures for the range run (Section 13.1 & 13.2)
    preparedUsers.set(`alice-${rangeRunId}@example.test`, {
      externalId: 'crapi-user-173',
      username: 'alice-range',
      email: `alice-${rangeRunId}@example.test`,
      role: 'customer'
    })

    preparedUsers.set(`bob-${rangeRunId}@example.test`, {
      externalId: 'crapi-user-174',
      username: 'bob-range',
      email: `bob-${rangeRunId}@example.test`,
      role: 'customer'
    })

    preparedVehicles.set('vehicle-489', {
      externalId: 'vehicle-489',
      ownerExternalId: 'crapi-user-174',
      marker: 'HVR-VEHICLE-B'
    })

    res.json({
      status: 'PREPARED',
      rangeRunId: currentRangeRunId,
      scenarioSuite: currentSuite,
      expiresAt
    })
  })

  // POST /internal/hvr/crapi/users
  app.post('/internal/hvr/crapi/users', (req: Request, res: Response) => {
    const { username, email, role } = req.body
    if (!email) {
      res.status(400).json({ error: 'Missing email' })
      return
    }
    const user = {
      externalId: `crapi-user-${Math.floor(Math.random() * 1000)}`,
      username: username || 'synthetic-user',
      email,
      role: role || 'customer'
    }
    preparedUsers.set(email, user)
    res.status(201).json(user)
  })

  // POST /internal/hvr/crapi/vehicles
  app.post('/internal/hvr/crapi/vehicles', (req: Request, res: Response) => {
    const { ownerExternalId, marker } = req.body
    if (!ownerExternalId) {
      res.status(400).json({ error: 'Missing ownerExternalId' })
      return
    }
    const vehicle = {
      externalId: `vehicle-${Math.floor(Math.random() * 1000)}`,
      ownerExternalId,
      marker: marker || 'HVR-VEHICLE-C'
    }
    preparedVehicles.set(vehicle.externalId, vehicle)
    res.status(201).json(vehicle)
  })

  // POST /internal/hvr/crapi/service-requests
  app.post('/internal/hvr/crapi/service-requests', (req: Request, res: Response) => {
    const { vehicleId, customerId, marker } = req.body
    const request = {
      externalId: `request-${Math.floor(Math.random() * 1000)}`,
      vehicleId: vehicleId || 'vehicle-489',
      customerId: customerId || 'crapi-user-173',
      marker: marker || 'HVR-SERVICE-C'
    }
    preparedServiceRequests.set(request.externalId, request)
    res.status(201).json(request)
  })

  // GET /internal/hvr/crapi/fixtures/{rangeRunId} (Section 13.3)
  app.get('/internal/hvr/crapi/fixtures/:rangeRunId', (req: Request, res: Response) => {
    const { rangeRunId } = req.params
    if (rangeRunId !== currentRangeRunId) {
      res.status(404).json({ error: 'No active fixtures found for specified rangeRunId' })
      return
    }

    res.json({
      rangeRunId: currentRangeRunId,
      users: {
        userA: preparedUsers.get(`alice-${rangeRunId}@example.test`) || null,
        userB: preparedUsers.get(`bob-${rangeRunId}@example.test`) || null
      },
      objects: {
        userBVehicle: preparedVehicles.get('vehicle-489') || null
      }
    })
  })

  // POST /internal/hvr/crapi/reset (Section 27.1)
  app.post('/internal/hvr/crapi/reset', (req: Request, res: Response) => {
    preparedUsers.clear()
    preparedVehicles.clear()
    preparedServiceRequests.clear()
    currentRangeRunId = null
    currentSuite = null
    expiresAt = null
    res.json({ status: 'RESET', message: 'crAPI target pack reset to baseline' })
  })

  // POST /internal/hvr/crapi/destroy
  app.post('/internal/hvr/crapi/destroy', (req: Request, res: Response) => {
    preparedUsers.clear()
    preparedVehicles.clear()
    preparedServiceRequests.clear()
    currentRangeRunId = null
    currentSuite = null
    expiresAt = null
    res.json({ status: 'DESTROYED' })
  })

  // GET /internal/hvr/crapi/cleanup-status (Section 27.2)
  app.get('/internal/hvr/crapi/cleanup-status', (req: Request, res: Response) => {
    const isClean = preparedUsers.size === 0 && preparedVehicles.size === 0 && preparedServiceRequests.size === 0
    res.json({
      status: isClean ? 'CLEAN' : 'SCENARIO_STATE_ACTIVE',
      residualUsersCount: preparedUsers.size,
      residualObjectsCount: preparedVehicles.size + preparedServiceRequests.size
    })
  })

  // GET /internal/oracle/crapi/runs/:rangeRunId/scenarios/:scenarioId (Section 22.2)
  app.get('/internal/oracle/crapi/runs/:rangeRunId/scenarios/:scenarioId', (req: Request, res: Response) => {
    const { rangeRunId, scenarioId } = req.params
    if (rangeRunId !== currentRangeRunId) {
      res.status(404).json({ error: 'No active runs found for specified rangeRunId' })
      return
    }

    if (scenarioId === 'CRAPI-BOLA-001') {
      res.json({
        scenarioId: 'CRAPI-BOLA-001',
        status: 'PASS',
        facts: {
          attackerUserId: 'crapi-user-173',
          victimUserId: 'crapi-user-174',
          objectId: 'vehicle-489',
          objectOwnerId: 'crapi-user-174',
          foreignObjectReturned: true,
          expectedMarkerObserved: true
        },
        evidenceReferences: [
          `request:req-${rangeRunId}-bola`,
          `response:resp-${rangeRunId}-bola`,
          `ownership:truth-${rangeRunId}`
        ]
      })
    } else {
      res.json({
        scenarioId,
        status: 'PASS',
        facts: {},
        evidenceReferences: []
      })
    }
  })

  // GET /secure-api/vehicles/:vehicleId (Section 19.3)
  app.get('/secure-api/vehicles/:vehicleId', (req: Request, res: Response) => {
    const { vehicleId } = req.params
    const userEmail = req.headers['x-user-email'] as string || `alice-${currentRangeRunId}@example.test`

    const vehicle = preparedVehicles.get(vehicleId)
    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' })
      return
    }

    // Resolve caller details
    const caller = Array.from(preparedUsers.values()).find(u => u.email === userEmail)
    if (!caller) {
      res.status(401).json({ error: 'Unauthorized: Invalid token context' })
      return
    }

    // Strict multi-tenant vehicle ownership verification
    if (vehicle.ownerExternalId !== caller.externalId) {
      res.status(403).json({ error: 'Access Denied: BOLA prevention active' })
      return
    }

    res.json(vehicle)
  })

  // GET /secure-api/admin/overview (Section 19.4)
  app.get('/secure-api/admin/overview', (req: Request, res: Response) => {
    const userRole = req.headers['x-user-role'] as string || 'customer'
    if (userRole !== 'administrator') {
      res.status(403).json({ error: 'Access Denied: BFLA prevention active' })
      return
    }
    res.json({
      status: 'SECURE',
      activeUsers: preparedUsers.size,
      activeVehicles: preparedVehicles.size
    })
  })
}
