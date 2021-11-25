/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const logger = require('./logger')
const colors = require('colors/safe')
const solves = {}

exports.storeFindItVerdict = (challengeKey, verdict: boolean) => {
  storeVerdict(challengeKey, 'find it', verdict)
}

exports.storeFixItVerdict = (challengeKey, verdict: boolean) => {
  storeVerdict(challengeKey, 'fix it', verdict)
}

exports.calculateFindItAccuracy = (challengeKey) => {
  return calculateAccuracy(challengeKey, 'find it')
}

exports.calculateFixItAccuracy = (challengeKey) => {
  return calculateAccuracy(challengeKey, 'fix it')
}

exports.totalFindItAccuracy = () => {
  return totalAccuracy('find it')
}

exports.totalFixItAccuracy = () => {
  return totalAccuracy('fix it')
}

exports.getFindItAttempts = (challengeKey) => {
  return solves[challengeKey] ? solves[challengeKey].attempts['find it'] : 0
}

function totalAccuracy (phase: string) {
  let sumAccuracy = 0
  let totalSolved = 0
  Object.entries(solves).forEach(([key, value]) => {
    if (value[phase]) {
      sumAccuracy += 1 / value.attempts[phase]
      totalSolved++
    }
  })
  return sumAccuracy / totalSolved
}

function calculateAccuracy (challengeKey, phase: string) {
  let accuracy = 0
  if (solves[challengeKey][phase]) {
    accuracy = 1 / solves[challengeKey].attempts[phase]
  }
  logger.info(`Accuracy for '${phase === 'fix it' ? 'Fix It' : 'Find It'}' phase of coding challenge ${colors.cyan(challengeKey)}: ${accuracy > 0.5 ? colors.green(accuracy) : (accuracy > 0.25 ? colors.yellow(accuracy) : colors.red(accuracy))}`)
  return accuracy
}

function storeVerdict (challengeKey, phase: string, verdict: boolean) {
  if (!solves[challengeKey]) {
    solves[challengeKey] = { 'find it': false, 'fix it': false, attempts: { 'find it': 0, 'fix it': 0 } }
  }
  if (!solves[challengeKey][phase]) {
    solves[challengeKey][phase] = verdict
    solves[challengeKey].attempts[phase]++
  }
}
