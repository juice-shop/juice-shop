/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import models = require('../models/index')
import { Request, Response, NextFunction } from 'express'

const security = require('../lib/insecurity')

module.exports = function applyCoupon () {
  return ({ params }: Request, res: Response, next: NextFunction) => {
    const id = params.id
    let coupon = params.coupon ? decodeURIComponent(params.coupon) : undefined
    const discount = security.discountFromCoupon(coupon)
    coupon = discount ? coupon : null
    models.Basket.findByPk(id).then(basket => {
      if (basket) {
        basket.update({ coupon }).then(() => {
          if (discount) {
            res.json({ discount })
          } else {
            res.status(404).send('Invalid coupon.')
          }
        }).catch(error => {
          next(error)
        })
      } else {
        next(new Error('Basket with id=' + id + ' does not exist.'))
      }
    }).catch(error => {
      next(error)
    })
  }
}
