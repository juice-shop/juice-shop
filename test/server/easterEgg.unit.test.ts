/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import { challenges } from '../../data/datacache'
import { type Challenge } from '@juice-shop/data/types'
import { serveEasterEgg } from '../../routes/easterEgg'

void describe('easterEgg', () => {
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

  void it('should serve /frontend/dist/frontend/assets/private/threejs-demo.html', () => {
    serveEasterEgg()(req, res)

    assert.equal(res.sendFile.mock.calls.length, 1)
    assert.match(res.sendFile.mock.calls[0].arguments[0], /frontend[/\\]dist[/\\]frontend[/\\]assets[/\\]private[/\\]threejs-demo\.html/)
  })

  void it('should solve "easterEggLevelTwoChallenge"', () => {
    challenges.easterEggLevelTwoChallenge = { solved: false, save } as unknown as Challenge

    serveEasterEgg()(req, res)

    assert.equal(challenges.easterEggLevelTwoChallenge.solved, true)
  })
})
