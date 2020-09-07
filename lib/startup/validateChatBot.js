/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const config = require('config')
const colors = require('colors/safe')
const logger = require('../logger')

const validateChatBot = ({ trainingData, exitOnFailure = true } = {}) => {
  let success = true
  // TODO Check that queries.couponCode exists <and> contains a function handler "couponCode"
  // TODO Check that queries.productPrice exists <and> contains a function handler "productPrice"
  // TODO Check that queries.functionTest exists <and> contains a function handler "testFunction"
  if (success) {
    logger.info(`Chatbot training data ${colors.bold(config.get('application.chatBot.trainingData'))} validated (${colors.green('OK')})`)
  } else {
    logger.warn(`Chatbot training data ${colors.bold(config.get('application.chatBot.trainingData'))} validated (${colors.red('NOT OK')})`)
    logger.warn(`Visit ${colors.yellow('https://pwning.owasp-juice.shop/appendix/chatbot.html')} for the training data schema definition.`)
    if (exitOnFailure) {
      logger.error(colors.red('Exiting due to configuration errors!'))
      process.exit(1)
    }
  }
  return success
}

module.exports = validateChatBot
