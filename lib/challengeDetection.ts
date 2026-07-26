/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config from 'config'

import { challenges, products } from '../data/datacache'
import type { Product as ProductConfig } from './config.schema'
import { type Challenge } from '../data/types'
import { type ChallengeKey } from '../models/challenge'
import * as challengeUtils from './challengeUtils'
import * as antiCheat from './antiCheat'
import { ComplaintModel } from '../models/complaint'
import { FeedbackModel } from '../models/feedback'
import { ProductModel } from '../models/product'
import { buildSystemPrompt } from '../routes/chat'
import * as utils from './utils'
import logger from './logger'

/* In-memory equivalents of the SQL LIKE patterns formerly polled per request by
   routes/verify.ts databaseRelatedChallenges(). Both sides are lowercased to match
   SQLite's ASCII case-insensitive LIKE semantics. */
const textPatternChallenges: Array<{ key: ChallengeKey, matches: (lowercasedText: string) => boolean }> = [
  {
    key: 'knownVulnerableComponentChallenge',
    matches: (text) => containsAll(text, 'sanitize-html', '1.4.2') || containsAll(text, 'express-jwt', '0.1.3')
  },
  {
    key: 'weirdCryptoChallenge',
    matches: (text) => containsAny(text, 'z85', 'base85', 'hashids', 'md5', 'base64')
  },
  {
    key: 'typosquattingNpmChallenge',
    matches: (text) => text.includes('epilogue-js')
  },
  {
    key: 'typosquattingAngularChallenge',
    matches: (text) => text.includes('ngy-cookie')
  },
  {
    key: 'hiddenImageChallenge',
    matches: (text) => text.includes('pickle rick')
  },
  {
    key: 'supplyChainAttackChallenge',
    matches: (text) => containsAny(text, 'eslint-scope/issues/39', 'npm:eslint-scope:20180712')
  },
  {
    key: 'dlpPastebinDataLeakChallenge',
    matches: (text) => containsAll(text, ...dangerousIngredients())
  },
  {
    key: 'csafChallenge',
    matches: (text) => text.includes(config.get<string>('challenges.csafHashValue').toLowerCase())
  },
  {
    key: 'leakedApiKeyChallenge',
    matches: (text) => text.includes('6ppi37dbxp4ldwlriuaxp15hadjpsuxy5tspvmie')
  },
  {
    key: 'vulnerableDockerImageChallenge',
    matches: (text) => containsAll(text, 'mongo', '4.4.29')
  }
]

function containsAll (text: string, ...needles: string[]) {
  return needles.every((needle) => text.includes(needle))
}

function containsAny (text: string, ...needles: string[]) {
  return needles.some((needle) => text.includes(needle))
}

let dangerousIngredientsCache: string[] | null = null
function dangerousIngredients (): string[] {
  if (dangerousIngredientsCache === null) {
    dangerousIngredientsCache = config.get<ProductConfig[]>('products')
      .flatMap((product) => product.keywordsForPastebinDataLeakChallenge ?? [])
      .filter(Boolean)
      .map((keyword) => keyword.toLowerCase())
  }
  return dangerousIngredientsCache
}

export function matchingTextChallenges (text: string): Challenge[] {
  const lowercasedText = text.toLowerCase()
  return textPatternChallenges
    .filter(({ key }) => challengeUtils.notSolved(challenges[key]))
    .filter(({ matches }) => matches(lowercasedText))
    .map(({ key }) => challenges[key])
}

export function checkSubmittedText (text?: string | null): void {
  if (!text) {
    return
  }
  for (const challenge of matchingTextChallenges(text)) {
    const isCheating = antiCheat.checkForSourceFileOverlap(challenge.key, text)
    void challengeUtils.solve(challenge, false, isCheating)
  }
}

export function checkSystemPromptSimilarity (submission: string, reference: string, threshold = 0.25): boolean {
  const score = utils.diceCoefficient((submission ?? '').toLowerCase().trim(), reference.toLowerCase().trim(), 3)
  return score >= threshold
}

