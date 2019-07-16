const models = require('../models/index')
const insecurity = require('../lib/insecurity')

module.exports.getDeliveryMethods = function getDeliveryMethods () {
  return async (req, res, next) => {
    const methods = await models.Delivery.findAll()
    if (methods) {
      const sendMethods = []
      for (const method of methods) {
        sendMethods.push({
          id: method.id,
          name: method.name,
          price: insecurity.isPrime(req) ? method.primePrice : method.price,
          eta: method.eta
        })
      }
      res.status(200).json({ status: 'success', data: sendMethods })
    } else {
      res.status(400).json({ status: 'error' })
    }
  }
}
