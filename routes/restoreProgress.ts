/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import Hashids from 'hashids/cjs'
import { type Request, type Response } from 'express'

import * as challengeUtils from '../lib/challengeUtils'
import { challenges } from '../data/datacache'

const hashidsAlphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
const hashidRegexp = /^[a-zA-Z0-9]+$/
const invalidContinueCode = 'Invalid continue code.'

export function restoreProgress () {
  return (req: Request, res: Response) => {
    if (!req.user || !req.user.progressSalt) {
      return res.status(401).send('User authentication required for progress restoration.')
    }
    const hashids = new Hashids(req.user.progressSalt, 60, hashidsAlphabet)
    const continueCode = req.params.continueCode
    if (!hashidRegexp.test(continueCode)) {
      return res.status(404).send(invalidContinueCode)
    }
    const ids = hashids.decode(continueCode)
    if (challengeUtils.notSolved(challenges.continueCodeChallenge) && ids.includes(999)) {
      challengeUtils.solve(challenges.continueCodeChallenge)
      res.end()
    } else if (ids.length > 0) {
      for (const challenge of Object.values(challenges)) {
        if (ids.includes(challenge.id)) {
          challengeUtils.solve(challenge, true)
        }
      }
      res.json({ data: ids.length + ' solved challenges have been restored.' })
    } else {
      res.status(404).send(invalidContinueCode)
    }
  }
}

export function restoreProgressFindIt () {
  return async (req: Request, res: Response) => {
    if (!req.user || !req.user.progressSalt) {
      return res.status(401).send('User authentication required for progress restoration.')
    }
    const hashids = new Hashids(req.user.progressSalt + ':findIt', 60, hashidsAlphabet)
    const continueCodeFindIt = req.params.continueCode
    if (!hashidRegexp.test(continueCodeFindIt)) {
      return res.status(404).send(invalidContinueCode)
    }
    const idsFindIt = hashids.decode(continueCodeFindIt)
    if (idsFindIt.length > 0) {
      for (const challenge of Object.values(challenges)) {
        if (idsFindIt.includes(challenge.id)) {
          await challengeUtils.solveFindIt(challenge.key, true)
        }
      }
      res.json({ data: idsFindIt.length + ' solved challenges have been restored.' })
    } else {
      res.status(404).send(invalidContinueCode)
    }
  }
}

export function restoreProgressFixIt () {
  // hashids will be instantiated inside the handler to access per-user salt
  return async (req: Request, res: Response) => {
    if (!req.user || !req.user.progressSalt) {
      return res.status(401).send('User authentication required for progress restoration.')
    }
    const hashids = new Hashids(req.user.progressSalt + ':fixIt', 60, hashidsAlphabet)
    const continueCodeFixIt = req.params.continueCode
    if (!hashidRegexp.test(continueCodeFixIt)) {
      return res.status(404).send(invalidContinueCode)
    }
    const idsFixIt = hashids.decode(continueCodeFixIt)
    if (idsFixIt.length > 0) {
      for (const challenge of Object.values(challenges)) {
        if (idsFixIt.includes(challenge.id)) {
          await challengeUtils.solveFixIt(challenge.key, true)
        }
      }
      res.json({ data: idsFixIt.length + ' solved challenges have been restored.' })
    } else {
      res.status(404).send(invalidContinueCode)
    }
  }
}
