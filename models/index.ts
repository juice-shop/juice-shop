/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { AddressModelInit } from './address'
import { BasketModelInit } from './basket'
import { BasketItemModelInit } from './basketitem'
import { CaptchaModelInit } from './captcha'
import { CardModelInit } from './card'
import { ChallengeModelInit } from './challenge'
import { ChallengeDependencyModelInit } from './challengeDependency'
import { ComplaintModelInit } from './complaint'
import { DeliveryModelInit } from './delivery'
import { FeedbackModelInit } from './feedback'
import { HintModelInit } from './hint'
import { ImageCaptchaModelInit } from './imageCaptcha'
import { MemoryModelInit } from './memory'
import { PrivacyRequestModelInit } from './privacyRequests'
import { ProductModelInit } from './product'
import { QuantityModelInit } from './quantity'
import { RecycleModelInit } from './recycle'
import { relationsInit } from './relations'
import { SecurityAnswerModelInit } from './securityAnswer'
import { SecurityQuestionModelInit } from './securityQuestion'
import { UserModelInit } from './user'
import { WalletModelInit } from './wallet'
import { Sequelize, Transaction } from 'sequelize'

let sequelize = createSequelize()

function createSequelize (options?: { inMemory?: boolean }) {
  return new Sequelize('database', 'username', 'password', {
    dialect: 'sqlite',
    retry: {
      match: [/SQLITE_BUSY/],
      name: 'query',
      max: 5
    },
    transactionType: Transaction.TYPES.IMMEDIATE,
    storage: options?.inMemory ? ':memory:' : 'data/juiceshop.sqlite',
    logging: false
  })
}

function initModels (seq: Sequelize) {
  AddressModelInit(seq)
  BasketModelInit(seq)
  BasketItemModelInit(seq)
  CaptchaModelInit(seq)
  CardModelInit(seq)
  ChallengeModelInit(seq)
  ChallengeDependencyModelInit(seq)
  ComplaintModelInit(seq)
  DeliveryModelInit(seq)
  FeedbackModelInit(seq)
  HintModelInit(seq)
  ImageCaptchaModelInit(seq)
  MemoryModelInit(seq)
  PrivacyRequestModelInit(seq)
  ProductModelInit(seq)
  QuantityModelInit(seq)
  RecycleModelInit(seq)
  SecurityAnswerModelInit(seq)
  SecurityQuestionModelInit(seq)
  UserModelInit(seq)
  WalletModelInit(seq)
  relationsInit(seq)
}

function setSequelize (seq: Sequelize) {
  sequelize = seq
}

initModels(sequelize)

export { sequelize, createSequelize, initModels, setSequelize }
