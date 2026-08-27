/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import { createTestApp } from './helpers/setup'

let app: Express

before(async () => {
  const result = await createTestApp()
  app = result.app
}, { timeout: 60000 })

void describe('/internal/hvr/crapi', () => {
  void it('GET version returns metadata', async () => {
    const res = await request(app)
      .get('/internal/hvr/crapi/version')
    assert.equal(res.status, 200)
    assert.equal(res.body.targetPackId, 'owasp-crapi-v1')
    assert.equal(res.body.version, '1.0.0')
  })

  void it('GET readiness reports service readiness', async () => {
    const res = await request(app)
      .get('/internal/hvr/crapi/readiness')
    assert.equal(res.status, 200)
    assert.equal(res.body.ready, true)
    assert.equal(res.body.services.web, 'ready')
  })

  void it('GET scenarios lists all scenarios', async () => {
    const res = await request(app)
      .get('/internal/hvr/crapi/scenarios')
    assert.equal(res.status, 200)
    assert.equal(res.body.targetPackId, 'owasp-crapi-v1')
    assert.ok(res.body.scenarios.length > 0)
  })

  void describe('lifecycle validation', () => {
    const rangeRunId = 'test-run-123'

    void it('POST prepare initializes deterministic fixtures', async () => {
      const res = await request(app)
        .post('/internal/hvr/crapi/prepare')
        .send({ rangeRunId, scenarioSuite: 'api-authorization-p0' })
      assert.equal(res.status, 200)
      assert.equal(res.body.status, 'PREPARED')
      assert.equal(res.body.rangeRunId, rangeRunId)
    })

    void it('GET fixtures retrieves prepared users and vehicles', async () => {
      const res = await request(app)
        .get(`/internal/hvr/crapi/fixtures/${rangeRunId}`)
      assert.equal(res.status, 200)
      assert.equal(res.body.rangeRunId, rangeRunId)
      assert.equal(res.body.users.userA.username, 'alice-range')
      assert.equal(res.body.objects.userBVehicle.marker, 'HVR-VEHICLE-B')
    })

    void it('GET Ground Truth Oracle returns PASS metrics for CRAPI-BOLA-001', async () => {
      const res = await request(app)
        .get(`/internal/oracle/crapi/runs/${rangeRunId}/scenarios/CRAPI-BOLA-001`)
      assert.equal(res.status, 200)
      assert.equal(res.body.status, 'PASS')
      assert.equal(res.body.facts.attackerUserId, 'crapi-user-173')
    })

    void it('GET secure companion vehicles enforces BOLA prevention (Alice cannot see Bobs vehicle)', async () => {
      const res = await request(app)
        .get('/secure-api/vehicles/vehicle-489')
        .set('x-user-email', `alice-${rangeRunId}@example.test`)
      assert.equal(res.status, 403)
      assert.equal(res.body.error, 'Access Denied: BOLA prevention active')
    })

    void it('GET secure companion vehicles allows Bob to access his own vehicle', async () => {
      const res = await request(app)
        .get('/secure-api/vehicles/vehicle-489')
        .set('x-user-email', `bob-${rangeRunId}@example.test`)
      assert.equal(res.status, 200)
      assert.equal(res.body.marker, 'HVR-VEHICLE-B')
    })

    void it('GET secure companion admin overview denies standard customers (BFLA)', async () => {
      const res = await request(app)
        .get('/secure-api/admin/overview')
        .set('x-user-role', 'customer')
      assert.equal(res.status, 403)
      assert.equal(res.body.error, 'Access Denied: BFLA prevention active')
    })

    void it('GET secure companion admin overview permits administrators', async () => {
      const res = await request(app)
        .get('/secure-api/admin/overview')
        .set('x-user-role', 'administrator')
      assert.equal(res.status, 200)
      assert.equal(res.body.status, 'SECURE')
    })

    void it('POST reset clears all maps and returns status CLEAN', async () => {
      const resetRes = await request(app)
        .post('/internal/hvr/crapi/reset')
      assert.equal(resetRes.status, 200)
      assert.equal(resetRes.body.status, 'RESET')

      const statusRes = await request(app)
        .get('/internal/hvr/crapi/cleanup-status')
      assert.equal(statusRes.status, 200)
      assert.equal(statusRes.body.status, 'CLEAN')
    })
  })
})
