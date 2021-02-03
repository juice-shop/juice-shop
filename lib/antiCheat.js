/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const colors = require('colors/safe')
const logger = require('../lib/logger')
const config = require('config')

const solves = []

exports.calculateCheatScore = (challenge) => {
  const timestamp = new Date()
  let cheatScore = 0
  if (solves.length > 0) {
    // 0. calculate expected minimum time needed for challenge based on difficulty and hint availability
    const hintFactor = config.get('challenges.showHints') ? 2 : 3
    const minutesExpectedToSolve = challenge.difficulty * hintFactor
    // 1. suspiciously short time difference between this and the previously solved challenge
    const minutesSincePreviousSolve = (timestamp.getTime() - solves[solves.length - 1].timestamp.getTime()) / 60000
    cheatScore += Math.max(0, 1 - (minutesSincePreviousSolve / minutesExpectedToSolve))
    // 2. tutorial challenges are never considered cheated when hacking instructor is turned on
    if (challenge.tutorialOrder && config.get('hackingInstructor.isEnabled')) {
      cheatScore = 0
    }
    logger.info(`Cheat score for ${challenge.tutorialOrder ? 'tutorial ' : ''}${colors.cyan(challenge.key)} solved in ${Math.round(minutesSincePreviousSolve)} / ${minutesExpectedToSolve} minutes with${config.get('challenges.showHints') ? '' : 'out'} hints allowed: ${cheatScore < 0.33 ? colors.green(cheatScore) : (cheatScore < 0.66 ? colors.yellow(cheatScore) : colors.red(cheatScore))}`)
  }
  solves.push({ challenge, timestamp, cheatScore })
  return cheatScore
}

exports.totalCheatScore = () => {
  return solves.length > 0 ? solves.map(({ cheatScore }) => cheatScore).reduce((sum, score) => { return sum + score }) / solves.length : 0
}
