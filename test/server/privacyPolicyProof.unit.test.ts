/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import { challenges } from '../../data/datacache'
import { type Challenge } from '@juice-shop/data/types'
import { servePrivacyPolicyProof } from '../../routes/privacyPolicyProof'

void describe('privacyPolicyProof', () => {
  let req: any
  let res: any
  let save: any

  beforeEach(() => {
    res = { sendFile: mock.fn() }
    req = {}
    save = () => ({
      then () { }
    })
  })

  void it('should serve /frontend/dist/frontend/assets/private/thank-you.jpg', () => {
    servePrivacyPolicyProof()(req, res)

    assert.equal(res.sendFile.mock.calls.length, 1)
    assert.match(res.sendFile.mock.calls[0].arguments[0], /frontend[/\\]dist[/\\]frontend[/\\]assets[/\\]private[/\\]thank-you\.jpg/)
  })

  void it('should solve "privacyPolicyProofChallenge"', () => {
    challenges.privacyPolicyProofChallenge = { solved: false, save } as unknown as Challenge

    servePrivacyPolicyProof()(req, res)

    assert.equal(challenges.privacyPolicyProofChallenge.solved, true)
  })

  void it('should not save "privacyPolicyProofChallenge" when already solved', () => {
    const saveSpy = mock.fn(() => ({
      then () { }
    }))
    challenges.privacyPolicyProofChallenge = { solved: true, save: saveSpy } as unknown as Challenge

    servePrivacyPolicyProof()(req, res)

    assert.equal(saveSpy.mock.calls.length, 0)
  })
})
