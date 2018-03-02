const utils = require('../lib/utils')
const insecurity = require('../lib/insecurity')
const models = require('../models/index')
const challenges = require('../data/datacache').challenges
const config = require('config')

exports = module.exports = function login () {
  function afterLogin (user, res, next) {
    if (utils.notSolved(challenges.loginAdminChallenge) && user.data.id === 1) {
      utils.solve(challenges.loginAdminChallenge)
    } else if (utils.notSolved(challenges.loginJimChallenge) && user.data.id === 2) {
      utils.solve(challenges.loginJimChallenge)
    } else if (utils.notSolved(challenges.loginBenderChallenge) && user.data.id === 3) {
      utils.solve(challenges.loginBenderChallenge)
    }
    models.Basket.findOrCreate({ where: { userId: user.data.id }, defaults: {} })
      .then(([basket, created]) => {
        const token = insecurity.authorize(user)
        user.bid = basket.id // keep track of original basket for challenge solution check
        insecurity.authenticatedUsers.put(token, user)
        res.json({ authentication: { token, bid: basket.id, umail: user.data.email } })
      }).catch(error => {
        next(error)
      })
  }

  return (req, res, next) => {
    if (utils.notSolved(challenges.weakPasswordChallenge) && req.body.email === 'admin@' + config.get('application.domain') && req.body.password === 'admin123') {
      utils.solve(challenges.weakPasswordChallenge)
    }
    if (utils.notSolved(challenges.loginSupportChallenge) && req.body.email === 'support@' + config.get('application.domain') && req.body.password === 'J6aVjTgOpRs$?5l+Zkq2AYnCE@RF§P') {
      utils.solve(challenges.loginSupportChallenge)
    }
    if (utils.notSolved(challenges.loginRapperChallenge) && req.body.email === 'mc.safesearch@' + config.get('application.domain') && req.body.password === 'Mr. N00dles') {
      utils.solve(challenges.loginRapperChallenge)
    }
    if (utils.notSolved(challenges.oauthUserPasswordChallenge) && req.body.email === 'bjoern.kimminich@googlemail.com' && req.body.password === 'YmpvZXJuLmtpbW1pbmljaEBnb29nbGVtYWlsLmNvbQ==') {
      utils.solve(challenges.oauthUserPasswordChallenge)
    }
    models.sequelize.query('SELECT * FROM Users WHERE email = \'' + (req.body.email || '') + '\' AND password = \'' + insecurity.hash(req.body.password || '') + '\'', { model: models.User, plain: true })
      .then((authenticatedUser) => {
        let user = utils.queryResultToJson(authenticatedUser)

        const rememberedEmail = insecurity.userEmailFrom(req)
        if (rememberedEmail && req.body.oauth) {
          models.User.find({ where: { email: rememberedEmail } }).then(rememberedUser => {
            user = utils.queryResultToJson(rememberedUser)
            if (utils.notSolved(challenges.loginCisoChallenge) && user.data.id === 5) {
              utils.solve(challenges.loginCisoChallenge)
            }
            afterLogin(user, res, next)
          })
        } else if (user.data && user.data.id) {
          afterLogin(user, res, next)
        } else {
          res.status(401).send('Invalid email or password.')
        }
      }).catch(error => {
        next(error)
      })
  }
}
