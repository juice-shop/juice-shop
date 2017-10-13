const utils = require('../lib/utils')
const insecurity = require('../lib/insecurity')
const expressJwt = require('express-jwt')
const models = require('../models/index')
const cache = require('../data/datacache')
const challenges = cache.challenges
const products = cache.products

exports.forgedFeedbackChallenge = () => (req, res, next) => {
  /* jshint eqeqeq:false */
  if (utils.notSolved(challenges.forgedFeedbackChallenge)) {
    const user = insecurity.authenticatedUsers.from(req)
    const userId = user && user.data ? user.data.id : undefined
    if (req.body.UserId && req.body.UserId && req.body.UserId != userId) { // eslint-disable-line eqeqeq
      utils.solve(challenges.forgedFeedbackChallenge)
    }
  }
  next()
}

exports.accessControlChallenges = () => (req, res, next) => {
  if (utils.notSolved(challenges.scoreBoardChallenge) && utils.endsWith(req.url, '/scoreboard.png')) {
    utils.solve(challenges.scoreBoardChallenge)
  } else if (utils.notSolved(challenges.adminSectionChallenge) && utils.endsWith(req.url, '/administration.png')) {
    utils.solve(challenges.adminSectionChallenge)
  } else if (utils.notSolved(challenges.geocitiesThemeChallenge) && utils.endsWith(req.url, '/microfab.gif')) {
    utils.solve(challenges.geocitiesThemeChallenge)
  } else if (utils.notSolved(challenges.extraLanguageChallenge) && utils.endsWith(req.url, '/tlh.json')) {
    utils.solve(challenges.extraLanguageChallenge)
  } else if (utils.notSolved(challenges.retrieveBlueprintChallenge) && utils.endsWith(req.url, cache.retrieveBlueprintChallengeFile)) {
    utils.solve(challenges.retrieveBlueprintChallenge)
  }
  next()
}

exports.errorHandlingChallenge = () => (err, req, res, next) => {
  if (utils.notSolved(challenges.errorHandlingChallenge) && err && (res.statusCode === 200 || res.statusCode > 401)) {
    utils.solve(challenges.errorHandlingChallenge)
  }
  next(err)
}

exports.jwtChallenges = () => (req, res, next) => {
  if (utils.notSolved(challenges.jwtTier1) || utils.notSolved(challenges.jwtTier2)) {
    expressJwt({secret: insecurity.publicKey, requestProperty: 'auth'})
    const payload = req.auth
    console.log(JSON.stringify(payload))
    if (utils.notSolved(challenges.jwtTier1)) {
      if (/* TODO header.alg === 'none' && */ payload && payload.data && payload.data.email === 'jwtn3d@juice-sh.op') {
        utils.solve(challenges.jwtTier1)
      }
    }
    if (utils.notSolved(challenges.jwtTier2)) {
      if (/* TODO header.alg === 'RS256' && */ payload && payload.data && payload.data.email === 'rsa_lord@juice-sh.op') {
        utils.solve(challenges.jwtTier2)
      }
    }
  }
  next()
}

exports.databaseRelatedChallenges = () => (req, res, next) => {
  if (utils.notSolved(challenges.changeProductChallenge) && products.osaft) {
    products.osaft.reload().success(() => {
      if (!utils.contains(products.osaft.description, 'https://www.owasp.org/index.php/O-Saft')) {
        if (utils.contains(products.osaft.description, '<a href="http://kimminich.de" target="_blank">More...</a>')) {
          utils.solve(challenges.changeProductChallenge)
        }
      }
    })
  }
  if (utils.notSolved(challenges.feedbackChallenge)) {
    models.Feedback.findAndCountAll({ where: { rating: 5 } }).success(feedbacks => {
      if (feedbacks.count === 0) {
        utils.solve(challenges.feedbackChallenge)
      }
    })
  }
  if (utils.notSolved(challenges.knownVulnerableComponentChallenge)) {
    models.Feedback.findAndCountAll({ where: models.Sequelize.or(
      models.Sequelize.and([ 'comment LIKE \'%sanitize-html%\'' ], [ 'comment LIKE \'%1.4.2%\'' ]),
      models.Sequelize.and([ 'comment LIKE \'%sequelize%\'' ], [ 'comment LIKE \'%1.7%\'' ]),
      models.Sequelize.and([ 'comment LIKE \'%express-jwt%\'' ], [ 'comment LIKE \'%0.1.3%\'' ])
      )}
    ).success(data => {
      if (data.count > 0) {
        utils.solve(challenges.knownVulnerableComponentChallenge)
      }
    })
  }
  if (utils.notSolved(challenges.weirdCryptoChallenge)) {
    models.Feedback.findAndCountAll({ where: models.Sequelize.or([ 'comment LIKE \'%z85%\'' ], [ 'comment LIKE \'%base85%\'' ], [ 'comment LIKE \'%hashids%\'' ], [ 'comment LIKE \'%md5%\'' ], [ 'comment LIKE \'%base64%\'' ]) }
    ).success(data => {
      if (data.count > 0) {
        utils.solve(challenges.weirdCryptoChallenge)
      }
    })
  }
  if (utils.notSolved(challenges.typosquattingNpmChallenge)) {
    models.Feedback.findAndCountAll({ where: 'comment LIKE \'%epilogue-js%\'' }
    ).success(data => {
      if (data.count > 0) {
        utils.solve(challenges.typosquattingNpmChallenge)
      }
    })
  }
  if (utils.notSolved(challenges.typosquattingBowerChallenge)) {
    models.Feedback.findAndCountAll({ where: 'comment LIKE \'%angular-tooltipp%\'' }
    ).success(data => {
      if (data.count > 0) {
        utils.solve(challenges.typosquattingBowerChallenge)
      }
    })
  }
  next()
}
