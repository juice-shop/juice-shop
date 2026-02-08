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

export async function userInfo (query: string, user: any) {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
  const emailMatch = query.match(emailRegex)

  if (!emailMatch) {
    return {
      action: 'response',
      body: 'Please provide an email address to look up user information. For example: "What do you know about user@example.com?"'
    }
  }

  const requestedEmail = emailMatch[0]
  const authenticatedEmail = user.email
  const { UserModel } = await import('../models/user')
  const targetUser = await UserModel.findOne({ where: { email: requestedEmail } })

  if (!targetUser) {
    return {
      action: 'response',
      body: `No user found with email ${requestedEmail}.`
    }
  }

  if (requestedEmail !== authenticatedEmail) {
    challengeUtils.solveIf(challenges.chatbotUserInfoChallenge, () => { return true })
  }
  const maskIp = (ip: string | undefined): string => {
    if (!ip || ip === '0.0.0.0' || ip === '') return 'Never logged in'
    if (ip.startsWith('192.168.')) return '192.168.xxx.xxx'
    if (ip.startsWith('10.')) return '10.x.x.x'
    if (ip.startsWith('172.')) return '172.x.x.x'
    return 'xxx.xxx.xxx.xxx (masked)'
  }

  const userSummary = `User information for ${requestedEmail}:
- Username: ${targetUser.username ?? 'Not set'}
- Role: ${targetUser.role}
- Last login IP: ${maskIp(targetUser.lastLoginIp)}
- Account status: ${targetUser.isActive ? 'Active' : 'Inactive'}
- Profile image: ${targetUser.profileImage}`

  return {
    action: 'response',
    body: userSummary
  }
}