export function checkSystemPromptExtraction (message?: string | null): void {
  if (!challengeUtils.notSolved(challenges.systemPromptExtractionChallenge)) {
    return
  }
  if (checkSystemPromptSimilarity(message ?? '', buildSystemPrompt())) {
    challengeUtils.solveIf(challenges.systemPromptExtractionChallenge, () => true)
  }
}

export function checkFeedbackRatingChallenge (): void {
  if (!challengeUtils.notSolved(challenges.feedbackChallenge)) {
    return
  }
  FeedbackModel.count({ where: { rating: 5 } }).then((count: number) => {
    if (count === 0) {
      void challengeUtils.solve(challenges.feedbackChallenge)
    }
  }).catch((error: unknown) => {
    logger.warn(`Could not check feedback for rating challenge: ${utils.getErrorMessage(error)}`)
  })
}

export function checkProductTampering (product: { id: number, description: string }): void {
  if (!challengeUtils.notSolved(challenges.changeProductChallenge)) {
    return
  }
  if (!products.osaft || product.id !== products.osaft.id) {
    return
  }
  const urlForProductTamperingChallenge = config.get<ProductConfig[]>('products')
    .find((productConfig) => productConfig.urlForProductTamperingChallenge !== undefined)?.urlForProductTamperingChallenge
  if (!urlForProductTamperingChallenge) {
    return
  }
  if (!utils.contains(product.description, `${urlForProductTamperingChallenge}`) &&
    utils.contains(product.description, `<a href="${config.get<string>('challenges.overwriteUrlForProductTamperingChallenge')}" target="_blank">`)) {
    void challengeUtils.solve(challenges.changeProductChallenge)
  }
}

const HOOK_NAME = 'challengeDetection'

/* Detection hooks must never throw or return a promise: a rejected hook would fail
   the player's write with a 500. All challenge solving is fire-and-forget. */
export function registerChallengeDetectionHooks (): void {
  FeedbackModel.removeHook('afterCreate', HOOK_NAME)
  FeedbackModel.addHook('afterCreate', HOOK_NAME, (feedback: FeedbackModel) => {
    try {
      checkSubmittedText(feedback.comment)
    } catch (error: unknown) {
      logger.warn(`Challenge detection failed on feedback creation: ${utils.getErrorMessage(error)}`)
    }
  })
  FeedbackModel.removeHook('afterDestroy', HOOK_NAME)
  FeedbackModel.addHook('afterDestroy', HOOK_NAME, () => {
    try {
      checkFeedbackRatingChallenge()
    } catch (error: unknown) {
      logger.warn(`Challenge detection failed on feedback deletion: ${utils.getErrorMessage(error)}`)
    }
  })
  ComplaintModel.removeHook('afterCreate', HOOK_NAME)
  ComplaintModel.addHook('afterCreate', HOOK_NAME, (complaint: ComplaintModel) => {
    try {
      checkSubmittedText(complaint.message)
      checkSystemPromptExtraction(complaint.message)
    } catch (error: unknown) {
      logger.warn(`Challenge detection failed on complaint creation: ${utils.getErrorMessage(error)}`)
    }
  })
  ProductModel.removeHook('afterUpdate', HOOK_NAME)
  ProductModel.addHook('afterUpdate', HOOK_NAME, (product: ProductModel) => {
    try {
      checkProductTampering(product)
    } catch (error: unknown) {
      logger.warn(`Challenge detection failed on product update: ${utils.getErrorMessage(error)}`)
    }
  })
}

/* One-time sweep after datacreator: covers seeded data written before the challenge
   cache existed (e.g. user feedback from custom configs) and the feedbackChallenge
   auto-solve on configs that seed no 5-star feedback. */
export async function detectPreexistingChallengeData (): Promise<void> {
  try {
    const feedbacks = await FeedbackModel.findAll()
    for (const { comment } of feedbacks) {
      checkSubmittedText(comment)
    }
    const complaints = await ComplaintModel.findAll()
    for (const { message } of complaints) {
      checkSubmittedText(message)
      checkSystemPromptExtraction(message)
    }
    checkFeedbackRatingChallenge()
  } catch (error: unknown) {
    logger.warn(`Could not check preexisting data for challenges: ${utils.getErrorMessage(error)}`)
  }
}
