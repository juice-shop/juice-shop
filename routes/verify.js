const utils = require('../lib/utils')
const insecurity = require('../lib/insecurity')
const jwt = require('jsonwebtoken')
const models = require('../models/index')
const cache = require('../data/datacache')
const Op = models.Sequelize.Op
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
/*
  if (utils.notSolved(challenges.jwtTier1Challenge) || utils.notSolved(challenges.jwtTier2Challenge)) {
    const token = utils.jwtFrom(req)
    const decoded = token ? jwt.decode(token, {complete: true}) : {}
    const payload = decoded.payload
    // TODO Check for expected different headers for each challenge
    /!* const header = decoded.header *!/

    if (utils.notSolved(challenges.jwtTier1Challenge)) {
      if (/!* header.alg === 'none' && *!/ payload && payload.data && payload.data.email === 'jwtn3d@juice-sh.op') {
        utils.solve(challenges.jwtTier1Challenge)
      }
    }
    if (utils.notSolved(challenges.jwtTier2Challenge)) {
      if (/!* header.alg === 'RS256' && *!/ payload && payload.data && payload.data.email === 'rsa_lord@juice-sh.op') {
        utils.solve(challenges.jwtTier2Challenge)
      }
    }
  }
*/
  next()
}

exports.databaseRelatedChallenges = () => (req, res, next) => {
  if (utils.notSolved(challenges.changeProductChallenge) && products.osaft) {
    products.osaft.reload().then(() => {
      if (!utils.contains(products.osaft.description, 'https://www.owasp.org/index.php/O-Saft')) {
        if (utils.contains(products.osaft.description, '<a href="http://kimminich.de" target="_blank">More...</a>')) {
          utils.solve(challenges.changeProductChallenge)
        }
      }
    })
  }
  if (utils.notSolved(challenges.feedbackChallenge)) {
    models.Feedback.findAndCountAll({ where: { rating: 5 } }).then(feedbacks => {
      if (feedbacks.count === 0) {
        utils.solve(challenges.feedbackChallenge)
      }
    })
  }
  if (utils.notSolved(challenges.knownVulnerableComponentChallenge)) {
    models.Feedback.findAndCountAll({
      where: {
        comment: {
          [Op.or]: [
            {[Op.and]: [
              {[Op.like]: '%sanitize-html%'},
              {[Op.like]: '%1.4.2%'}
            ]},
            {[Op.and]: [
              {[Op.like]: '%express-jwt%'},
              {[Op.like]: '%0.1.3%'}
            ]}
          ]
        }
      }
    }).then(data => {
      if (data.count > 0) {
        utils.solve(challenges.knownVulnerableComponentChallenge)
      }
    })
  }
  if (utils.notSolved(challenges.weirdCryptoChallenge)) {
    models.Feedback.findAndCountAll({
      where: {
        comment: {
          [Op.or]: [
              {[Op.like]: '%z85%'},
              {[Op.like]: '%base85%'},
              {[Op.like]: '%hashids%'},
              {[Op.like]: '%md5%'},
              {[Op.like]: '%base64%'}
          ]
        }
      }
    }).then(data => {
      if (data.count > 0) {
        utils.solve(challenges.weirdCryptoChallenge)
      }
    })
  }
  if (utils.notSolved(challenges.typosquattingNpmChallenge)) {
    models.Feedback.findAndCountAll({ where: { comment: { [Op.like]: '%epilogue-js%' } } }
    ).then(data => {
      if (data.count > 0) {
        utils.solve(challenges.typosquattingNpmChallenge)
      }
    })
  }
  if (utils.notSolved(challenges.typosquattingBowerChallenge)) {
    models.Feedback.findAndCountAll({ where: { comment: { [Op.like]: '%angular-tooltipp%' } } }
    ).then(data => {
      if (data.count > 0) {
        utils.solve(challenges.typosquattingBowerChallenge)
      }
    })
  }
  next()
}
