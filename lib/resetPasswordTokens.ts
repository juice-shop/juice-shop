/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Op } from 'sequelize'
import { users } from '../data/datacache'
import { ResetPasswordTokenModel } from '../models/resetPasswordToken'
import { type UserModel } from '../models/user'
import { createResetPasswordToken, getResetPasswordTokenExpiry } from './resetPasswordTokenUtils'

export async function issueResetPasswordToken (user: UserModel, date = new Date()): Promise<ResetPasswordTokenModel> {
  const token = createResetPasswordToken(user.email, date)
  const expiresAt = getResetPasswordTokenExpiry(date)
  const [entry] = await ResetPasswordTokenModel.findOrCreate({
    where: { token },
    defaults: {
      UserId: user.id,
      token,
      expiresAt
    }
  })
  if (entry.expiresAt.getTime() !== expiresAt.getTime()) {
    await entry.update({ expiresAt })
  }
  return entry
}

export async function isValidResetPasswordToken (user: UserModel, token: string): Promise<boolean> {
  if (token !== createResetPasswordToken(user.email)) {
    return false
  }
  const count = await ResetPasswordTokenModel.count({
    where: {
      UserId: user.id,
      token,
      expiresAt: {
        [Op.gte]: new Date()
      }
    }
  })
  return count > 0
}

export async function seedResetPasswordTokens (): Promise<void> {
  const seedPlan = [
    { user: users.admin, dayOffsets: [-3, -2, -1] },
    { user: users.jim, dayOffsets: [-3, -2, -1, 0] },
    { user: users.bender, dayOffsets: [-3, -2, -1, 0] },
    { user: users.bjoern, dayOffsets: [-3, -2, -1, 0] }
  ]

  for (const { user, dayOffsets } of seedPlan) {
    if (!user) {
      continue
    }
    for (const dayOffset of dayOffsets) {
      const date = new Date()
      date.setDate(date.getDate() + dayOffset)
      await issueResetPasswordToken(user, date)
    }
  }
}
