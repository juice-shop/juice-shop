/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config = require('config')
import { retrieveCodeSnippet } from '../routes/vulnCodeSnippet'
import { readFixes } from '../routes/vulnCodeFixes'
import { Challenge } from '../data/types'
const colors = require('colors/safe')
const logger = require('./logger')

const coupledChallenges = { // TODO prevent also near-identical challenges (e.g. all null byte file access or dom xss + bonus payload etc.) from counting as cheating
  loginAdminChallenge: ['weakPasswordChallenge'],
  nullByteChallenge: ['easterEggLevelOneChallenge', 'forgottenDevBackupChallenge', 'forgottenBackupChallenge', 'misplacedSignatureFileChallenge'],
  deprecatedInterfaceChallenge: ['uploadTypeChallenge', 'xxeFileDisclosureChallenge', 'xxeDosChallenge'],
  uploadSizeChallenge: ['uploadTypeChallenge', 'xxeFileDisclosureChallenge', 'xxeDosChallenge'],
  uploadTypeChallenge: ['uploadSizeChallenge', 'xxeFileDisclosureChallenge', 'xxeDosChallenge']
}
const trivialChallenges = ['errorHandlingChallenge', 'privacyPolicyChallenge']

const solves: Array<{challenge: any, phase: string, timestamp: Date, cheatScore: number}> = [{ challenge: {}, phase: 'server start', timestamp: new Date(), cheatScore: 0 }] // seed with server start timestamp

exports.calculateCheatScore = (challenge: Challenge) => {
  const timestamp = new Date()
  let cheatScore = 0
  let timeFactor = 2
  timeFactor *= (config.get('challenges.showHints') ? 1 : 1.5)
  timeFactor *= (challenge.tutorialOrder && config.get('hackingInstructor.isEnabled') ? 0.5 : 1)
  if (areCoupled(challenge, previous().challenge) || isTrivial(challenge)) {
    timeFactor = 0
  }

  const minutesExpectedToSolve = challenge.difficulty * timeFactor
  const minutesSincePreviousSolve = (timestamp.getTime() - previous().timestamp.getTime()) / 60000
  cheatScore += Math.max(0, 1 - (minutesSincePreviousSolve / minutesExpectedToSolve))

  logger.info(`Cheat score for ${areCoupled(challenge, previous().challenge) ? 'coupled ' : (isTrivial(challenge) ? 'trivial ' : '')}${challenge.tutorialOrder ? 'tutorial ' : ''}${colors.cyan(challenge.key)} solved in ${Math.round(minutesSincePreviousSolve)}min (expected ~${minutesExpectedToSolve}min) with${config.get('challenges.showHints') ? '' : 'out'} hints allowed: ${cheatScore < 0.33 ? colors.green(cheatScore) : (cheatScore < 0.66 ? colors.yellow(cheatScore) : colors.red(cheatScore))}`)
  solves.push({ challenge, phase: 'hack it', timestamp, cheatScore })
  return cheatScore
}

exports.calculateFindItCheatScore = async (challenge: Challenge) => { // TODO Consider coding challenges with identical/overlapping snippets as easier once one of them has been solved
  const timestamp = new Date()
  let timeFactor = 0.001
  timeFactor *= (challenge.key === 'scoreBoardChallenge' && config.get('hackingInstructor.isEnabled') ? 0.5 : 1)
  let cheatScore = 0

  const { snippet, vulnLines } = await retrieveCodeSnippet(challenge.key)
  timeFactor *= vulnLines.length
  const minutesExpectedToSolve = Math.ceil(snippet.length * timeFactor)
  const minutesSincePreviousSolve = (timestamp.getTime() - previous().timestamp.getTime()) / 60000
  cheatScore += Math.max(0, 1 - (minutesSincePreviousSolve / minutesExpectedToSolve))

  logger.info(`Cheat score for "Find it" phase of ${challenge.key === 'scoreBoardChallenge' && config.get('hackingInstructor.isEnabled') ? 'tutorial ' : ''}${colors.cyan(challenge.key)} solved in ${Math.round(minutesSincePreviousSolve)}min (expected ~${minutesExpectedToSolve}min): ${cheatScore < 0.33 ? colors.green(cheatScore) : (cheatScore < 0.66 ? colors.yellow(cheatScore) : colors.red(cheatScore))}`)
  solves.push({ challenge, phase: 'find it', timestamp, cheatScore })
  return cheatScore
}

exports.calculateFixItCheatScore = async (challenge: Challenge) => {
  const timestamp = new Date()
  let cheatScore = 0

  const { fixes } = await readFixes(challenge.key)
  const minutesExpectedToSolve = Math.floor(fixes.length / 2)
  const minutesSincePreviousSolve = (timestamp.getTime() - previous().timestamp.getTime()) / 60000
  cheatScore += Math.max(0, 1 - (minutesSincePreviousSolve / minutesExpectedToSolve))

  logger.info(`Cheat score for "Fix it" phase of ${colors.cyan(challenge.key)} solved in ${Math.round(minutesSincePreviousSolve)}min (expected ~${minutesExpectedToSolve}min): ${cheatScore < 0.33 ? colors.green(cheatScore) : (cheatScore < 0.66 ? colors.yellow(cheatScore) : colors.red(cheatScore))}`)
  solves.push({ challenge, phase: 'fix it', timestamp, cheatScore })
  return cheatScore
}

exports.totalCheatScore = () => {
  return solves.length > 1 ? solves.map(({ cheatScore }) => cheatScore).reduce((sum, score) => { return sum + score }) / (solves.length - 1) : 0
}

function areCoupled (challenge: Challenge, previousChallenge: Challenge) {
  // @ts-expect-error
  return coupledChallenges[challenge.key]?.indexOf(previousChallenge.key) > -1 || coupledChallenges[previousChallenge.key]?.indexOf(challenge.key) > -1
}

function isTrivial (challenge: Challenge) {
  return trivialChallenges.includes(challenge.key)
}

function previous () {
  return solves[solves.length - 1]
}
