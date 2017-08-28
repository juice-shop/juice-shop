'use strict'

const insecurity = require('../lib/insecurity')
const models = require('../models/index')

exports = module.exports = function applyCoupon () {
  return function (req, res, next) {
    const id = req.params.id
    let coupon = req.params.coupon ? decodeURIComponent(req.params.coupon) : undefined
    const discount = insecurity.discountFromCoupon(coupon)
    coupon = discount ? coupon : null
    models.Basket.find(id).success(function (basket) {
      if (basket) {
        basket.updateAttributes({ coupon: coupon }).success(function () {
          if (discount) {
            res.json({ discount: discount })
          } else {
            res.status(404).send('Invalid coupon.')
          }
        }).error(function (error) {
          next(error)
        })
      } else {
        next(new Error('Basket with id=' + id + ' does not exist.'))
      }
    }).error(function (error) {
      next(error)
    })
  }
}
