/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config from 'config'
import logger from '../logger'
import colors from 'colors/safe'
import * as utils from '../utils'

export default function validateChatBot (trainingData: any, exitOnFailure = true) {
  let success = true
  success = checkIntentWithFunctionHandlerExists(trainingData, 'queries.couponCode', 'couponCode') && success
  success = checkIntentWithFunctionHandlerExists(trainingData, 'queries.productPrice', 'productPrice') && success
  success = checkIntentWithFunctionHandlerExists(trainingData, 'queries.functionTest', 'testFunction') && success
  if (success) {
    logger.info(`Chatbot training data ${colors.bold(utils.extractFilename(config.get('application.chatBot.trainingData')))} validated (${colors.green('OK')})`)
  } else {
    logger.warn(`Chatbot training data ${colors.bold(utils.extractFilename(config.get('application.chatBot.trainingData')))} validated (${colors.red('NOT OK')})`)
    logger.warn(`Visit ${colors.yellow('https://pwning.owasp-juice.shop/companion-guide/latest/part5/chatbot.html')} for the training data schema definition.`)
    if (exitOnFailure) {
      logger.error(colors.red('Exiting due to configuration errors!'))
      process.exit(1)
    }
  }
  return success
}

export const checkIntentWithFunctionHandlerExists = (trainingData: any, intent: string, handler: string) => {
  let success = true
  const intentData = trainingData.data.filter((data: any) => data.intent === intent)
  if (intentData.length === 0) {
    logger.warn(`Intent ${colors.italic(intent)} is missing in chatbot training data (${colors.red('NOT OK')})`)
    success = false
  } else {
    if (intentData[0].answers.filter((answer: { action: string, handler: string }) => answer.action === 'function' && answer.handler === handler).length === 0) {
      logger.warn(`Answer with ${colors.italic('function')} action and handler ${colors.italic(handler)} is missing for intent ${colors.italic(intent)} (${colors.red('NOT OK')})`)
      success = false
    }
  }
  return success
}
