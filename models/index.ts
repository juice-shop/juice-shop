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

let sequelizeInstance = createSequelize()

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
  sequelizeInstance = seq
}

initModels(sequelizeInstance)

// 'sequelize' is exported as an immutable 'const' Proxy that always forwards to the
// current sequelizeInstance, so consumers keep observing live updates from
// setSequelize (e.g. when tests swap in an in-memory database) without the export
// binding itself ever being reassignable.
const sequelize: Sequelize = new Proxy({} as Sequelize, {
  get (_target, prop, receiver) {
    const value = Reflect.get(sequelizeInstance as object, prop, receiver)
    return typeof value === 'function' ? value.bind(sequelizeInstance) : value
  },
  set (_target, prop, value) {
    return Reflect.set(sequelizeInstance as object, prop, value)
  },
  has (_target, prop) {
    return Reflect.has(sequelizeInstance as object, prop)
  },
  getPrototypeOf () {
    return Reflect.getPrototypeOf(sequelizeInstance as object)
  }
})

export { sequelize, createSequelize, initModels, setSequelize }
