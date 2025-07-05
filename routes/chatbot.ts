/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs from 'node:fs/promises'
import { type Request, type Response, type NextFunction } from 'express'
import { type User } from '../data/types'
import { UserModel } from '../models/user'
import jwt, { type JwtPayload, type VerifyErrors } from 'jsonwebtoken'
import * as challengeUtils from '../lib/challengeUtils'
import logger from '../lib/logger'
import config from 'config'
import download from 'download'
import * as utils from '../lib/utils'
import { isString } from 'lodash'
import { Bot } from 'juicy-chat-bot'
import validateChatBot from '../lib/startup/validateChatBot'
import * as security from '../lib/insecurity'
import * as botUtils from '../lib/botUtils'
import { challenges } from '../data/datacache'

let trainingFile = config.get<string>('application.chatBot.trainingData')
let testCommand: string
export let bot: Bot | null = null

export async function initializeChatbot () {
  if (utils.isUrl(trainingFile)) {
    const file = utils.extractFilename(trainingFile)
    const data = await download(trainingFile)
    await fs.writeFile('data/chatbot/' + file, data)
  }

  await fs.copyFile(
    'data/static/botDefaultTrainingData.json',
    'data/chatbot/botDefaultTrainingData.json'
  )

  trainingFile = utils.extractFilename(trainingFile)
  const trainingSet = await fs.readFile(`data/chatbot/${trainingFile}`, 'utf8')
  validateChatBot(JSON.parse(trainingSet))

  testCommand = JSON.parse(trainingSet).data[0].utterances[0]
  bot = new Bot(config.get('application.chatBot.name'), config.get('application.chatBot.greeting'), trainingSet, config.get('application.chatBot.defaultResponse'))
  return bot.train()
}

void initializeChatbot()

async function processQuery (user: User, req: Request, res: Response, next: NextFunction) {
  if (bot == null) {
    res.status(503).send()
    return
  }
  const username = user.username
  if (!username) {
    res.status(200).json({
      action: 'namequery',
      body: 'I\'m sorry I didn\'t get your name. What shall I call you?'
    })
    return
  }

  if (!bot.factory.run(`currentUser('${user.id}')`)) {
    try {
      bot.addUser(`${user.id}`, username)
      res.status(200).json({
        action: 'response',
        body: bot.greet(`${user.id}`)
      })
    } catch (err) {
      next(new Error('Blocked illegal activity by ' + req.socket.remoteAddress))
    }
    return
  }

  if (bot.factory.run(`currentUser('${user.id}')`) !== username) {
    bot.addUser(`${user.id}`, username)
    try {
      bot.addUser(`${user.id}`, username)
    } catch (err) {
      next(new Error('Blocked illegal activity by ' + req.socket.remoteAddress))
      return
    }
  }

  if (!req.body.query) {
    res.status(200).json({
      action: 'response',
      body: bot.greet(`${user.id}`)
    })
    return
  }

  try {
    const response = await bot.respond(req.body.query, `${user.id}`)
    if (response.action === 'function') {
      // @ts-expect-error FIXME unclean usage of any type as index
      if (response.handler && botUtils[response.handler]) {
        // @ts-expect-error FIXME unclean usage of any type as index
        res.status(200).json(await botUtils[response.handler](req.body.query, user))
      } else {
        res.status(200).json({
          action: 'response',
          body: config.get('application.chatBot.defaultResponse')
        })
      }
    } else {
      res.status(200).json(response)
    }
  } catch (err) {
    try {
      await bot.respond(testCommand, `${user.id}`)
      res.status(200).json({
        action: 'response',
        body: config.get('application.chatBot.defaultResponse')
      })
    } catch (err) {
      challengeUtils.solveIf(challenges.killChatbotChallenge, () => { return true })
      res.status(200).json({
        action: 'response',
        body: `Remember to stay hydrated while I try to recover from "${utils.getErrorMessage(err)}"...`
      })
    }
  }
}

