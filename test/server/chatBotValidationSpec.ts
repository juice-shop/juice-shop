/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

const validateChatBot = require('../../lib/startup/validateChatBot')
const { checkIntentWithFunctionHandlerExists } = require('../../lib/startup/validateChatBot')

describe('chatBotValidation', () => {
  describe('checkIntentWithHandlerExists', () => {
    it('should accept training data with the expected intent and handler', () => {
      const trainingData = {
        data: [
          {
            intent: 'queries.test',
            answers: [
              {
                action: 'function',
                handler: 'testHandler'
              }
            ]
          }
        ]
      }

      expect(checkIntentWithFunctionHandlerExists(trainingData, 'queries.test', 'testHandler')).to.equal(true)
    })

    it('should fail if the training data lacks the expected intent', () => {
      const trainingData = {
        data: [
          {
            intent: 'queries.dummy'
          }
        ]
      }

      expect(checkIntentWithFunctionHandlerExists(trainingData, 'queries.test')).to.equal(false)
    })

    it('should fail if the training data lacks the expected handler for the given intent', () => {
      const trainingData = {
        data: [
          {
            intent: 'queries.test',
            answers: [
              {
                action: 'function',
                handler: 'dummyHandler'
              }
            ]
          }
        ]
      }

      expect(checkIntentWithFunctionHandlerExists(trainingData, 'queries.test', 'testHandler')).to.equal(false)
    })
  })

  it('should accept the default chatbot training data', () => {
    expect(validateChatBot(require('../../data/static/botDefaultTrainingData.json'))).to.equal(true)
  })

  it('should fail if the chatbot training data is empty', () => {
    expect(validateChatBot({ data: [] }, false)).to.equal(false)
  })
})
