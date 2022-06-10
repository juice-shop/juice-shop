import { Op } from 'sequelize'
import { ChallengeModel } from '../models/challenge'

const colors = require('colors/safe')
const config = require('config')
const challenges = require('../data/datacache').challenges
const notifications = require('../data/datacache').notifications
const sanitizeHtml = require('sanitize-html')
const Entities = require('html-entities').AllHtmlEntities
const entities = new Entities()
const webhook = require('./webhook')
const antiCheat = require('./antiCheat')
const accuracy = require('./accuracy')
const utils = require('./utils')
const logger = require('./logger')

export const solveIf = function (challenge: any, criteria: () => any, isRestore: boolean = false) {
  if (notSolved(challenge) && criteria()) {
    solve(challenge, isRestore)
  }
}

export const solve = function (challenge: any, isRestore = false) {
  challenge.solved = true
  challenge.save().then((solvedChallenge: { difficulty: number, key: string, name: string }) => {
    logger.info(`${isRestore ? colors.grey('Restored') : colors.green('Solved')} ${solvedChallenge.difficulty}-star ${colors.cyan(solvedChallenge.key)} (${solvedChallenge.name})`)
    sendNotification(solvedChallenge, isRestore)
    if (!isRestore) {
      const cheatScore = antiCheat.calculateCheatScore(challenge)
      if (process.env.SOLUTIONS_WEBHOOK) {
        webhook.notify(solvedChallenge, cheatScore).catch((error: unknown) => {
          logger.error('Webhook notification failed: ' + colors.red(utils.getErrorMessage(error)))
        })
      }
    }
  })
}

export const sendNotification = function (challenge: { difficulty?: number, key: any, name: any, description?: any }, isRestore: boolean) {
  if (!notSolved(challenge)) {
    const flag = utils.ctfFlag(challenge.name)
    const notification = {
      key: challenge.key,
      name: challenge.name,
      challenge: challenge.name + ' (' + entities.decode(sanitizeHtml(challenge.description, { allowedTags: [], allowedAttributes: [] })) + ')',
      flag: flag,
      hidden: !config.get('challenges.showSolvedNotifications'),
      isRestore: isRestore
    }
    const wasPreviouslyShown = notifications.find(({ key }: { key: string }) => key === challenge.key) !== undefined
    notifications.push(notification)

    if (global.io && (isRestore || !wasPreviouslyShown)) {
      // @ts-expect-error
      global.io.emit('challenge solved', notification)
    }
  }
}

export const notSolved = (challenge: any) => challenge && !challenge.solved

export const findChallengeByName = (challengeName: string) => {
  for (const c in challenges) {
    if (Object.prototype.hasOwnProperty.call(challenges, c)) {
      if (challenges[c].name === challengeName) {
        return challenges[c]
      }
    }
  }
  logger.warn('Missing challenge with name: ' + challengeName)
}

export const findChallengeById = (challengeId: number) => {
  for (const c in challenges) {
    if (Object.prototype.hasOwnProperty.call(challenges, c)) {
      if (challenges[c].id === challengeId) {
        return challenges[c]
      }
    }
  }
  logger.warn('Missing challenge with id: ' + challengeId)
}

export const solveFindIt = async function (key: string, isRestore: boolean) {
  const solvedChallenge = challenges[key]
  await ChallengeModel.update({ codingChallengeStatus: 1 }, { where: { key, codingChallengeStatus: { [Op.lt]: 2 } } })
  logger.info(`${isRestore ? colors.grey('Restored') : colors.green('Solved')} 'Find It' phase of coding challenge ${colors.cyan(solvedChallenge.key)} (${solvedChallenge.name})`)
  if (!isRestore) {
    accuracy.storeFindItVerdict(solvedChallenge.key, true)
    accuracy.calculateFindItAccuracy(solvedChallenge.key)
    antiCheat.calculateFindItCheatScore(solvedChallenge)
  }
}

export const solveFixIt = async function (key: string, isRestore: boolean) {
  const solvedChallenge = challenges[key]
  await ChallengeModel.update({ codingChallengeStatus: 2 }, { where: { key } })
  logger.info(`${isRestore ? colors.grey('Restored') : colors.green('Solved')} 'Fix It' phase of coding challenge ${colors.cyan(solvedChallenge.key)} (${solvedChallenge.name})`)
  if (!isRestore) {
    accuracy.storeFixItVerdict(solvedChallenge.key, true)
    accuracy.calculateFixItAccuracy(solvedChallenge.key)
    antiCheat.calculateFixItCheatScore(solvedChallenge)
  }
}
