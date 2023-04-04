/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Request, Response, NextFunction } from 'express'
import { Challenge, Product } from '../data/types'
import { JwtPayload, VerifyErrors } from 'jsonwebtoken'
import { FeedbackModel } from '../models/feedback'
import { ComplaintModel } from '../models/complaint'
import { Op } from 'sequelize'
import challengeUtils = require('../lib/challengeUtils')

const utils = require('../lib/utils')
const security = require('../lib/insecurity')
const jwt = require('jsonwebtoken')
const jws = require('jws')
const cache = require('../data/datacache')
const challenges = cache.challenges
const products = cache.products
const config = require('config')

exports.forgedFeedbackChallenge = () => (req: Request, res: Response, next: NextFunction) => {
  challengeUtils.solveIf(challenges.forgedFeedbackChallenge, () => {
    const user = security.authenticatedUsers.from(req)
    const userId = user?.data ? user.data.id : undefined
    return req.body?.UserId && req.body.UserId != userId // eslint-disable-line eqeqeq
  })
  next()
}

exports.captchaBypassChallenge = () => (req: Request, res: Response, next: NextFunction) => {
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

exports.registerAdminChallenge = () => (req: Request, res: Response, next: NextFunction) => {
  challengeUtils.solveIf(challenges.registerAdminChallenge, () => { return req.body && req.body.role === security.roles.admin })
  next()
}

exports.passwordRepeatChallenge = () => (req: Request, res: Response, next: NextFunction) => {
  challengeUtils.solveIf(challenges.passwordRepeatChallenge, () => { return req.body && req.body.passwordRepeat !== req.body.password })
  next()
}

exports.accessControlChallenges = () => ({ url }: Request, res: Response, next: NextFunction) => {
  challengeUtils.solveIf(challenges.scoreBoardChallenge, () => { return utils.endsWith(url, '/1px.png') })
  challengeUtils.solveIf(challenges.adminSectionChallenge, () => { return utils.endsWith(url, '/19px.png') })
  challengeUtils.solveIf(challenges.tokenSaleChallenge, () => { return utils.endsWith(url, '/56px.png') })
  challengeUtils.solveIf(challenges.privacyPolicyChallenge, () => { return utils.endsWith(url, '/81px.png') })
  challengeUtils.solveIf(challenges.extraLanguageChallenge, () => { return utils.endsWith(url, '/tlh_AA.json') })
  challengeUtils.solveIf(challenges.retrieveBlueprintChallenge, () => { return utils.endsWith(url, cache.retrieveBlueprintChallengeFile) })
  challengeUtils.solveIf(challenges.securityPolicyChallenge, () => { return utils.endsWith(url, '/security.txt') })
  challengeUtils.solveIf(challenges.missingEncodingChallenge, () => { return utils.endsWith(url.toLowerCase(), '%f0%9f%98%bc-%23zatschi-%23whoneedsfourlegs-1572600969477.jpg') })
  challengeUtils.solveIf(challenges.accessLogDisclosureChallenge, () => { return url.match(/access\.log(0-9-)*/) })
  next()
}

exports.errorHandlingChallenge = () => (err: unknown, req: Request, { statusCode }: Response, next: NextFunction) => {
  challengeUtils.solveIf(challenges.errorHandlingChallenge, () => { return err && (statusCode === 200 || statusCode > 401) })
  next(err)
}

exports.jwtChallenges = () => (req: Request, res: Response, next: NextFunction) => {
  if (challengeUtils.notSolved(challenges.jwtUnsignedChallenge)) {
    jwtChallenge(challenges.jwtUnsignedChallenge, req, 'none', /jwtn3d@/)
  }
  if (!utils.disableOnWindowsEnv() && challengeUtils.notSolved(challenges.jwtForgedChallenge)) {
    jwtChallenge(challenges.jwtForgedChallenge, req, 'HS256', /rsa_lord@/)
  }
  next()
}

exports.serverSideChallenges = () => (req: Request, res: Response, next: NextFunction) => {
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

function jwtChallenge (challenge: Challenge, req: Request, algorithm: string, email: string | RegExp) {
  const token = utils.jwtFrom(req)
  if (token) {
    const decoded = jws.decode(token) ? jwt.decode(token) : null
    jwt.verify(token, security.publicKey, (err: VerifyErrors | null, verified: JwtPayload) => {
      if (err === null) {
        challengeUtils.solveIf(challenge, () => { return hasAlgorithm(token, algorithm) && hasEmail(decoded, email) })
      }
    })
  }
}

function hasAlgorithm (token: string, algorithm: string) {
  const header = JSON.parse(Buffer.from(token.split('.')[0], 'base64').toString())
  return token && header && header.alg === algorithm
}

function hasEmail (token: { data: { email: string } }, email: string | RegExp) {
  return token?.data?.email?.match(email)
}

exports.databaseRelatedChallenges = () => (req: Request, res: Response, next: NextFunction) => {
  if (challengeUtils.notSolved(challenges.changeProductChallenge) && products.osaft) {
    changeProductChallenge(products.osaft)
  }
  if (challengeUtils.notSolved(challenges.feedbackChallenge)) {
    feedbackChallenge()
  }
  if (challengeUtils.notSolved(challenges.knownVulnerableComponentChallenge)) {
    knownVulnerableComponentChallenge()
  }
  if (challengeUtils.notSolved(challenges.weirdCryptoChallenge)) {
    weirdCryptoChallenge()
  }
  if (challengeUtils.notSolved(challenges.typosquattingNpmChallenge)) {
    typosquattingNpmChallenge()
  }
  if (challengeUtils.notSolved(challenges.typosquattingAngularChallenge)) {
    typosquattingAngularChallenge()
  }
  if (challengeUtils.notSolved(challenges.hiddenImageChallenge)) {
    hiddenImageChallenge()
  }
  if (challengeUtils.notSolved(challenges.supplyChainAttackChallenge)) {
    supplyChainAttackChallenge()
  }
  if (challengeUtils.notSolved(challenges.dlpPastebinDataLeakChallenge)) {
    dlpPastebinDataLeakChallenge()
  }
  next()
}

function changeProductChallenge (osaft: Product) {
  let urlForProductTamperingChallenge: string | null = null
  void osaft.reload().then(() => {
    for (const product of config.products) {
      if (product.urlForProductTamperingChallenge !== undefined) {
        urlForProductTamperingChallenge = product.urlForProductTamperingChallenge
        break
      }
    }
    if (urlForProductTamperingChallenge) {
      if (!utils.contains(osaft.description, `${urlForProductTamperingChallenge}`)) {
        if (utils.contains(osaft.description, `<a href="${config.get('challenges.overwriteUrlForProductTamperingChallenge')}" target="_blank">More...</a>`)) {
          challengeUtils.solve(challenges.changeProductChallenge)
        }
      }
    }
  })
}

function feedbackChallenge () {
  FeedbackModel.findAndCountAll({ where: { rating: 5 } }).then(({ count }: { count: number }) => {
    if (count === 0) {
      challengeUtils.solve(challenges.feedbackChallenge)
    }
  }).catch(() => {
    throw new Error('Unable to retrieve feedback details. Please try again')
  })
}

function knownVulnerableComponentChallenge () {
  FeedbackModel.findAndCountAll({
    where: {
      comment: {
        [Op.or]: knownVulnerableComponents()
      }
    }
  }).then(({ count }: { count: number }) => {
    if (count > 0) {
      challengeUtils.solve(challenges.knownVulnerableComponentChallenge)
    }
  }).catch(() => {
    throw new Error('Unable to get data for known vulnerabilities. Please try again')
  })
  ComplaintModel.findAndCountAll({
    where: {
      message: {
        [Op.or]: knownVulnerableComponents()
      }
    }
  }).then(({ count }: { count: number }) => {
    if (count > 0) {
      challengeUtils.solve(challenges.knownVulnerableComponentChallenge)
    }
  }).catch(() => {
    throw new Error('Unable to get data for known vulnerabilities. Please try again')
  })
}

function knownVulnerableComponents () {
  return [
    {
      [Op.and]: [
        { [Op.like]: '%sanitize-html%' },
        { [Op.like]: '%1.4.2%' }
      ]
    },
    {
      [Op.and]: [
        { [Op.like]: '%express-jwt%' },
        { [Op.like]: '%0.1.3%' }
      ]
    }
  ]
}

function weirdCryptoChallenge () {
  FeedbackModel.findAndCountAll({
    where: {
      comment: {
        [Op.or]: weirdCryptos()
      }
    }
  }).then(({ count }: { count: number }) => {
    if (count > 0) {
      challengeUtils.solve(challenges.weirdCryptoChallenge)
    }
  }).catch(() => {
    throw new Error('Unable to get data for known vulnerabilities. Please try again')
  })
  ComplaintModel.findAndCountAll({
    where: {
      message: {
        [Op.or]: weirdCryptos()
      }
    }
  }).then(({ count }: { count: number }) => {
    if (count > 0) {
      challengeUtils.solve(challenges.weirdCryptoChallenge)
    }
  }).catch(() => {
    throw new Error('Unable to get data for known vulnerabilities. Please try again')
  })
}

function weirdCryptos () {
  return [
    { [Op.like]: '%z85%' },
    { [Op.like]: '%base85%' },
    { [Op.like]: '%hashids%' },
    { [Op.like]: '%md5%' },
    { [Op.like]: '%base64%' }
  ]
}

function typosquattingNpmChallenge () {
  FeedbackModel.findAndCountAll({ where: { comment: { [Op.like]: '%epilogue-js%' } } }
  ).then(({ count }: { count: number }) => {
    if (count > 0) {
      challengeUtils.solve(challenges.typosquattingNpmChallenge)
    }
  }).catch(() => {
    throw new Error('Unable to get data for known vulnerabilities. Please try again')
  })
  ComplaintModel.findAndCountAll({ where: { message: { [Op.like]: '%epilogue-js%' } } }
  ).then(({ count }: { count: number }) => {
    if (count > 0) {
      challengeUtils.solve(challenges.typosquattingNpmChallenge)
    }
  }).catch(() => {
    throw new Error('Unable to get data for known vulnerabilities. Please try again')
  })
}

function typosquattingAngularChallenge () {
  FeedbackModel.findAndCountAll({ where: { comment: { [Op.like]: '%anuglar2-qrcode%' } } }
  ).then(({ count }: { count: number }) => {
    if (count > 0) {
      challengeUtils.solve(challenges.typosquattingAngularChallenge)
    }
  }).catch(() => {
    throw new Error('Unable to get data for known vulnerabilities. Please try again')
  })
  ComplaintModel.findAndCountAll({ where: { message: { [Op.like]: '%anuglar2-qrcode%' } } }
  ).then(({ count }: { count: number }) => {
    if (count > 0) {
      challengeUtils.solve(challenges.typosquattingAngularChallenge)
    }
  }).catch(() => {
    throw new Error('Unable to get data for known vulnerabilities. Please try again')
  })
}

function hiddenImageChallenge () {
  FeedbackModel.findAndCountAll({ where: { comment: { [Op.like]: '%pickle rick%' } } }
  ).then(({ count }: { count: number }) => {
    if (count > 0) {
      challengeUtils.solve(challenges.hiddenImageChallenge)
    }
  }).catch(() => {
    throw new Error('Unable to get data for known vulnerabilities. Please try again')
  })
  ComplaintModel.findAndCountAll({ where: { message: { [Op.like]: '%pickle rick%' } } }
  ).then(({ count }: { count: number }) => {
    if (count > 0) {
      challengeUtils.solve(challenges.hiddenImageChallenge)
    }
  }).catch(() => {
    throw new Error('Unable to get data for known vulnerabilities. Please try again')
  })
}

function supplyChainAttackChallenge () {
  FeedbackModel.findAndCountAll({ where: { comment: { [Op.or]: eslintScopeVulnIds() } } }
  ).then(({ count }: { count: number }) => {
    if (count > 0) {
      challengeUtils.solve(challenges.supplyChainAttackChallenge)
    }
  }).catch(() => {
    throw new Error('Unable to get data for known vulnerabilities. Please try again')
  })
  ComplaintModel.findAndCountAll({ where: { message: { [Op.or]: eslintScopeVulnIds() } } }
  ).then(({ count }: { count: number }) => {
    if (count > 0) {
      challengeUtils.solve(challenges.supplyChainAttackChallenge)
    }
  }).catch(() => {
    throw new Error('Unable to get data for known vulnerabilities. Please try again')
  })
}

function eslintScopeVulnIds () {
  return [
    { [Op.like]: '%eslint-scope/issues/39%' },
    { [Op.like]: '%npm:eslint-scope:20180712%' }
  ]
}

function dlpPastebinDataLeakChallenge () {
  FeedbackModel.findAndCountAll({
    where: {
      comment: { [Op.and]: dangerousIngredients() }
    }
  }).then(({ count }: { count: number }) => {
    if (count > 0) {
      challengeUtils.solve(challenges.dlpPastebinDataLeakChallenge)
    }
  }).catch(() => {
    throw new Error('Unable to get data for known vulnerabilities. Please try again')
  })
  ComplaintModel.findAndCountAll({
    where: {
      message: { [Op.and]: dangerousIngredients() }
    }
  }).then(({ count }: { count: number }) => {
    if (count > 0) {
      challengeUtils.solve(challenges.dlpPastebinDataLeakChallenge)
    }
  }).catch(() => {
    throw new Error('Unable to get data for known vulnerabilities. Please try again')
  })
}

function dangerousIngredients () {
  const ingredients: Array<{ [op: symbol]: string }> = []
  const dangerousProduct = config.get('products').filter((product: Product) => product.keywordsForPastebinDataLeakChallenge)[0]
  dangerousProduct.keywordsForPastebinDataLeakChallenge.forEach((keyword: string) => {
    ingredients.push({ [Op.like]: `%${keyword}%` })
  })
  return ingredients
}
