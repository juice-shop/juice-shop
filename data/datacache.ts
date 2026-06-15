/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import type { BasketItemModel } from '@juice-shop/models/basketitem'
import type { ChallengeKey, ChallengeModel } from '@juice-shop/models/challenge'
import type { ComplaintModel } from '@juice-shop/models/complaint'
import type { FeedbackModel } from '@juice-shop/models/feedback'
import type { ProductModel } from '@juice-shop/models/product'
import type { BasketModel } from '@juice-shop/models/basket'
import type { UserModel } from '@juice-shop/models/user'

export const challenges: Record<ChallengeKey, ChallengeModel> = {} as unknown as Record<ChallengeKey, ChallengeModel> // this is a hack to have the challenge key non-nullable, but on init it is null.
export const users: Record<string, UserModel> = {}
export const products: Record<string, ProductModel> = {}
export const feedback: Record<string, FeedbackModel> = {}
export const baskets: Record<string, BasketModel> = {}
export const basketItems: Record<string, BasketItemModel> = {}
export const complaints: Record<string, ComplaintModel> = {}

export interface Notification {
  key: string
  name: string
  challenge: string
  flag: string
  hidden: boolean
  isRestore: boolean
  codingChallenge?: boolean
}
export const notifications: Notification[] = []

export let retrieveBlueprintChallengeFile: string | null = null
export function setRetrieveBlueprintChallengeFile (retrieveBlueprintChallengeFileArg: string) {
  retrieveBlueprintChallengeFile = retrieveBlueprintChallengeFileArg
}
