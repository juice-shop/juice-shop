/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs = require('fs')
import { Request, Response, NextFunction } from 'express'
import models = require('../models/index')
import { User } from '../data/types'
import logger from '../lib/logger'

const { Bot } = require('juicy-chat-bot')
const security = require('../lib/insecurity')
const jwt = require('jsonwebtoken')
const utils = require('../lib/utils')
const botUtils = require('../lib/botUtils')
const config = require('config')
const download = require('download')
const challenges = require('../data/datacache').challenges

let trainingFile = config.get('application.chatBot.trainingData')
let testCommand: string, bot: any

async function initialize () {
  if (utils.isUrl(trainingFile)) {
    const file = utils.extractFilename(trainingFile)
    const data = await download(trainingFile)
    fs.writeFileSync('data/chatbot/' + file, data)
  }

  fs.copyFileSync(
    'data/static/botDefaultTrainingData.json',
    'data/chatbot/botDefaultTrainingData.json'
  )

  trainingFile = utils.extractFilename(trainingFile)
  const trainingSet = fs.readFileSync(`data/chatbot/${trainingFile}`, 'utf8')
  require('../lib/startup/validateChatBot')(JSON.parse(trainingSet))

  testCommand = JSON.parse(trainingSet).data[0].utterances[0]
  bot = new Bot(config.get('application.chatBot.name'), config.get('application.chatBot.greeting'), trainingSet, config.get('application.chatBot.defaultResponse'))
  return bot.train()
}

void initialize()

async function processQuery (user: User, req: Request, res: Response) {
  const username = user.username
  if (!username) {
    res.status(200).json({
      action: 'namequery',
      body: 'I\'m sorry I didn\'t get your name. What shall I call you?'
    })
    return
  }

  if (!bot.factory.run(`currentUser('${user.id}')`)) {
    bot.addUser(`${user.id}`, username)
    res.status(200).json({
      action: 'response',
      body: bot.greet(`${user.id}`)
    })
    return
  }

  if (bot.factory.run(`currentUser('${user.id}')`) !== username) {
    bot.addUser(`${user.id}`, username)
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
      utils.solveIf(challenges.killChatbotChallenge, () => { return true })
      res.status(200).json({
        action: 'response',
        body: 'Oh no... Remember to stay hydrated when I\'m gone...'
      })
    }
  }
}

function setUserName (user: User, req: Request, res: Response) {
  models.User.findByPk(user.id).then((user: User) => {
    void user.update({ username: req.body.query }).then((updatedUser: User) => {
      updatedUser = utils.queryResultToJson(updatedUser)
      const updatedToken = security.authorize(updatedUser)
      security.authenticatedUsers.put(updatedToken, updatedUser)
      bot.addUser(`${updatedUser.id}`, req.body.query)
      res.status(200).json({
        action: 'response',
        body: bot.greet(`${updatedUser.id}`),
        token: updatedToken
      })
    }).catch((err: unknown) => {
      logger.error(`Could not set username: ${utils.getErrorMessage(err)}`)
    })
  })
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
      const user: User = await new Promise((resolve, reject) => {
        jwt.verify(token, security.publicKey, (err, decoded) => {
          if (err !== null) {
            res.status(401).json({
              error: 'Unauthenticated user'
            })
          } else {
            resolve(decoded.data)
          }
        })
      })

      if (!user) {
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

      bot.addUser(`${user.id}`, username)

      res.status(200).json({
        status: bot.training.state,
        body: bot.training.state ? bot.greet(`${user.id}`) : `${config.get('application.chatBot.name')} isn't ready at the moment, please wait while I set things up`
      })
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

    const user: User = await new Promise((resolve, reject) => {
      jwt.verify(token, security.publicKey, (err, decoded) => {
        if (err !== null) {
          res.status(401).json({
            error: 'Unauthenticated user'
          })
        } else {
          resolve(decoded.data)
        }
      })
    })

    if (!user) {
      return
    }

    if (req.body.action === 'query') {
      await processQuery(user, req, res)
    } else if (req.body.action === 'setname') {
      setUserName(user, req, res)
    }
  }
}
