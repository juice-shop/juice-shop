/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const colors = require('colors/safe')
const logger = require('./logger')
import config = require('config')

const coupledChallenges = { // TODO prevent also near-identical challenges (e.g. all null byte file access or dom xss + bonus payload etc.) from counting as cheating
  loginAdminChallenge: ['weakPasswordChallenge'],
  nullByteChallenge: ['easterEggLevelOneChallenge', 'forgottenDevBackupChallenge', 'forgottenBackupChallenge', 'misplacedSignatureFileChallenge'],
  deprecatedInterfaceChallenge: ['uploadTypeChallenge', 'xxeFileDisclosureChallenge', 'xxeDosChallenge'],
  uploadSizeChallenge: ['uploadTypeChallenge', 'xxeFileDisclosureChallenge', 'xxeDosChallenge'],
  uploadTypeChallenge: ['uploadSizeChallenge', 'xxeFileDisclosureChallenge', 'xxeDosChallenge']
}
const trivialChallenges = ['errorHandlingChallenge', 'privacyPolicyChallenge']

const solves = [{ challenge: {}, timestamp: new Date(), cheatScore: 0 }] // seed with server start timestamp

exports.calculateCheatScore = (challenge) => {
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
  solves.push({ challenge, timestamp, cheatScore })
  return cheatScore
}

exports.totalCheatScore = () => {
  return solves.length > 1 ? solves.map(({ cheatScore }) => cheatScore).reduce((sum, score) => { return sum + score }) / (solves.length - 1) : 0
}

function areCoupled (challenge, previousChallenge) {
  return (coupledChallenges[challenge.key] && coupledChallenges[challenge.key].indexOf(previousChallenge.key) > -1) ||
    (coupledChallenges[previousChallenge.key] && coupledChallenges[previousChallenge.key].indexOf(challenge.key) > -1)
}

function isTrivial (challenge) {
  return trivialChallenges.includes(challenge.key)
}

function previous () {
  return solves[solves.length - 1]
}