async function setUserName (user: User, req: Request, res: Response) {
  if (bot == null) {
    return
  }
  try {
    const userModel = await UserModel.findByPk(user.id)
    if (userModel == null) {
      res.status(401).json({
        status: 'error',
        error: 'Unknown user'
      })
      return
    }
    // Validate and sanitize username to mitigate persistent XSS
    const rawUsername = req.body.query
    if (!isString(rawUsername)) {
      res.status(400).json({
        status: 'error',
        error: 'Invalid username type'
      })
      return
    }
    const sanitizedUsername = rawUsername
      .replace(/[<>"'`/\\]/g, '') // strip common XSS vectors
      .trim()
    // Enforce allowed characters and reasonable length
    if (
      sanitizedUsername.length < 3 ||
      sanitizedUsername.length > 30 ||
      !/^[\w .\-@]+$/.test(sanitizedUsername)
    ) {
      res.status(400).json({
        status: 'error',
        error: 'Username must be 3-30 characters and contain only letters, numbers, spaces, and .-@_'
      })
      return
    }
    const updatedUser = await userModel.update({ username: sanitizedUsername })
    const updatedUserResponse = utils.queryResultToJson(updatedUser)
    const updatedToken = security.authorize(updatedUserResponse)
    security.authenticatedUsers.put(updatedToken, updatedUserResponse)
    bot.addUser(`${updatedUser.id}`, sanitizedUsername)
    res.status(200).json({
      action: 'response',
      body: bot.greet(`${updatedUser.id}`),
      token: updatedToken
    })
  } catch (err) {
    logger.error(`Could not set username: ${utils.getErrorMessage(err)}`)
    res.status(500).send()
  }
}

export const status = function status () {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (bot == null) {
      res.status(200).json({
        status: false,
        body: `${config.get<string>('application.chatBot.name')} isn't ready at the moment, please wait while I set things up`
      })
      return
    }
    const token = req.cookies.token || utils.jwtFrom(req)
    if (!token) {
      res.status(200).json({
        status: bot.training.state,
        body: `Hi, I can't recognize you. Sign in to talk to ${config.get<string>('application.chatBot.name')}`
      })
      return
    }

    const user = await getUserFromJwt(token)
    if (user == null) {
      res.status(401).json({
        error: 'Unauthenticated user'
      })
      return
    }

    const username = user.username

    if (!username) {
      res.status(200).json({
        action: 'namequery',
        body: 'I\'m sorry I didn\'t get your name. What shall I call you?'
      })
      return
    }

    try {
      bot.addUser(`${user.id}`, username)
      res.status(200).json({
        status: bot.training.state,
        body: bot.training.state ? bot.greet(`${user.id}`) : `${config.get<string>('application.chatBot.name')} isn't ready at the moment, please wait while I set things up`
      })
    } catch (err) {
      next(new Error('Blocked illegal activity by ' + req.socket.remoteAddress))
    }
  }
}

export function process () {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (bot == null) {
      res.status(200).json({
        action: 'response',
        body: `${config.get<string>('application.chatBot.name')} isn't ready at the moment, please wait while I set things up`
      })
    }
    const token = req.cookies.token || utils.jwtFrom(req)
    if (!token) {
      res.status(400).json({
        error: 'Unauthenticated user'
      })
      return
    }

    const user = await getUserFromJwt(token)
    if (user == null) {
      res.status(401).json({
        error: 'Unauthenticated user'
      })
      return
    }

    if (req.body.action === 'query') {
      await processQuery(user, req, res, next)
    } else if (req.body.action === 'setname') {
      await setUserName(user, req, res)
    }
  }
}

async function getUserFromJwt (token: string): Promise<User | null> {
  return await new Promise((resolve) => {
    jwt.verify(token, security.publicKey, (err: VerifyErrors | null, decoded: JwtPayload | string | undefined) => {
      if (err !== null || !decoded || isString(decoded)) {
        resolve(null)
      } else {
        // Strictly validate decoded.data fields against expected User object structure
        const userData = decoded.data
        if (
          userData &&
          typeof userData === "object" &&
          typeof userData.id === "number" &&
          typeof userData.email === "string" &&
          typeof userData.role === "string" &&
          typeof userData.username === "string"
        ) {
          // Return only safe, whitelisted fields
          resolve({
            id: userData.id,
            email: userData.email,
            role: userData.role,
            username: userData.username
          })
        } else {
          resolve(null)
        }
      }
    })
  })
}
