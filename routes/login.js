const utils = require('../lib/utils')
const insecurity = require('../lib/insecurity')
const models = require('../models/index')
const challenges = require('../data/datacache').challenges
const users = require('../data/datacache').users
const config = require('config')

module.exports = function login () {
  function afterLogin (user, res, next) {
    verifyPostLoginChallenges(user)
    models.Basket.findOrCreate({ where: { userId: user.data.id }, defaults: {} })
      .then(([basket]) => {
        const token = insecurity.authorize(user)
        user.bid = basket.id // keep track of original basket for challenge solution check
        insecurity.authenticatedUsers.put(token, user)
        res.json({ authentication: { token, bid: basket.id, umail: user.data.email } })
      }).catch(error => {
        next(error)
      })
  }

  return (req, res, next) => {
    verifyPreLoginChallenges(req)
    models.sequelize.query(`SELECT * FROM Users WHERE email = '${req.body.email || ''}' AND password = '${insecurity.hash(req.body.password || '')}' AND deletedAt IS NULL`, { model: models.User, plain: true })
      .then((authenticatedUser) => {
        let user = utils.queryResultToJson(authenticatedUser)
        const rememberedEmail = insecurity.userEmailFrom(req)
        if (rememberedEmail && req.body.oauth) {
          models.User.findOne({ where: { email: rememberedEmail } }).then(rememberedUser => {
            user = utils.queryResultToJson(rememberedUser)
            if (utils.notSolved(challenges.loginCisoChallenge) && user.data.id === users.ciso.id) {
              utils.solve(challenges.loginCisoChallenge)
            }
            afterLogin(user, res, next)
          })
        } else if (user.data && user.data.id && user.data.totpSecret !== '') {
          res.status(401).json({
            status: 'totp_token_requried',
            data: {
              tmpToken: insecurity.authorize({
                userId: user.data.id,
                type: 'password_valid_needs_second_factor_token'
              })
            }
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

  function verifyPreLoginChallenges (req) {
    if (utils.notSolved(challenges.weakPasswordChallenge) && req.body.email === 'admin@' + config.get('application.domain') && req.body.password === 'admin123') {
      utils.solve(challenges.weakPasswordChallenge)
    }
    if (utils.notSolved(challenges.loginSupportChallenge) && req.body.email === 'support@' + config.get('application.domain') && req.body.password === 'J6aVjTgOpRs$?5l+Zkq2AYnCE@RF§P') {
      utils.solve(challenges.loginSupportChallenge)
    }
    if (utils.notSolved(challenges.loginRapperChallenge) && req.body.email === 'mc.safesearch@' + config.get('application.domain') && req.body.password === 'Mr. N00dles') {
      utils.solve(challenges.loginRapperChallenge)
    }
    if (utils.notSolved(challenges.loginAmyChallenge) && req.body.email === 'amy@' + config.get('application.domain') && req.body.password === 'K1f.....................') {
      utils.solve(challenges.loginAmyChallenge)
    }
    if (utils.notSolved(challenges.dlpPasswordSprayingChallenge) && req.body.email === 'J12934@' + config.get('application.domain') && req.body.password === '0Y8rMnww$*9VFYE§59-!Fg1L6t&6lB') {
      utils.solve(challenges.dlpPasswordSprayingChallenge)
    }
    if (utils.notSolved(challenges.oauthUserPasswordChallenge) && req.body.email === 'bjoern.kimminich@gmail.com' && req.body.password === 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI=') {
      utils.solve(challenges.oauthUserPasswordChallenge)
    }
  }

  function verifyPostLoginChallenges (user) {
    if (utils.notSolved(challenges.loginAdminChallenge) && user.data.id === users.admin.id) {
      utils.solve(challenges.loginAdminChallenge)
    } else if (utils.notSolved(challenges.loginJimChallenge) && user.data.id === users.jim.id) {
      utils.solve(challenges.loginJimChallenge)
    } else if (utils.notSolved(challenges.loginBenderChallenge) && user.data.id === users.bender.id) {
      utils.solve(challenges.loginBenderChallenge)
    } else if (utils.notSolved(challenges.ghostLoginChallenge) && user.data.id === users.chris.id) {
      utils.solve(challenges.ghostLoginChallenge)
    } else if (utils.notSolved(challenges.ephemeralAccountantChallenge) && user.data.email === 'acc0unt4nt@' + config.get('application.domain') && user.data.role === 'accounting') {
      models.User.count({ where: { email: 'acc0unt4nt@' + config.get('application.domain') } }).then(count => {
        if (count === 0) {
          utils.solve(challenges.ephemeralAccountantChallenge)
        }
      })
    }
  }
}
