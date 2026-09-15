import config from 'config'
import { Op } from 'sequelize'
import colors from 'colors/safe'
import { type Server } from 'socket.io'
import sanitizeHtml from 'sanitize-html'
import { AllHtmlEntities as Entities } from 'html-entities'

import { type ChallengeKey, ChallengeModel } from '../models/challenge'
import { challenges, notifications } from '../data/datacache'
import { HintModel } from '../models/hint'
import * as accuracy from './accuracy'
import * as webhook from './webhook'
import * as antiCheat from './antiCheat'
import * as utils from './utils'
import logger from './logger'

const entities = new Entities()

const globalWithSocketIO = global as typeof globalThis & {
  io: Server
}

export const solveIf = function (challenge: any, criteria: () => any, isRestore: boolean = false, isCheating = false) {
  if (notSolved(challenge) && criteria()) {
    solve(challenge, isRestore, isCheating)
  }
}

export const solve = async function (challenge: ChallengeModel, isRestore = false, isCheating = false) {
  challenge.solved = true
  const solvedChallenge = await challenge.save()

  logger.info(`${isRestore ? colors.grey('Restored') : colors.green('Solved')} ${solvedChallenge.difficulty}-star ${colors.cyan(solvedChallenge.key)} (${solvedChallenge.name})`)
  sendNotification(solvedChallenge, isRestore)
  if (!isRestore) {
    const cheatScore = antiCheat.calculateCheatScore(challenge, isCheating)
    const hintsAvailable = await HintModel.count({ where: { ChallengeId: solvedChallenge.id } })
    const hintsUnlocked = await HintModel.count({ where: { ChallengeId: solvedChallenge.id, unlocked: true } })
    if (process.env.SOLUTIONS_WEBHOOK) {
      webhook.notify(solvedChallenge, cheatScore, hintsAvailable, hintsUnlocked).catch((error: unknown) => {
        logger.error('Webhook notification failed: ' + colors.red(utils.getErrorMessage(error)))
      })
    }
  }
}

export const sendNotification = function (challenge: ChallengeModel, isRestore: boolean) {
  if (notSolved(challenge)) {
    return
  }

  const flag = utils.ctfFlag(challenge.name)

  const challengeKey = challenge.key as ChallengeKey
  const fullChallenge = challenges[challengeKey]

  let hasCodingChallenge = false
  if (fullChallenge) {
    hasCodingChallenge = Boolean(fullChallenge.hasCodingChallenge) ?? false
  }

  const notification = {
    key: challenge.key,
    name: challenge.name,
    challenge: challenge.name + ' (' + entities.decode(sanitizeHtml(challenge.description, { allowedTags: [], allowedAttributes: {} })) + ')',
    flag,
    hidden: !config.get('challenges.showSolvedNotifications'),
    isRestore,
    codingChallenge: config.get('challenges.codingChallengesEnabled') !== 'never' && hasCodingChallenge
  }
  const wasPreviouslyShown = notifications.some(({ key }) => key === challenge.key)
  notifications.push(notification)

  if (globalWithSocketIO.io && (isRestore || !wasPreviouslyShown)) {
    globalWithSocketIO.io.emit('challenge solved', notification)
  }
}

export const sendCodingChallengeNotification = function (challenge: { key: string, codingChallengeStatus: 0 | 1 | 2 }) {
  if (challenge.codingChallengeStatus > 0) {
    const notification = {
      key: challenge.key,
      codingChallengeStatus: challenge.codingChallengeStatus
    }
    if (globalWithSocketIO.io) {
      globalWithSocketIO.io.emit('code challenge solved', notification)
    }
  }
}

export const notSolved = (challenge: ChallengeModel) => challenge && !challenge.solved

export const findChallengeByName = (challengeName: string) => {
  for (const challenge of Object.values(challenges)) {
    if (challenge.name === challengeName) {
      return challenge
    }
  }
  logger.warn('Missing challenge with name: ' + challengeName)
}

export const findChallengeById = (challengeId: number) => {
  for (const challenge of Object.values(challenges)) {
    if (challenge.id === challengeId) {
      return challenge
    }
  }
  logger.warn('Missing challenge with id: ' + challengeId)
}

export const solveFindIt = async function (key: ChallengeKey, isRestore: boolean = false) {
  const solvedChallenge = challenges[key]
  await ChallengeModel.update({ codingChallengeStatus: 1 }, { where: { key, codingChallengeStatus: { [Op.lt]: 2 } } })
  logger.info(`${isRestore ? colors.grey('Restored') : colors.green('Solved')} 'Find It' phase of coding challenge ${colors.cyan(solvedChallenge.key)} (${solvedChallenge.name})`)
  if (!isRestore) {
    accuracy.storeFindItVerdict(solvedChallenge.key, true)
    accuracy.calculateFindItAccuracy(solvedChallenge.key)
    await antiCheat.calculateFindItCheatScore(solvedChallenge)
    sendCodingChallengeNotification({ key, codingChallengeStatus: 1 })
  }
}

export const solveFixIt = async function (key: ChallengeKey, isRestore: boolean = false) {
  const solvedChallenge = challenges[key]
  await ChallengeModel.update({ codingChallengeStatus: 2 }, { where: { key } })
  logger.info(`${isRestore ? colors.grey('Restored') : colors.green('Solved')} 'Fix It' phase of coding challenge ${colors.cyan(solvedChallenge.key)} (${solvedChallenge.name})`)
  if (!isRestore) {
    accuracy.storeFixItVerdict(solvedChallenge.key, true)
    accuracy.calculateFixItAccuracy(solvedChallenge.key)
    await antiCheat.calculateFixItCheatScore(solvedChallenge)
    sendCodingChallengeNotification({ key, codingChallengeStatus: 2 })
  }
}
