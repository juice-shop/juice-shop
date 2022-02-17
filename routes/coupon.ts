/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Request, Response, NextFunction } from 'express'
import BasketModel from 'models/basket'

const security = require('../lib/insecurity')

module.exports = function applyCoupon () {
  return ({ params }: Request, res: Response, next: NextFunction) => {
    const id = params.id
    let coupon: string | undefined | null = params.coupon ? decodeURIComponent(params.coupon) : undefined
    const discount = security.discountFromCoupon(coupon)
    coupon = discount ? coupon : null
    BasketModel.findByPk(id).then((basket: BasketModel | null) => {
      if (basket) {
        basket.update({ coupon:coupon?.toString() }).then(() => {
          if (discount) {
            res.json({ discount })
          } else {
            res.status(404).send('Invalid coupon.')
          }
        }).catch((error: Error) => {
          next(error)
        })
      } else {
        next(new Error('Basket with id=' + id + ' does not exist.'))
      }
    }).catch((error: Error) => {
      next(error)
    })
  }
}
