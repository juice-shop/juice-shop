/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
import packageJson from '../package.json'
import { Op } from 'sequelize'
import fs = require('fs')
import {ChallengeModel} from '../models/challenge'

const colors = require('colors/safe')
const notifications = require('../data/datacache').notifications
const challenges = require('../data/datacache').challenges
const sanitizeHtml = require('sanitize-html')
const jsSHA = require('jssha')
const Entities = require('html-entities').AllHtmlEntities
const config = require('config')
const entities = new Entities()
const download = require('download')
const crypto = require('crypto')
const clarinet = require('clarinet')
const isDocker = require('is-docker')
const isHeroku = require('is-heroku')
const isWindows = require('is-windows')
const logger = require('./logger')
const webhook = require('./webhook')
const antiCheat = require('./antiCheat')
const accuracy = require('./accuracy')

const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

let ctfKey: string
if (process.env.CTF_KEY !== undefined && process.env.CTF_KEY !== '') {
  ctfKey = process.env.CTF_KEY
} else {
  fs.readFile('ctf.key', 'utf8', (err, data) => {
    if (err != null) {
      throw err
    }
    ctfKey = data
  })
}

export const queryResultToJson = (data: any, status: string = 'success') => {
  let wrappedData: any = {}
  if (data) {
    if (!data.length && data.dataValues) {
      wrappedData = data.dataValues
    } else if (data.length > 0) {
      wrappedData = []
      for (let i = 0; i < data.length; i++) {
        wrappedData.push(data[i]?.dataValues ? data[i].dataValues : data[i])
      }
    } else {
      wrappedData = data
    }
  }
  return {
    status,
    data: wrappedData
  }
}

export const isUrl = (url: string) => {
  return startsWith(url, 'http')
}

export const startsWith = (str: string, prefix: string) => str ? str.indexOf(prefix) === 0 : false

export const endsWith = (str: string, suffix: string) => str ? str.includes(suffix, str.length - suffix.length) : false

export const contains = (str: string, element: string) => str ? str.includes(element) : false // TODO Inline all usages as this function is not adding any functionality to String.includes

export const containsEscaped = function (str: string, element: string) {
  return contains(str, element.replace(/"/g, '\\"'))
}

export const containsOrEscaped = function (str: string, element: string) {
  return contains(str, element) || containsEscaped(str, element)
}

export const unquote = function (str: string) {
  if (str && startsWith(str, '"') && endsWith(str, '"')) {
    return str.substring(1, str.length - 1)
  } else {
    return str
  }
}

export const trunc = function (str: string, length: number) {
  str = str.replace(/(\r\n|\n|\r)/gm, '')
  return (str.length > length) ? str.substr(0, length - 1) + '...' : str
}

export const version = (module: string) => {
  if (module) {
    return packageJson.dependencies[module]
  } else {
    return packageJson.version
  }
}

export const ctfFlag = (text: string) => {
  const shaObj = new jsSHA('SHA-1', 'TEXT') // eslint-disable-line new-cap
  shaObj.setHMACKey(ctfKey, 'TEXT')
  shaObj.update(text)
  return shaObj.getHMAC('HEX')
}

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
        webhook.notify(solvedChallenge, cheatScore).catch((error) => {
          logger.error('Webhook notification failed: ' + colors.red(error.message))
        })
      }
    }
  })
}

export const sendNotification = function (challenge: { difficulty?: number, key: any, name: any, description?: any }, isRestore: boolean) {
  if (!notSolved(challenge)) {
    const flag = ctfFlag(challenge.name)
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

export const toMMMYY = (date: Date) => {
  const month = date.getMonth()
  const year = date.getFullYear()
  return months[month] + year.toString().substring(2, 4)
}

export const toISO8601 = (date: Date) => {
  let day = '' + date.getDate()
  let month = '' + (date.getMonth() + 1)
  const year = date.getFullYear()

  if (month.length < 2) month = '0' + month
  if (day.length < 2) day = '0' + day

  return [year, month, day].join('-')
}

export const extractFilename = (url: string) => {
  let file = decodeURIComponent(url.substring(url.lastIndexOf('/') + 1))
  if (this.contains(file, '?')) {
    file = file.substring(0, file.indexOf('?'))
  }
  return file
}

export const downloadToFile = async (url: string, dest: string) => {
  return download(url).then((data: string | Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array | BigUint64Array | BigInt64Array | Float32Array | Float64Array | DataView) => {
    fs.writeFileSync(dest, data)
  }).catch((err: Error) => {
    logger.warn('Failed to download ' + url + ' (' + err.statusMessage + ')')
  })
}

export const jwtFrom = ({ headers }: { headers: any}) => {
  if (headers?.authorization) {
    const parts = headers.authorization.split(' ')
    if (parts.length === 2) {
      const scheme = parts[0]
      const token = parts[1]

      if (/^Bearer$/i.test(scheme)) {
        return token
      }
    }
  }
  return undefined
}

export const randomHexString = (length: number) => {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length)
}

export const disableOnContainerEnv = () => {
  return (isDocker() || isHeroku) && !config.get('challenges.safetyOverride')
}

export const disableOnWindowsEnv = () => {
  return isWindows()
}

export const determineDisabledEnv = (disabledEnv: string | string[] | undefined) => {
  if (isDocker()) {
    return disabledEnv && (disabledEnv === 'Docker' || disabledEnv.includes('Docker')) ? 'Docker' : null
  } else if (isHeroku) {
    return disabledEnv && (disabledEnv === 'Heroku' || disabledEnv.includes('Heroku')) ? 'Heroku' : null
  } else if (isWindows()) {
    return disabledEnv && (disabledEnv === 'Windows' || disabledEnv.includes('Windows')) ? 'Windows' : null
  }
  return null
}

export const parseJsonCustom = (jsonString: string) => {
  const parser = clarinet.parser()
  const result: any[] = []
  parser.onkey = parser.onopenobject = (k: any) => {
    result.push({ key: k, value: null })
  }
  parser.onvalue = (v: any) => {
    result[result.length - 1].value = v
  }
  parser.write(jsonString).close()
  return result
}

export const toSimpleIpAddress = (ipv6: string) => {
  if (startsWith(ipv6, '::ffff:')) {
    return ipv6.substr(7)
  } else if (ipv6 === '::1') {
    return '127.0.0.1'
  } else {
    return ipv6
  }
}

export const thaw = (frozenObject: any) => {
  return JSON.parse(JSON.stringify(frozenObject))
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

export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message
  return String(error)
}
