const insecurity = require('../lib/insecurity')
const models = require('../models/')
const otplib = require('otplib')
const utils = require('../lib/utils')

function verify() {
    return async (req, res, next) => {
        const { tmp_token, totp_token } = req.body

        console.log('body')
        console.log(req.body)
        try {
            const { user_id, type } = insecurity.verify(tmp_token)

            if (type !== 'password_valid_needs_second_factor_token') {
                throw new Error('Invalid token type')
            }

            const user = await models.User.findByPk(user_id)
            console.log('user')
            console.log(user)

            const isValid = otplib.authenticator.check(totp_token, user.totpSecret)
            console.log(isValid)

            const plainUser = utils.queryResultToJson(user)

            if (isValid) {
                models.Basket.findOrCreate({ where: { userId: user.id }, defaults: {} })
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
