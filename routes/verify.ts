/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type NextFunction, type Request, type Response } from 'express'
import jwt from 'jsonwebtoken'
import jws from 'jws'

import { challenges, retrieveBlueprintChallengeFile } from '../data/datacache'
import { type Challenge } from '../data/types'
import * as challengeUtils from '../lib/challengeUtils'
import * as security from '../lib/insecurity'
import * as utils from '../lib/utils'

export const emptyUserRegistration = () => (req: Request, res: Response, next: NextFunction) => {
  challengeUtils.solveIf(challenges.emptyUserRegistration, () => {
    return req.body && req.body.email === '' && req.body.password === ''
  })
  next()
}

export const forgedFeedbackChallenge = () => (req: Request, res: Response, next: NextFunction) => {
  challengeUtils.solveIf(challenges.forgedFeedbackChallenge, () => {
    const user = security.authenticatedUsers.from(req)
    const userId = user?.data ? user.data.id : undefined
    return req.body?.UserId && req.body.UserId != userId // eslint-disable-line eqeqeq
  })
  next()
}

export const captchaBypassChallenge = () => (req: Request, res: Response, next: NextFunction) => {
  if (challengeUtils.notSolved(challenges.captchaBypassChallenge)) {
    if (req.app.locals.captchaReqId >= 10) {
      if ((new Date().getTime() - req.app.locals.captchaBypassReqTimes[req.app.locals.captchaReqId - 10]) <= 20000) {
        challengeUtils.solve(challenges.captchaBypassChallenge)
      }
    }
    req.app.locals.captchaBypassReqTimes[req.app.locals.captchaReqId - 1] = new Date().getTime()
    req.app.locals.captchaReqId++
  }
  next()
}

export const registerAdminChallenge = () => (req: Request, res: Response, next: NextFunction) => {
  challengeUtils.solveIf(challenges.registerAdminChallenge, () => {
    return req.body && req.body.role === security.roles.admin
  })
  next()
}

export const passwordRepeatChallenge = () => (req: Request, res: Response, next: NextFunction) => {
  challengeUtils.solveIf(challenges.passwordRepeatChallenge, () => { return req.body && req.body.passwordRepeat !== req.body.password })
  next()
}

export const accessControlChallenges = () => (req: Request, res: Response, next: NextFunction) => {
  const { url } = req
  const uiBypassed = req.header('sec-fetch-dest') === 'document' || !req.header('referer')
  challengeUtils.solveIf(challenges.scoreBoardChallenge, () => { return utils.endsWith(url, '/1px.png') }, false, uiBypassed)
  challengeUtils.solveIf(challenges.web3SandboxChallenge, () => { return utils.endsWith(url, '/11px.png') }, false, uiBypassed)
  challengeUtils.solveIf(challenges.adminSectionChallenge, () => { return utils.endsWith(url, '/19px.png') }, false, uiBypassed)
  challengeUtils.solveIf(challenges.tokenSaleChallenge, () => { return utils.endsWith(url, '/56px.png') }, false, uiBypassed)
  challengeUtils.solveIf(challenges.privacyPolicyChallenge, () => { return utils.endsWith(url, '/81px.png') }, false, uiBypassed)
  challengeUtils.solveIf(challenges.extraLanguageChallenge, () => { return utils.endsWith(url, '/tlh_AA.json') })
  challengeUtils.solveIf(challenges.retrieveBlueprintChallenge, () => { return utils.endsWith(url, retrieveBlueprintChallengeFile ?? undefined) })
  challengeUtils.solveIf(challenges.securityPolicyChallenge, () => { return utils.endsWith(url, '/security.txt') })
  challengeUtils.solveIf(challenges.missingEncodingChallenge, () => { return utils.endsWith(url.toLowerCase(), '%e1%93%9a%e1%98%8f%e1%97%a2-%23zatschi-%23whoneedsfourlegs-1572600969477.jpg') })
  challengeUtils.solveIf(challenges.accessLogDisclosureChallenge, () => { return url.match(/access\.log(0-9-)*/) })
  challengeUtils.solveIf(challenges.misplacedIacFiles, () => { return (utils.endsWith(url, '.tf') || utils.endsWith(url, 'Dockerfile') || utils.endsWith(url, 'docker-compose.yml')) })
  next()
}

