const insecurity = require('../lib/insecurity')
const models = require('../models/')
const otplib = require('otplib')
const utils = require('../lib/utils')
const logger = require('../lib/logger')
const challenges = require('../data/datacache').challenges
const config = require('config')

otplib.authenticator.options = {
  // Accepts tokens as valid even when they are 30sec to old or to new
  // This is a standard as the clocks of the authenticator and server might not align perfectly.
  window: 1
}

async function verify (req, res) {
  const { tmpToken, totpToken } = req.body

  try {
    const { userId, type } = insecurity.verify(tmpToken)

    if (type !== 'password_valid_needs_second_factor_token') {
      throw new Error('Invalid token type')
    }

    const user = await models.User.findByPk(userId)

    const isValid = otplib.authenticator.check(totpToken, user.totpSecret)

    const plainUser = utils.queryResultToJson(user)

    if (!isValid) {
      return res.status(401).send()
    }

    if (utils.notSolved(challenges.twoFactorAuthUnsafeSecretStorageChallenge) && user.email === 'wurstbrot@' + config.get('application.domain')) {
      utils.solve(challenges.twoFactorAuthUnsafeSecretStorageChallenge)
    }

    const [ basket ] = await models.Basket.findOrCreate({ where: { userId }, defaults: {} })

    const token = insecurity.authorize(plainUser)
    plainUser.bid = basket.id // keep track of original basket for challenge solution check
    insecurity.authenticatedUsers.put(token, plainUser)

    res.json({ authentication: { token, bid: basket.id, umail: user.email } })
  } catch (error) {
    logger.warn('Failed to verify token identity')
    res.status(401).send()
  }
}

async function status(req, res) {
  const data = insecurity.authenticatedUsers.from(req)

  if(!data){
    res.status(401).send('You need to be logged in to see this.')
    return
  }

  const { data: user } = data;

  if(user.totpSecret === ''){
    const secret = await otplib.authenticator.generateSecret();

    res.json({
      setup: false,
      secret,
      setupToken: insecurity.authorize({
        secret,
        type: 'totp_setup_secret'
      })
    })
  } else {
    res.json({
      setup: true,
    })
  }
}

module.exports.verify = () => verify
module.exports.status = () => status
