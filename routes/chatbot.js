/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const { Bot } = require('juicy-chat-bot')
const insecurity = require('../lib/insecurity')
const jwt = require('jsonwebtoken')
const utils = require('../lib/utils')
const config = require('config')
const fs = require('fs')

const trainingSet = fs.readFileSync(`data/BotTrainingData/${config.get('application.chatBot.trainingData')}`)

const bot = new Bot(config.get('application.chatBot.name'), config.get('application.chatBot.greeting'), trainingSet)
bot.train()

module.exports.bot = bot

module.exports.status = function test () {
  return async (req, res, next) => {
    res.status(200).json({
      status: bot.training.state
    })
  }
}

module.exports.process = function respond () {
  return async (req, res, next) => {
    const token = utils.jwtFrom(req) || req.cookies.token
    if (!bot.training.state || !token) {
      res.status(400).json({
        error: 'Unauthenticated user'
      })
      return
    }

    const user = await new Promise((resolve, reject) => {
      jwt.verify(token, insecurity.publicKey, (err, decoded) => {
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

    const username = user.username || user.email.split('@')[0]

    if (!bot.factory.run(`currentUser('${user.id}')`)) {
      bot.addUser(`${user.id}`, username)
      res.status(200).json({
        action: 'response',
        body: bot.greet()
      })
      return
    }

    if (bot.factory.run(`currentUser('${user.id}')`) && bot.factory.run(`currentUser('${user.id}')`) !== username) {
      bot.addUser(`${user.id}`, username)
    }

    if (!req.body.query) {
      res.status(200).json({
        action: 'response',
        body: bot.greet()
      })
      return
    }

    const response = await bot.respond(req.body.query, user.id)
    res.status(200).json(response)
  }
}
