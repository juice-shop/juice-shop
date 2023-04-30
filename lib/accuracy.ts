/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import logger from './logger'
import colors from 'colors/safe'
const solves: { [key: string]: { 'find it': boolean, 'fix it': boolean, attempts: { 'find it': number, 'fix it': number } } } = {}

type Phase = 'find it' | 'fix it'

export const storeFindItVerdict = (challengeKey: string, verdict: boolean) => {
  storeVerdict(challengeKey, 'find it', verdict)
}

export const storeFixItVerdict = (challengeKey: string, verdict: boolean) => {
  storeVerdict(challengeKey, 'fix it', verdict)
}

export const calculateFindItAccuracy = (challengeKey: string) => {
  return calculateAccuracy(challengeKey, 'find it')
}

export const calculateFixItAccuracy = (challengeKey: string) => {
  return calculateAccuracy(challengeKey, 'fix it')
}

export const totalFindItAccuracy = () => {
  return totalAccuracy('find it')
}

export const totalFixItAccuracy = () => {
  return totalAccuracy('fix it')
}

export const getFindItAttempts = (challengeKey: string) => {
  return solves[challengeKey] ? solves[challengeKey].attempts['find it'] : 0
}

function totalAccuracy (phase: Phase) {
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

function calculateAccuracy (challengeKey: string, phase: Phase) {
  let accuracy = 0
  if (solves[challengeKey][phase]) {
    accuracy = 1 / solves[challengeKey].attempts[phase]
  }
  logger.info(`Accuracy for '${phase === 'fix it' ? 'Fix It' : 'Find It'}' phase of coding challenge ${colors.cyan(challengeKey)}: ${accuracy > 0.5 ? colors.green(accuracy.toString()) : (accuracy > 0.25 ? colors.yellow(accuracy.toString()) : colors.red(accuracy.toString()))}`)
  return accuracy
}

function storeVerdict (challengeKey: string, phase: Phase, verdict: boolean) {
  if (!solves[challengeKey]) {
    solves[challengeKey] = { 'find it': false, 'fix it': false, attempts: { 'find it': 0, 'fix it': 0 } }
  }
  if (!solves[challengeKey][phase]) {
    solves[challengeKey][phase] = verdict
    solves[challengeKey].attempts[phase]++
  }
}
