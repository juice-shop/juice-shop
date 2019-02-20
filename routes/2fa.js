const insecurity = require('../lib/insecurity')
const models = require('../models/')
const otplib = require('otplib')
const utils = require('../lib/utils')

otplib.authenticator.options = {
  window: 1
}

function verify () {
  return async (req, res, next) => {
    const { tmpToken, totpToken } = req.body

    try {
      const { userId, type } = insecurity.verify(tmpToken)

      if (type !== 'password_valid_needs_second_factor_token') {
        throw new Error('Invalid token type')
      }

      const user = await models.User.findByPk(userId)
    
      const isValid = otplib.authenticator.check(totpToken, user.totpSecret)
    
      const plainUser = utils.queryResultToJson(user)

      if (isValid) {
        models.Basket.findOrCreate({ where: { userId }, defaults: {} })
          .then(([basket, created]) => {
            const token = insecurity.authorize(plainUser)
            plainUser.bid = basket.id // keep track of original basket for challenge solution check
            insecurity.authenticatedUsers.put(token, plainUser)
            res.json({ authentication: { token, bid: basket.id, umail: user.email } })
          }).catch(error => {
            next(error)
          })
      } else {
        res.status(401).send()
      }
    } catch (error) {
      console.error('Failed to verify token identity')
      console.error(error)
      res.status(401).send()
    }
  }
}

module.exports.verify = verify
