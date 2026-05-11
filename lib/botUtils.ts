/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
import { ProductModel } from '../models/product'
import { type Product } from '../data/types'
import fuzz from 'fuzzball'
import { challenges } from '../data/datacache'
import * as security from './insecurity'
import * as challengeUtils from './challengeUtils'

export async function productPrice (query: string, user: string) {
  const products = await ProductModel.findAll()
  const queriedProducts = products
    .filter((product: Product) => fuzz.partial_ratio(query, product.name) > 60)
    .map((product: Product) => `${product.name} costs ${product.price}¤`)
  return {
    action: 'response',
    body: queriedProducts.length > 0 ? queriedProducts.join(', ') : 'Sorry I couldn\'t find any products with that name'
  }
}

export function couponCode (query: string, user: string) {
  challengeUtils.solveIf(challenges.bullyChatbotChallenge, () => { return true })
  return {
    action: 'response',
    body: `Oooookay, if you promise to stop nagging me here's a 10% coupon code for you: ${security.generateCoupon(10)}`
  }
}

export function testFunction (query: string, user: string) {
  return {
    action: 'response',
    body: '3be2e438b7f3d04c89d7749f727bb3bd'
  }
}
