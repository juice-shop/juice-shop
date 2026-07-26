/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import config from 'config'
import { challenges, products } from '../../data/datacache'
import type { Product, Challenge } from '@juice-shop/data/types'
import type { Product as ProductConfig } from '../../lib/config.schema'
import * as challengeDetection from '../../lib/challengeDetection'
import * as antiCheat from '../../lib/antiCheat'
import { FeedbackModel } from '../../models/feedback'
import { buildSystemPrompt } from '../../routes/chat'

void describe('challengeDetection', () => {
  let save: any

  beforeEach(() => {
    save = () => ({
      then () { }
    })
  })

  void describe('checkSubmittedText', () => {
    const patternChallengeKeys = [
      'knownVulnerableComponentChallenge',
      'weirdCryptoChallenge',
      'typosquattingNpmChallenge',
      'typosquattingAngularChallenge',
      'hiddenImageChallenge',
      'supplyChainAttackChallenge',
      'dlpPastebinDataLeakChallenge',
      'csafChallenge',
      'leakedApiKeyChallenge',
      'vulnerableDockerImageChallenge'
    ] as const

    beforeEach(() => {
      for (const key of patternChallengeKeys) {
        challenges[key] = { key, solved: false, save } as unknown as Challenge
      }
    })

    const solvingTexts: Array<{ key: typeof patternChallengeKeys[number], text: string }> = [
      { key: 'knownVulnerableComponentChallenge', text: 'The sanitize-html module up to at least version 1.4.2 has this issue' },
      { key: 'knownVulnerableComponentChallenge', text: 'Your express-jwt 0.1.3 has a vulnerability' },
      { key: 'weirdCryptoChallenge', text: 'You use z85 and hashids for crypto?' },
      { key: 'weirdCryptoChallenge', text: 'Even MD5 to hash passwords! Srsly?!?!' },
      { key: 'typosquattingNpmChallenge', text: 'Being typosquatted by epilogue-js!' },
      { key: 'typosquattingAngularChallenge', text: 'Being typosquatted by ngy-cookie!' },
      { key: 'hiddenImageChallenge', text: 'I found Pickle RICK hiding in your images' },
      { key: 'supplyChainAttackChallenge', text: 'You have no clue what https://github.com/eslint/eslint-scope/issues/39 means, do you???' },
      { key: 'supplyChainAttackChallenge', text: 'Vulnerability npm:eslint-scope:20180712 found' },
      { key: 'leakedApiKeyChallenge', text: 'Found API key 6PPi37DBxP4lDwlriuaxP15HaDJpsUXY5TspVmie in your app' },
      { key: 'vulnerableDockerImageChallenge', text: 'Your mongo image 4.4.29 is outdated' }
    ]

    solvingTexts.forEach(({ key, text }) => {
      void it(`"${key}" is solved by text "${text}"`, () => {
        challengeDetection.checkSubmittedText(text)

        assert.equal(challenges[key].solved, true)
      })
    })

    void it('"csafChallenge" is solved by text containing the configured hash value', () => {
      challengeDetection.checkSubmittedText(`Your CSAF document has hash ${config.get<string>('challenges.csafHashValue')} but is broken`)

      assert.equal(challenges.csafChallenge.solved, true)
    })

    void it('"dlpPastebinDataLeakChallenge" is solved by text containing all dangerous ingredients', () => {
      const dangerousIngredients = config.get<ProductConfig[]>('products')
        .flatMap((product) => product.keywordsForPastebinDataLeakChallenge ?? [])
        .filter(Boolean)
      challengeDetection.checkSubmittedText(`This stuff contains ${dangerousIngredients.join(' and ')}!`)

      assert.equal(challenges.dlpPastebinDataLeakChallenge.solved, true)
    })

    void it('no pattern challenge is solved by a harmless comment', () => {
      challengeDetection.checkSubmittedText('Keep up the good work!')

      for (const key of patternChallengeKeys) {
        assert.equal(challenges[key].solved, false)
      }
    })

    void it('is a no-op for null, undefined or empty text', () => {
      challengeDetection.checkSubmittedText(null)
      challengeDetection.checkSubmittedText(undefined)
      challengeDetection.checkSubmittedText('')

      for (const key of patternChallengeKeys) {
        assert.equal(challenges[key].solved, false)
      }
    })

    void it('solves the challenge even when the anti-cheat flags the submitted text as source file plagiarism', () => {
      const submission = fs.readFileSync(path.resolve('ftp/package.json.bak'), 'utf-8')

      assert.equal(antiCheat.checkForSourceFileOverlap('typosquattingNpmChallenge', submission), true)

      challengeDetection.checkSubmittedText(submission)

      assert.equal(challenges.typosquattingNpmChallenge.solved, true)
    })
  })

  void describe('checkProductTampering', () => {
    beforeEach(() => {
      challenges.changeProductChallenge = { solved: false, save } as unknown as Challenge
      products.osaft = { id: 9 } as unknown as Product
    })

    void it(`is solved when the link in the O-Saft product goes to ${config.get<string>('challenges.overwriteUrlForProductTamperingChallenge')}`, () => {
      challengeDetection.checkProductTampering({ id: 9, description: `O-Saft, yeah! <a href="${config.get<string>('challenges.overwriteUrlForProductTamperingChallenge')}" target="_blank">More...</a>` })

      assert.equal(challenges.changeProductChallenge.solved, true)
    })

    void it('is not solved when the link in the O-Saft product is changed to an arbitrary URL', () => {
      challengeDetection.checkProductTampering({ id: 9, description: 'O-Saft, nooo! <a href="http://arbitrary.url" target="_blank">More...</a>' })

      assert.equal(challenges.changeProductChallenge.solved, false)
    })

    void it('is not solved when the link in the O-Saft product remained unchanged', () => {
      let urlForProductTamperingChallenge = null
      for (const product of config.get<ProductConfig[]>('products')) {
        if (product.urlForProductTamperingChallenge !== undefined) {
          urlForProductTamperingChallenge = product.urlForProductTamperingChallenge
          break
        }
      }
      challengeDetection.checkProductTampering({ id: 9, description: `Vanilla O-Saft! <a href="${urlForProductTamperingChallenge}" target="_blank">More...</a>` })

      assert.equal(challenges.changeProductChallenge.solved, false)
    })

    void it('is not solved when a different product than O-Saft is tampered with', () => {
      challengeDetection.checkProductTampering({ id: 8, description: `Apple Juice! <a href="${config.get<string>('challenges.overwriteUrlForProductTamperingChallenge')}" target="_blank">More...</a>` })

      assert.equal(challenges.changeProductChallenge.solved, false)
    })
  })

  void describe('checkFeedbackRatingChallenge', () => {
    beforeEach(() => {
      challenges.feedbackChallenge = { key: 'feedbackChallenge', solved: false, save } as unknown as Challenge
    })

    void it('solves "feedbackChallenge" when no 5-star feedback exists', async (t: any) => {
      t.mock.method(FeedbackModel, 'count', async () => 0)

      challengeDetection.checkFeedbackRatingChallenge()
      await new Promise((resolve) => setImmediate(resolve))

      assert.equal(challenges.feedbackChallenge.solved, true)
    })

    void it('does not solve "feedbackChallenge" while 5-star feedback exists', async (t: any) => {
      t.mock.method(FeedbackModel, 'count', async () => 3)

      challengeDetection.checkFeedbackRatingChallenge()
      await new Promise((resolve) => setImmediate(resolve))

      assert.equal(challenges.feedbackChallenge.solved, false)
    })
  })

  void describe('checkSystemPromptExtraction', () => {
    beforeEach(() => {
      challenges.systemPromptExtractionChallenge = { key: 'systemPromptExtractionChallenge', solved: false, save } as unknown as Challenge
    })

    void it('solves "systemPromptExtractionChallenge" for a message similar to the system prompt', () => {
      challengeDetection.checkSystemPromptExtraction(buildSystemPrompt())

      assert.equal(challenges.systemPromptExtractionChallenge.solved, true)
    })

    void it('does not solve "systemPromptExtractionChallenge" for an unrelated message', () => {
      challengeDetection.checkSystemPromptExtraction('The weather is nice today and I like pizza with extra cheese.')

      assert.equal(challenges.systemPromptExtractionChallenge.solved, false)
    })
  })
})