export const errorHandlingChallenge = () => (err: unknown, req: Request, { statusCode }: Response, next: NextFunction) => {
  challengeUtils.solveIf(challenges.errorHandlingChallenge, () => { return err && (statusCode === 200 || statusCode > 401) })
  next(err)
}

/* Only tokens whose payload email matches one of these patterns can solve a JWT
   challenge, so all other tokens are screened out (and remembered) without any
   signature verification. Screening is independent of the challenge solve state,
   so remembered tokens can never suppress a legitimate solve. */
const jwtChallengeEmailPatterns = [/jwtn3d@/, /rsa_lord@/, /cloud-admin@/]
const screenedTokens = new Set<string>()
const screenedTokensCapacity = 1000

function rememberScreenedToken (token: string) {
  if (screenedTokens.size >= screenedTokensCapacity) {
    const oldestToken = screenedTokens.values().next().value
    if (oldestToken !== undefined) {
      screenedTokens.delete(oldestToken)
    }
  }
  screenedTokens.add(token)
}

export const jwtChallenges = () => (req: Request, res: Response, next: NextFunction) => {
  const token = utils.jwtFrom(req)
  if (!token || screenedTokens.has(token)) {
    next()
    return
  }
  const decoded = jws.decode(token) ? jwt.decode(token) : null
  if (decoded === null || typeof decoded === 'string') {
    rememberScreenedToken(token)
    next()
    return
  }
  const email = decoded?.data?.email
  if (typeof email !== 'string' || !jwtChallengeEmailPatterns.some((pattern) => pattern.test(email))) {
    rememberScreenedToken(token)
    next()
    return
  }
  if (challengeUtils.notSolved(challenges.jwtUnsignedChallenge)) {
    jwtChallenge(challenges.jwtUnsignedChallenge, token, decoded, 'none', /jwtn3d@/)
  }
  if (utils.isChallengeEnabled(challenges.jwtForgedChallenge) && challengeUtils.notSolved(challenges.jwtForgedChallenge)) {
    jwtChallenge(challenges.jwtForgedChallenge, token, decoded, 'HS256', /rsa_lord@/)
  }
  if (challengeUtils.notSolved(challenges.iacLeakedKeyChallenge)) {
    jwtChallenge(challenges.iacLeakedKeyChallenge, token, decoded, 'RS256', /cloud-admin@/)
  }
  next()
}

export const serverSideChallenges = () => (req: Request, res: Response, next: NextFunction) => {
  if (req.query.key === 'tRy_H4rd3r_n0thIng_iS_Imp0ssibl3') {
    if (challengeUtils.notSolved(challenges.sstiChallenge) && req.app.locals.abused_ssti_bug === true) {
      challengeUtils.solve(challenges.sstiChallenge)
      res.status(204).send()
      return
    }

    if (challengeUtils.notSolved(challenges.ssrfChallenge) && req.app.locals.abused_ssrf_bug === true) {
      challengeUtils.solve(challenges.ssrfChallenge)
      res.status(204).send()
      return
    }
  }
  next()
}

function jwtChallenge (challenge: Challenge, token: string, decoded: jwt.JwtPayload, algorithm: string, email: string | RegExp) {
  jwt.verify(token, security.publicKey, (err: jwt.VerifyErrors | null) => {
    if (err === null) {
      challengeUtils.solveIf(challenge, () => {
        return hasAlgorithm(token, algorithm) && hasEmail(decoded as { data: { email: string } }, email)
      })
    }
  })
}

function hasAlgorithm (token: string, algorithm: string) {
  const header = JSON.parse(Buffer.from(token.split('.')[0], 'base64').toString())
  return token && header && header.alg === algorithm
}

function hasEmail (token: { data: { email: string } }, email: string | RegExp) {
  return token?.data?.email?.match(email)
}
