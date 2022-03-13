/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Request, Response, NextFunction } from 'express'
import { ProductModel } from '../models/product'
import { BasketModel } from '../models/basket'

const utils = require('../lib/utils')
const security = require('../lib/insecurity')
const challenges = require('../data/datacache').challenges

module.exports = function retrieveBasket () {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    BasketModel.findOne({ where: { id }, include: [{ model: ProductModel, paranoid: false }] })
      .then((basket: BasketModel | null) => {
        /* jshint eqeqeq:false */
        utils.solveIf(challenges.basketAccessChallenge, () => {
          const user = security.authenticatedUsers.from(req)
          return user && id && id !== 'undefined' && id !== 'null' && id !== 'NaN' && user.bid && user.bid != id // eslint-disable-line eqeqeq
        })
        if (basket?.ProductModels && basket.ProductModels.length > 0) {
          for (let i = 0; i < basket.ProductModels.length; i++) {
            basket.ProductModels[i].name = req.__(basket.ProductModels[i].name)
          }
        }
        // TODO: This works but in response it sends [ProductModels] field but the API and tests
        // expect [Products] named field
        res.json(utils.queryResultToJson(basket))
      }).catch((error: Error) => {
        next(error)
      })
  }
}
