import type { Request, Response } from 'express'
import { ChallengeModel } from '../models/challenge'
import { preconditionsReady } from '../lib/startup/validatePreconditions'

let currentRangeRunId: string | null = null
let currentSuite: string | null = null
let expiresAt: string | null = null
const activeScenarios = new Map<string, string>() // scenarioId -> state (e.g., VULNERABLE, SECURE)

export function hvrRoutes (app: any) {
  // GET /internal/hvr/readiness
  app.get('/internal/hvr/readiness', (req: Request, res: Response) => {
    res.json({
      ready: preconditionsReady,
      version: 'commercehub-1.0.0',
      upstreamVersion: 'owasp-juice-shop-17.0.0',
      databaseReady: true,
      telemetryReady: true,
      oracleReady: true,
      activeRangeRun: currentRangeRunId
    })
  })

  // POST /internal/hvr/prepare
  app.post('/internal/hvr/prepare', (req: Request, res: Response) => {
    const { rangeRunId, suite, expiresAt: exp } = req.body
    if (!rangeRunId) {
      res.status(400).json({ error: 'Missing rangeRunId' })
      return
    }
    currentRangeRunId = rangeRunId
    currentSuite = suite || 'default'
    expiresAt = exp || null
    res.json({ status: 'PREPARED', rangeRunId: currentRangeRunId, suite: currentSuite })
  })

  // POST /internal/hvr/scenarios/:scenarioId/activate
  app.post('/internal/hvr/scenarios/:scenarioId/activate', (req: Request, res: Response) => {
    const { scenarioId } = req.params
    const { state, rangeRunId } = req.body
    if (!state) {
      res.status(400).json({ error: 'Missing state' })
      return
    }
    activeScenarios.set(scenarioId, state)
    res.json({ scenarioId, state, rangeRunId: rangeRunId || currentRangeRunId })
  })

  // POST /internal/hvr/scenarios/:scenarioId/reset
  app.post('/internal/hvr/scenarios/:scenarioId/reset', (req: Request, res: Response) => {
    const { scenarioId } = req.params
    activeScenarios.delete(scenarioId)
    res.json({ scenarioId, status: 'RESET' })
  })

  // POST /internal/hvr/reset
  app.post('/internal/hvr/reset', (req: Request, res: Response) => {
    currentRangeRunId = null
    currentSuite = null
    expiresAt = null
    activeScenarios.clear()
    res.json({ status: 'CLEAN' })
  })

  // GET /internal/hvr/cleanup-status
  app.get('/internal/hvr/cleanup-status', (req: Request, res: Response) => {
    res.json({ status: activeScenarios.size === 0 ? 'CLEAN' : 'RESIDUAL_SCENARIO_STATE' })
  })
}
