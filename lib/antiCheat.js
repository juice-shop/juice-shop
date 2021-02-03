/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const colors = require('colors/safe')
const logger = require('../lib/logger')
const config = require('config')

const solves = [{ timestamp: new Date(), cheatScore: 0 }] // seed with server start timestamp

// TODO prevent multi-solves (e.g. login admin + weak password or in general improper error handling) from same request counting as cheating
// TODO prevent near-identical challenges (e.g. all null byte file access or dom xss + bonus payload etc.) from counting as cheating (e.g. declare clusters of schallenges? Could also work for multi-solves?)
exports.calculateCheatScore = (challenge) => {
  const timestamp = new Date()
  let cheatScore = 0
  let timeFactor = 2
  timeFactor *= (config.get('challenges.showHints') ? 1 : 1.5)
  timeFactor *= (challenge.tutorialOrder && config.get('hackingInstructor.isEnabled') ? 0.5 : 1)

  const minutesExpectedToSolve = challenge.difficulty * timeFactor
  const minutesSincePreviousSolve = (timestamp.getTime() - solves[solves.length - 1].timestamp.getTime()) / 60000
  cheatScore += Math.max(0, 1 - (minutesSincePreviousSolve / minutesExpectedToSolve))

  logger.info(`Cheat score for ${challenge.tutorialOrder ? 'tutorial ' : ''}${colors.cyan(challenge.key)} solved in ${Math.round(minutesSincePreviousSolve)} / ${minutesExpectedToSolve} minutes with${config.get('challenges.showHints') ? '' : 'out'} hints allowed: ${cheatScore < 0.33 ? colors.green(cheatScore) : (cheatScore < 0.66 ? colors.yellow(cheatScore) : colors.red(cheatScore))}`)
  solves.push({ challenge, timestamp, cheatScore })
  return cheatScore
}

exports.totalCheatScore = () => {
  return solves.length > 0 ? solves.map(({ cheatScore }) => cheatScore).reduce((sum, score) => { return sum + score }) / (solves.length - 1) : 0
}
