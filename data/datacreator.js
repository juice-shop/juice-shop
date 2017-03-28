/* jslint node: true */
'use strict'

var models = require('../models/index')
var datacache = require('./datacache')
var config = require('config')
var utils = require('../lib/utils')
var challenges = datacache.challenges
var users = datacache.users
var products = datacache.products

module.exports = function () {
  createChallenges()
  createUsers()
  createRandomFakeUsers()
  createProducts()
  createBaskets()
  createFeedback()

  function createChallenges () {
    models.Challenge.create({
      name: 'Score Board',
      category: 'Information Leakage',
      description: 'Find the carefully hidden \'Score Board\' page.',
      difficulty: 1,
      solved: false
    }).success(function (challenge) {
      challenges.scoreBoardChallenge = challenge
    })
    models.Challenge.create({
      name: 'Error Handling',
      category: 'Information Leakage',
      description: 'Provoke an error that is not very gracefully handled.',
      difficulty: 1,
      solved: false
    }).success(function (challenge) {
      challenges.errorHandlingChallenge = challenge
    })
    models.Challenge.create({
      name: 'Login Admin',
      category: 'SQL Injection',
      description: 'Log in with the administrator\'s user account.',
      difficulty: 2,
      solved: false
    }).success(function (challenge) {
      challenges.loginAdminChallenge = challenge
    })
    models.Challenge.create({
      name: 'Login Jim',
      category: 'SQL Injection',
      description: 'Log in with Jim\'s user account.',
      difficulty: 3,
      solved: false
    }).success(function (challenge) {
      challenges.loginJimChallenge = challenge
    })
    models.Challenge.create({
      name: 'Login Bender',
      category: 'SQL Injection',
      description: 'Log in with Bender\'s user account.',
      difficulty: 3,
      solved: false
    }).success(function (challenge) {
      challenges.loginBenderChallenge = challenge
    })
    models.Challenge.create({
      name: 'XSS Tier 1',
      category: 'XSS',
      description: 'XSS Tier 1: Perform a <i>reflected</i> XSS attack with <code>&lt;script&gt;alert("XSS1")&lt;/script&gt;</code>.',
      difficulty: 1,
      solved: false
    }).success(function (challenge) {
      challenges.localXssChallenge = challenge
    })
    models.Challenge.create({
      name: 'XSS Tier 2',
      category: 'XSS',
      description: 'XSS Tier 2: Perform a <i>persisted</i> XSS attack with <code>&lt;script&gt;alert("XSS2")&lt;/script&gt;</code> bypassing a <i>client-side</i> security mechanism.',
      difficulty: 3,
      solved: false
    }).success(function (challenge) {
      challenges.persistedXssChallengeUser = challenge
    })
    models.Challenge.create({
      name: 'XSS Tier 4',
      category: 'XSS',
      description: 'XSS Tier 4: Perform a <i>persisted</i> XSS attack with <code>&lt;script&gt;alert("XSS4")&lt;/script&gt;</code> bypassing a <i>server-side</i> security mechanism.',
      difficulty: 4,
      solved: false
    }).success(function (challenge) {
      challenges.persistedXssChallengeFeedback = challenge
    })
    models.Challenge.create({
      name: 'XSS Tier 3',
      category: 'XSS',
      description: 'XSS Tier 3: Perform a <i>persisted</i> XSS attack with <code>&lt;script&gt;alert("XSS3")&lt;/script&gt;</code> without using the frontend application at all.',
      difficulty: 3,
      solved: false
    }).success(function (challenge) {
      challenges.restfulXssChallenge = challenge
    })
    models.Challenge.create({
      name: 'User Credentials',
      category: 'SQL Injection',
      description: 'Retrieve a list of all user credentials via SQL Injection',
      difficulty: 3,
      solved: false
    }).success(function (challenge) {
      challenges.unionSqlInjectionChallenge = challenge
    })
    models.Challenge.create({
      name: 'Password Strength',
      category: 'Weak Security Mechanisms',
      description: 'Log in with the administrator\'s user credentials without previously changing them or applying SQL Injection.',
      difficulty: 2,
      solved: false
    }).success(function (challenge) {
      challenges.weakPasswordChallenge = challenge
    })
    models.Challenge.create({
      name: 'Five-Star Feedback',
      category: 'Privilege Escalation',
      description: 'Get rid of all 5-star customer feedback.',
      difficulty: 1,
      solved: false
    }).success(function (challenge) {
      challenges.feedbackChallenge = challenge
    })
    models.Challenge.create({
      name: 'Forged Feedback',
      category: 'Privilege Escalation',
      description: 'Post some feedback in another users name.',
      difficulty: 3,
      solved: false
    }).success(function (challenge) {
      challenges.forgedFeedbackChallenge = challenge
    })
    models.Challenge.create({
      name: 'Redirects',
      category: 'Weak Security Mechanisms',
      description: 'Wherever you go, there you are.',
      difficulty: 4,
      solved: false
    }).success(function (challenge) {
      challenges.redirectChallenge = challenge
    })
    models.Challenge.create({
      name: 'Basket Access',
      category: 'Privilege Escalation',
      description: 'Access someone else\'s basket.',
      difficulty: 2,
      solved: false
    }).success(function (challenge) {
      challenges.basketChallenge = challenge
    })
    models.Challenge.create({
      name: 'Payback Time',
      category: 'Validation Flaws',
      description: 'Place an order that makes you rich.',
      difficulty: 3,
      solved: false
    }).success(function (challenge) {
      challenges.negativeOrderChallenge = challenge
    })
    models.Challenge.create({
      name: 'Confidential Document',
      category: 'Forgotten Content',
      description: 'Access a confidential document.',
      difficulty: 1,
      solved: false
    }).success(function (challenge) {
      challenges.directoryListingChallenge = challenge
    })
    models.Challenge.create({
      name: 'Forgotten Developer Backup',
      category: 'Forgotten Content',
      description: 'Access a developer\'s forgotten backup file.',
      difficulty: 3,
      solved: false
    }).success(function (challenge) {
      challenges.forgottenDevBackupChallenge = challenge
    })
    models.Challenge.create({
      name: 'Forgotten Sales Backup',
      category: 'Forgotten Content',
      description: 'Access a salesman\'s forgotten backup file.',
      difficulty: 2,
      solved: false
    }).success(function (challenge) {
      challenges.forgottenBackupChallenge = challenge
    })
    models.Challenge.create({
      name: 'Admin Section',
      category: 'Privilege Escalation',
      description: 'Access the administration section of the store.',
      difficulty: 1,
      solved: false
    }).success(function (challenge) {
      challenges.adminSectionChallenge = challenge
    })
    models.Challenge.create({
      name: 'CSRF',
      category: 'CSRF',
      description: 'Change Bender\'s password into <i>slurmCl4ssic</i> without using SQL Injection.',
      difficulty: 4,
      solved: false
    }).success(function (challenge) {
      challenges.csrfChallenge = challenge
    })
    models.Challenge.create({
      name: 'Product Tampering',
      category: 'Privilege Escalation',
      description: 'Change the <code>href</code> of the link within the <a href="/#/search?q=O-Saft">O-Saft product</a> description into <i>http://kimminich.de</i>.',
      difficulty: 3,
      solved: false
    }).success(function (challenge) {
      challenges.changeProductChallenge = challenge
    })
    models.Challenge.create({
      name: 'Vulnerable Component',
      category: 'Cryptographic Issues',
      description: '<a href="/#/contact">Inform the shop</a> about a vulnerable library it is using. (Mention the exact library name and version in your comment.)',
      difficulty: 3,
      solved: false
    }).success(function (challenge) {
      challenges.knownVulnerableComponentChallenge = challenge
    })
    models.Challenge.create({
      name: 'Weird Crypto',
      category: 'Cryptographic Issues',
      description: '<a href="/#/contact">Inform the shop</a> about an algorithm or library it should definitely not use the way it does.',
      difficulty: 2,
      solved: false
    }).success(function (challenge) {
      challenges.weirdCryptoChallenge = challenge
    })
    models.Challenge.create({
      name: 'Easter Egg Tier 1',
      category: 'Forgotten Content',
      description: 'Find the hidden <a href="http://en.wikipedia.org/wiki/Easter_egg_(media)" target="_blank">easter egg</a>.',
      difficulty: 3,
      solved: false
    }).success(function (challenge) {
      challenges.easterEggLevelOneChallenge = challenge
    })
    models.Challenge.create({
      name: 'Easter Egg Tier 2',
      category: 'Cryptographic Issues',
      description: 'Apply some advanced cryptanalysis to find <i>the real</i> easter egg.',
      difficulty: 4,
      solved: false
    }).success(function (challenge) {
      challenges.easterEggLevelTwoChallenge = challenge
    })
    models.Challenge.create({
      name: 'Forged Coupon',
      category: 'Cryptographic Issues',
      description: 'Forge a coupon code that gives you a discount of at least 80%.',
      difficulty: 5,
      solved: false
    }).success(function (challenge) {
      challenges.forgedCouponChallenge = challenge
    })
    models.Challenge.create({
      name: 'Eye Candy',
      category: 'Forgotten Content',
      description: 'Travel back in time to the golden era of <img src="/css/geo-bootstrap/img/hot.gif"> web design.',
      difficulty: 3,
      solved: false
    }).success(function (challenge) {
      challenges.geocitiesThemeChallenge = challenge
    })
    models.Challenge.create({
      name: 'Christmas Special',
      category: 'SQL Injection',
      description: 'Order the Christmas special offer of 2014.',
      difficulty: 2,
      solved: false
    }).success(function (challenge) {
      challenges.christmasSpecialChallenge = challenge
    })
    models.Challenge.create({
      name: 'Upload Size',
      category: 'Validation Flaws',
      description: 'Upload a file larger than 100 kB.',
      difficulty: 3,
      solved: false
    }).success(function (challenge) {
      challenges.uploadSizeChallenge = challenge
    })
    models.Challenge.create({
      name: 'Upload Type',
      category: 'Validation Flaws',
      description: 'Upload a file that has no .pdf extension.',
      difficulty: 3,
      solved: false
    }).success(function (challenge) {
      challenges.uploadTypeChallenge = challenge
    })
    models.Challenge.create({
      name: 'Extra Language',
      category: 'Forgotten Content',
      description: 'Retrieve the language file that never made it into production.',
      difficulty: 4,
      solved: false
    }).success(function (challenge) {
      challenges.extraLanguageChallenge = challenge
    })
    models.Challenge.create({
      name: 'Zero Stars',
      category: 'Validation Flaws',
      description: 'Give a devastating zero-star feedback to the store.',
      difficulty: 1,
      solved: false
    }).success(function (challenge) {
      challenges.zeroStarsChallenge = challenge
    })
    models.Challenge.create({
      name: 'Imaginary Challenge',
      category: 'Cryptographic Issues',
      description: 'Solve challenge #99. Unfortunately, this challenge does not exist.',
      difficulty: 5,
      solved: false
    }).success(function (challenge) {
      challenges.continueCodeChallenge = challenge
    })
    models.Challenge.create({
      name: 'Login Bjoern',
      category: 'Weak Security Mechanisms',
      description: 'Log in with Bjoern\'s user account <i>without</i> previously changing his password, applying SQL Injection, or hacking his Google account.',
      difficulty: 3,
      solved: false
    }).success(function (challenge) {
      challenges.oauthUserPasswordChallenge = challenge
    })
    models.Challenge.create({
      name: 'Login CISO',
      category: 'Weak Security Mechanisms',
      description: 'Exploit OAuth 2.0 to log in with the Chief Information Security Officer\'s user account.',
      difficulty: 4,
      solved: false
    }).success(function (challenge) {
      challenges.loginCisoChallenge = challenge
    })
    models.Challenge.create({
      name: 'Login Support Team',
      category: 'Weak Security Mechanisms',
      description: 'Log in with the support team\'s original user credentials without applying SQL Injection or any other bypass.',
      difficulty: 5,
      solved: false
    }).success(function (challenge) {
      challenges.loginSupportChallenge = challenge
    })
    models.Challenge.create({
      name: 'Premium Paywall',
      category: 'Cryptographic Issues',
      description: '<i class="fa fa-diamond"></i><i class="fa fa-diamond"></i><i class="fa fa-diamond"></i><i class="fa fa-diamond"></i><i class="fa fa-diamond"></i><!--R9U8AvGlBbjhHXHW422jxVL2hoLBr8wflIAQ8d/jlERpKnrNlMErs1JfgT9EK/kzTtdb1GPhuWAz3i2HhomhaFMxvg4na+tvTi+8DoQoeqZH1KADoM2NJ7UOKc14b54cdRTXiYV7yFUzbPjjPVOWZFSmDcG6z+jQIPZtJuJ/tQc=--> <a href="/redirect?to=https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm" target="_blank" class="btn btn-danger btn-xs"><i class="fa fa-btc fa-sm"></i> Unlock Premium Challenge</a> to access exclusive content.',
      difficulty: 5,
      solved: false
    }).success(function (challenge) {
      challenges.premiumPaywallChallenge = challenge
    })
  }

  function createUsers () {
    models.User.create({
      email: 'admin@' + config.get('application.domain'),
      password: 'admin123'
    })
    models.User.create({
      email: 'jim@' + config.get('application.domain'),
      password: 'ncc-1701'
    })
    models.User.create({
      email: 'bender@' + config.get('application.domain'),
      password: 'OhG0dPlease1nsertLiquor!'
    }).success(function (user) {
      users.bender = user
    })
    models.User.create({
      email: 'bjoern.kimminich@googlemail.com',
      password: 'YmpvZXJuLmtpbW1pbmljaEBnb29nbGVtYWlsLmNvbQ=='
    }).success(function (user) {
      users.bjoern = user
    })
    models.User.create({
      email: 'ciso@' + config.get('application.domain'),
      password: 'mDLx?94T~1CfVfZMzw@sJ9f?s3L6lbMqE70FfI8^54jbNikY5fymx7c!YbJb'
    }).success(function (user) {
      users.ciso = user
    })
    models.User.create({
      email: 'support@' + config.get('application.domain'),
      password: 'J6aVjTgOpRs$?5l+Zkq2AYnCE@RF§P'
    }).success(function (user) {
      users.support = user
    })
  }

  function createRandomFakeUsers () {
    for (var i = 0; i < config.get('application.numberOfRandomFakeUsers'); i++) {
      models.User.create({
        email: getGeneratedRandomFakeUserEmail(),
        password: makeRandomString(5)
      })
    }
  }

  function getGeneratedRandomFakeUserEmail () {
    var randomDomain = makeRandomString(4).toLowerCase() + '. ' + makeRandomString(2).toLowerCase()
    return makeRandomString(5).toLowerCase() + '@' + randomDomain
  }

  function makeRandomString (length) {
    var text = ''
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (var i = 0; i < length; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)) }

    return text
  }

  function createProducts () {
    for (var i = 0; i < config.get('products').length; i++) {
      var product = config.get('products')[i]
      var name = product.name
      var description = product.description || 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.'
      if (product.useForChristmasSpecialChallenge) {
        description += ' (Seasonal special offer! Limited availability!)'
      } else if (product.useForProductTamperingChallenge) {
        description += ' <a href="https://www.owasp.org/index.php/O-Saft" target="_blank">More...</a>'
      }
      var price = product.price || Math.floor(Math.random())
      var imageFileName = product.image || 'undefined.jpg'
      if (product.imageUrl) {
        imageFileName = product.imageUrl.substring(product.imageUrl.lastIndexOf('/') + 1)
        var imageFilePath = 'app/public/images/products/' + imageFileName
        utils.downloadToFile(product.imageUrl, imageFilePath)
      }
      models.Product.create({
        name: name,
        description: description,
        price: price,
        image: imageFileName
      }).success(function (product) {
        if (product.description.match(/Seasonal special offer! Limited availability!/)) {
          products.christmasSpecial = product
          models.sequelize.query('UPDATE Products SET deletedAt = \'2014-12-27 00:00:00.000 +00:00\' WHERE id = ' + product.id)
        } else if (product.description.match(/a href="https:\/\/www\.owasp\.org\/index\.php\/O-Saft"/)) {
          products.osaft = product
        }
      })
    }
  }

  function createBaskets () {
    models.Basket.create({
      UserId: 1
    })
    models.Basket.create({
      UserId: 2
    })
    models.Basket.create({
      UserId: 3
    })
    models.BasketItem.create({
      BasketId: 1,
      ProductId: 1,
      quantity: 2
    })
    models.BasketItem.create({
      BasketId: 1,
      ProductId: 2,
      quantity: 3
    })
    models.BasketItem.create({
      BasketId: 1,
      ProductId: 3,
      quantity: 1
    })
    models.BasketItem.create({
      BasketId: 2,
      ProductId: 4,
      quantity: 2
    })
    models.BasketItem.create({
      BasketId: 3,
      ProductId: 5,
      quantity: 1
    })
  }

  function createFeedback () {
    models.Feedback.create({
      UserId: 1,
      comment: 'I love this shop! Best products in town! Highly recommended!',
      rating: 5
    })
    models.Feedback.create({
      UserId: 2,
      comment: 'Great shop! Awesome service!',
      rating: 4
    })
    models.Feedback.create({
      comment: 'Incompetent customer support! Can\'t even upload photo of broken purchase!<br><em>Support Team: Sorry, only order confirmation PDFs can be attached to complaints!</em>',
      rating: 2
    })
    models.Feedback.create({
      comment: 'This is <b>the</b> store for awesome stuff of all kinds!',
      rating: 4
    })
    models.Feedback.create({
      comment: 'Never gonna buy anywhere else from now on! Thanks for the great service!',
      rating: 4
    })
    models.Feedback.create({
      comment: 'Keep up the good work!',
      rating: 3
    })
    models.Feedback.create({
      UserId: 3,
      comment: 'Nothing useful available here!',
      rating: 1
    })
  }
}
