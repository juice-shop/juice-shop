const insecurity = require('../lib/insecurity')
const models = require('../models/index')

exports = module.exports = function applyCoupon () {
  return (req, res, next) => {
    const id = req.params.id
    let coupon = req.params.coupon ? decodeURIComponent(req.params.coupon) : undefined
    const discount = insecurity.discountFromCoupon(coupon)
    coupon = discount ? coupon : null
    models.Basket.find(id).success(basket => {
      if (basket) {
        basket.updateAttributes({ coupon: coupon }).success(() => {
          if (discount) {
            res.json({ discount: discount })
          } else {
            res.status(404).send('Invalid coupon.')
          }
        }).error(error => {
          next(error)
        })
      } else {
        next(new Error('Basket with id=' + id + ' does not exist.'))
      }
    }).error(error => {
      next(error)
    })
  }
}
