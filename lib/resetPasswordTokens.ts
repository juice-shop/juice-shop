/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config from 'config'
import { ComplaintModel } from '../models/complaint'
import { UserModel } from '../models/user'
import * as utils from './utils'

const resetTokenComplaintPrefix = '[Support] Password reset token for '

export const isTokenResetAccount = (email?: string) => {
  return email?.toLowerCase() === `admin@${config.get<string>('application.domain')}`.toLowerCase()
}

export const issueResetPasswordToken = async (email: string) => {
  const user = await UserModel.findOne({ where: { email } })
  if (!user || !isTokenResetAccount(email)) {
    return undefined
  }

  const token = utils.randomHexString(32)
  const complaint = await findResetTokenComplaint(email)
  const message = buildResetTokenComplaintMessage(email, token)

  if (complaint) {
    await complaint.update({ message })
  } else {
    await ComplaintModel.create({ UserId: user.id, message })
  }

  return token
}

export const verifyResetPasswordToken = async (email: string, token: string) => {
  const complaint = await findResetTokenComplaint(email)
  return extractResetPasswordToken(complaint?.message) === token
}

export const extractResetPasswordToken = (message?: string) => {
  if (!message) {
    return undefined
  }

  const match = message.match(/: ([a-f0-9]{32})$/i)
  return match?.[1]
}

function buildResetTokenComplaintMessage (email: string, token: string) {
  return `${resetTokenComplaintPrefix}${email}: ${token}`
}

async function findResetTokenComplaint (email: string) {
  const user = await UserModel.findOne({ where: { email } })
  if (!user) {
    return null
  }

  const complaintPrefix = `${resetTokenComplaintPrefix}${email}: `
  const complaints = await ComplaintModel.findAll({
    where: { UserId: user.id },
    order: [['updatedAt', 'DESC'], ['id', 'DESC']]
  })

  return complaints.find(({ message }) => message?.startsWith(complaintPrefix)) ?? null
}
