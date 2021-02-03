/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const colors = require('colors/safe')
const logger = require('../lib/logger')
const config = require('config')

const solves = []

exports.calculateCheatScore = (challenge) => { // FIXME prevent multi-solves (e.g. login admin + weak password) from counting as cheating
  const timestamp = new Date()
  let cheatScore = 0
  if (solves.length > 0) {
    let timeFactor = 2
    timeFactor *= (config.get('challenges.showHints') ? 1 : 1.5)
    timeFactor *= (challenge.tutorialOrder && config.get('hackingInstructor.isEnabled') ? 0.5 : 1)

    const minutesExpectedToSolve = challenge.difficulty * timeFactor
    const minutesSincePreviousSolve = (timestamp.getTime() - solves[solves.length - 1].timestamp.getTime()) / 60000
    cheatScore += Math.max(0, 1 - (minutesSincePreviousSolve / minutesExpectedToSolve))

    logger.info(`Cheat score for ${challenge.tutorialOrder ? 'tutorial ' : ''}${colors.cyan(challenge.key)} solved in ${Math.round(minutesSincePreviousSolve)} / ${minutesExpectedToSolve} minutes with${config.get('challenges.showHints') ? '' : 'out'} hints allowed: ${cheatScore < 0.33 ? colors.green(cheatScore) : (cheatScore < 0.66 ? colors.yellow(cheatScore) : colors.red(cheatScore))}`)
  }
  solves.push({ challenge, timestamp, cheatScore })
  return cheatScore
}

exports.totalCheatScore = () => {
  return solves.length > 0 ? solves.map(({ cheatScore }) => cheatScore).reduce((sum, score) => { return sum + score }) / solves.length : 0
}
