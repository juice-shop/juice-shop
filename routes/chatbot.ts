/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs from 'fs/promises'
import { Request, Response, NextFunction } from 'express'
import { User } from '../data/types'
import { UserModel } from '../models/user'
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken'
import challengeUtils = require('../lib/challengeUtils')
import logger from '../lib/logger'
import config from 'config'
import download from 'download'
import * as utils from '../lib/utils'
import { isString } from 'lodash'

const { Bot } = require('juicy-chat-bot')
const security = require('../lib/insecurity')
const botUtils = require('../lib/botUtils')
const challenges = require('../data/datacache').challenges

let trainingFile = config.get<string>('application.chatBot.trainingData')
let testCommand: string, bot: any

async function initialize () {
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
  require('../lib/startup/validateChatBot')(JSON.parse(trainingSet))

  testCommand = JSON.parse(trainingSet).data[0].utterances[0]
  bot = new Bot(config.get('application.chatBot.name'), config.get('application.chatBot.greeting'), trainingSet, config.get('application.chatBot.defaultResponse'))
  return bot.train()
}

void initialize()

async function processQuery (user: User, req: Request, res: Response, next: NextFunction) {
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
    const response = await bot.respond(req.body.query, user.id)
    if (response.action === 'function') {
      if (response.handler && botUtils[response.handler]) {
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
      await bot.respond(testCommand, user.id)
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
  try {
    const userModel = await UserModel.findByPk(user.id)
    if (!userModel) {
      res.status(401).json({
        status: 'error',
        error: 'Unknown user'
      })
      return
    }
    const updatedUser = await userModel.update({ username: req.body.query })
    const updatedToken = security.authorize(updatedUser)
    security.authenticatedUsers.put(updatedToken, utils.queryResultToJson(updatedUser))
    bot.addUser(`${updatedUser.id}`, req.body.query)
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

module.exports.initialize = initialize

module.exports.bot = bot

module.exports.status = function status () {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!bot) {
      res.status(200).json({
        status: false,
        body: `${config.get('application.chatBot.name')} isn't ready at the moment, please wait while I set things up`
      })
      return
    }
    const token = req.cookies.token || utils.jwtFrom(req)
    if (token) {
      const user = await getUserFromJwt(token)
      if (!user) {
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
          body: bot.training.state ? bot.greet(`${user.id}`) : `${config.get('application.chatBot.name')} isn't ready at the moment, please wait while I set things up`
        })
      } catch (err) {
        next(new Error('Blocked illegal activity by ' + req.socket.remoteAddress))
      }
      return
    }

    res.status(200).json({
      status: bot.training.state,
      body: `Hi, I can't recognize you. Sign in to talk to ${config.get('application.chatBot.name')}`
    })
  }
}

module.exports.process = function respond () {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!bot) {
      res.status(200).json({
        action: 'response',
        body: `${config.get('application.chatBot.name')} isn't ready at the moment, please wait while I set things up`
      })
    }
    const token = req.cookies.token || utils.jwtFrom(req)
    if (!bot.training.state || !token) {
      res.status(400).json({
        error: 'Unauthenticated user'
      })
      return
    }

    const user = await getUserFromJwt(token)
    if (!user) {
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
        resolve(decoded.data)
      }
    })
  })
}
