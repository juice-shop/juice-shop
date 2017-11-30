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
  if (utils.notSolved(challenges.jwtTier1Challenge) || utils.notSolved(challenges.jwtTier2Challenge)) {
    const decoded = jwt.decode(utils.jwtFrom(req), { complete: true, json: true })
    const payload = decoded ? decoded.payload : {}
    const header = decoded ? decoded.header : {}
    if (utils.notSolved(challenges.jwtTier1Challenge)) {
      if (header.alg === 'none' && payload.data && payload.data.email && payload.data.email.match(/jwtn3d@/)) {
        utils.solve(challenges.jwtTier1Challenge)
      }
    }
    if (utils.notSolved(challenges.jwtTier2Challenge)) {
      if (header.alg === 'HS256' && payload.data && payload.data.email && payload.data.email.match(/rsa_lord@/)) {
        utils.solve(challenges.jwtTier2Challenge)
      }
    }
  }
  next()
}

exports.databaseRelatedChallenges = () => (req, res, next) => {
  function changeProductChallenge (osaft) {
    osaft.reload().then(() => {
      if (!utils.contains(osaft.description, 'https://www.owasp.org/index.php/O-Saft')) {
        if (utils.contains(osaft.description, '<a href="http://kimminich.de" target="_blank">More...</a>')) {
          utils.solve(challenges.changeProductChallenge)
        }
      }
    })
  }

  function feedbackChallenge () {
    models.Feedback.findAndCountAll({where: {rating: 5}}).then(feedbacks => {
      if (feedbacks.count === 0) {
        utils.solve(challenges.feedbackChallenge)
      }
    })
  }

  function knownVulnerableComponentChallenge () {
    let knownVulnerableComponents = [
      {
        [Op.and]: [
          {[Op.like]: '%sanitize-html%'},
          {[Op.like]: '%1.4.2%'}
        ]
      },
      {
        [Op.and]: [
          {[Op.like]: '%express-jwt%'},
          {[Op.like]: '%0.1.3%'}
        ]
      }
    ]
    models.Feedback.findAndCountAll({
      where: {
        comment: {
          [Op.or]: knownVulnerableComponents
        }
      }
    }).then(data => {
      if (data.count > 0) {
        utils.solve(challenges.knownVulnerableComponentChallenge)
      }
    })
    models.Complaint.findAndCountAll({
      where: {
        message: {
          [Op.or]: knownVulnerableComponents
        }
      }
    }).then(data => {
      if (data.count > 0) {
        utils.solve(challenges.knownVulnerableComponentChallenge)
      }
    })
  }

  function weirdCryptoChallenge () {
    let weirdCryptos = [
      {[Op.like]: '%z85%'},
      {[Op.like]: '%base85%'},
      {[Op.like]: '%hashids%'},
      {[Op.like]: '%md5%'},
      {[Op.like]: '%base64%'}
    ]
    models.Feedback.findAndCountAll({
      where: {
        comment: {
          [Op.or]: weirdCryptos
        }
      }
    }).then(data => {
      if (data.count > 0) {
        utils.solve(challenges.weirdCryptoChallenge)
      }
    })
    models.Complaint.findAndCountAll({
      where: {
        message: {
          [Op.or]: weirdCryptos
        }
      }
    }).then(data => {
      if (data.count > 0) {
        utils.solve(challenges.weirdCryptoChallenge)
      }
    })
  }

  function typosquattingNpmChallenge () {
    models.Feedback.findAndCountAll({where: {comment: {[Op.like]: '%epilogue-js%'}}}
    ).then(data => {
      if (data.count > 0) {
        utils.solve(challenges.typosquattingNpmChallenge)
      }
    })
    models.Complaint.findAndCountAll({where: {message: {[Op.like]: '%epilogue-js%'}}}
    ).then(data => {
      if (data.count > 0) {
        utils.solve(challenges.typosquattingNpmChallenge)
      }
    })
  }

  function typosquattingBowerChallenge () {
    models.Feedback.findAndCountAll({where: {comment: {[Op.like]: '%angular-tooltipp%'}}}
    ).then(data => {
      if (data.count > 0) {
        utils.solve(challenges.typosquattingBowerChallenge)
      }
    })
    models.Complaint.findAndCountAll({where: {message: {[Op.like]: '%angular-tooltipp%'}}}
    ).then(data => {
      if (data.count > 0) {
        utils.solve(challenges.typosquattingBowerChallenge)
      }
    })
  }

  if (utils.notSolved(challenges.changeProductChallenge) && products.osaft) {
    changeProductChallenge(products.osaft)
  }
  if (utils.notSolved(challenges.feedbackChallenge)) {
    feedbackChallenge()
  }
  if (utils.notSolved(challenges.knownVulnerableComponentChallenge)) {
    knownVulnerableComponentChallenge()
  }
  if (utils.notSolved(challenges.weirdCryptoChallenge)) {
    weirdCryptoChallenge()
  }
  if (utils.notSolved(challenges.typosquattingNpmChallenge)) {
    typosquattingNpmChallenge()
  }
  if (utils.notSolved(challenges.typosquattingBowerChallenge)) {
    typosquattingBowerChallenge()
  }
  next()
}
