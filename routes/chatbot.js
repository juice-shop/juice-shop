/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const { Bot } = require('../../juicy-chat-bot/index')
const insecurity = require('../lib/insecurity')
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges

const trainingSet = {
  lang: 'en',
  intents: [
    {
    question: 'goodbye for now',
    intent: 'greetings.bye'
    },
    {
    question: 'bye bye take care',
    intent: 'greetings.bye'
    },
    {
    question: 'hello',
    intent: 'greetings.hello'
    },
    {
    question: 'hi',
    intent: 'greetings.hello'
    },
    {
    question: 'howdy',
    intent: 'greetings.hello'
    }
  ],
  answers: [
    {
    intent: 'greetings.bye',
    answer: 'Ok Cya'
    },
    {
    intent: 'greetings.hello',
    answer: 'Hello there <customer-name>!'
    }
  ]
  }

const bot = new Bot('Jeff', 'Ma Nemma <bot-name>', JSON.stringify(trainingSet))
bot.train()

module.exports.status = function test () {
  return async (req, res, next) => {
    const token = utils.jwtFrom(req) || req.cookies.token
    const user = insecurity.authenticatedUsers.tokenMap[token].data
    res.status(200).json({
      status: bot.training.state,
    })
  }
}

module.exports.process = function respond () {
  return async (req, res, next) => {
    const token = utils.jwtFrom(req) || req.cookies.token
    if (!bot.training.state || !token) {
      res.status(400)
      return
    }

    const user = insecurity.authenticatedUsers.tokenMap[token].data
    if (!bot.factory.run(`currentUser('${user.id}')`)) {
      bot.addUser(`${user.id}`, user.username)
      res.status(200).json({
        action: 'response',
        body: bot.greet(),
      })
      return
    }

    if (!req.body.query) {
      res.status(200).json({
        action: 'response',
        body: bot.greet(),
      })
      return 
    }

    const response = await bot.respond(req.body.query, user.id)
    res.status(200).json(response)
  }
}
