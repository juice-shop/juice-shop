/* jslint node: true */
const models = require('../models/index')
const datacache = require('./datacache')
const config = require('config')
const utils = require('../lib/utils')
const mongodb = require('./mongodb')
const users = datacache.users
const products = datacache.products

const fs = require('fs')
const path = require('path')
const util = require('util')

const readFile = util.promisify(fs.readFile)

function loadStaticData (file) {
  const filePath = path.resolve('./data/data/' + file + '.json')
  return readFile(filePath, 'utf8')
    .then(JSON.parse)
    .catch(() => console.error('Could not open file: "' + filePath + '"'))
}

function createChallenges () {
  const showHints = config.get('application.showChallengeHints')

  return loadStaticData('challenges').then(
    (challenges) => {
      return Promise.all(
        challenges.map(({ name, category, description, difficulty, hint, hintUrl, key }) => {
          return models.Challenge.create({
            name,
            category,
            description,
            difficulty,
            hint: showHints ? hint : null,
            hintUrl: showHints ? hintUrl : null
          }).then((challenge) => {
            datacache.challenges[key] = challenge
          }).catch(() => {
            console.error(`Could not insert Challenge ${name}`)
          })
        })
      )
    }
  )
}

module.exports = async () => {
  // TODO Wrap entire datacreator into promise to avoid race condition with websocket registration for progress restore
  // This is getting handeling with this refactoring
  createUsers()
  createRandomFakeUsers()
  createProducts()
  createBaskets()
  createFeedback()
  createComplaints()
  createRecycles()
  createSecurityQuestions()
  createSecurityAnswers()

  // This is going to be the new Data Creation Section. TODO Remove this Comment ;)
  const creators = [
    createChallenges
  ]

  // TODO Using async /await would break node 6 compatibility. This should be replaced with default promises
  for (const creator of creators) {
    await creator()
  }
}

function createUsers () {
  models.User.create({
    email: 'admin@' + config.get('application.domain'),
    password: 'admin123'
  }).catch(console.error)
  models.User.create({
    email: 'jim@' + config.get('application.domain'),
    password: 'ncc-1701'
  })
  models.User.create({
    email: 'bender@' + config.get('application.domain'),
    password: 'OhG0dPlease1nsertLiquor!'
  }).then(user => {
    users.bender = user
  })
  models.User.create({
    email: 'bjoern.kimminich@googlemail.com',
    password: 'YmpvZXJuLmtpbW1pbmljaEBnb29nbGVtYWlsLmNvbQ=='
  }).then(user => {
    users.bjoern = user
  })
  models.User.create({
    email: 'ciso@' + config.get('application.domain'),
    password: 'mDLx?94T~1CfVfZMzw@sJ9f?s3L6lbMqE70FfI8^54jbNikY5fymx7c!YbJb'
  }).then(user => {
    users.ciso = user
  })
  models.User.create({
    email: 'support@' + config.get('application.domain'),
    password: 'J6aVjTgOpRs$?5l+Zkq2AYnCE@RF§P'
  }).then(user => {
    users.support = user
  })
  models.User.create({
    email: 'morty@' + config.get('application.domain'),
    password: 'focusOnScienceMorty!focusOnScience'
  }).then(user => {
    users.morty = user
  })
  models.User.create({
    email: 'mc.safesearch@' + config.get('application.domain'),
    password: 'Mr. N00dles'
  }).then(user => {
    users.rapper = user
  })
}

function createRandomFakeUsers () {
  for (let i = 0; i < config.get('application.numberOfRandomFakeUsers'); i++) {
    models.User.create({
      email: getGeneratedRandomFakeUserEmail(),
      password: makeRandomString(5)
    })
  }
}

function getGeneratedRandomFakeUserEmail () {
  const randomDomain = makeRandomString(4).toLowerCase() + '.' + makeRandomString(2).toLowerCase()
  return makeRandomString(5).toLowerCase() + '@' + randomDomain
}

function makeRandomString (length) {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < length; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)) }

  return text
}

function createProducts () {
  function softDeleteIfConfigured ({ name, id }) {
    for (const configuredProduct of config.get('products')) {
      if (name === configuredProduct.name) {
        if (configuredProduct.deletedDate) {
          models.sequelize.query('UPDATE Products SET deletedAt = \'' + configuredProduct.deletedDate + '\' WHERE id = ' + id)
        }
        break
      }
    }
  }

  for (const product of config.get('products')) {
    const name = product.name
    let description = product.description || 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.'
    const reviews = product.reviews
    if (product.useForChristmasSpecialChallenge) {
      description += ' (Seasonal special offer! Limited availability!)'
    } else if (product.urlForProductTamperingChallenge) {
      description += ' <a href="' + product.urlForProductTamperingChallenge + '" target="_blank">More...</a>'
    } else if (product.fileForRetrieveBlueprintChallenge) {
      if (datacache.retrieveBlueprintChallengeFile) {
        console.error('Cannot use ' + product.fileForRetrieveBlueprintChallenge + ' when ' + datacache.retrieveBlueprintChallengeFile + ' is already being used for the Retrieve Blueprint Challenge.')
        process.exit(1)
      }
      let blueprint = product.fileForRetrieveBlueprintChallenge
      if (utils.startsWith(blueprint, 'http')) {
        const blueprintUrl = blueprint
        blueprint = decodeURIComponent(blueprint.substring(blueprint.lastIndexOf('/') + 1))
        utils.downloadToFile(blueprintUrl, 'app/public/images/products/' + blueprint)
      }
      datacache.retrieveBlueprintChallengeFile = blueprint
    }
    const price = product.price || Math.floor(Math.random())
    let image = product.image || 'undefined.png'
    if (utils.startsWith(image, 'http')) {
      const imageUrl = image
      image = decodeURIComponent(image.substring(image.lastIndexOf('/') + 1))
      utils.downloadToFile(imageUrl, 'app/public/images/products/' + image)
    }
    models.Product.create({
      name,
      description,
      price,
      image
    }).then(product => {
      softDeleteIfConfigured(product)
      if (product.description.match(/Seasonal special offer! Limited availability!/)) {
        if (products.christmasSpecial) {
          console.error('Cannot use ' + product.name + ' when ' + products.christmasSpecial.name + ' is already being used for the Christmas Special Challenge.')
          process.exit(1)
        }
        products.christmasSpecial = product
        models.sequelize.query('UPDATE Products SET deletedAt = \'2014-12-27 00:00:00.000 +00:00\' WHERE id = ' + product.id)
      } else if (product.description.match(/a href="https:\/\/www\.owasp\.org\/index\.php\/O-Saft"/)) {
        if (products.osaft) {
          console.error('Cannot use ' + product.name + ' when ' + products.osaft.name + ' is already being used for the Product Tampering Challenge.')
          process.exit(1)
        }
        products.osaft = product
        if (product.deletedAt) { // undo delete to be consistent about corresponding challenge difficulty
          models.sequelize.query('UPDATE Products SET deletedAt = null WHERE id = ' + product.id)
        }
      }
      return product
    }).then(({ id }) => {
      if (reviews) {
        return Promise.all(
          reviews
            .map((review) => {
              review.message = review.text
              review.author = review.author + '@' + config.get('application.domain')
              review.product = id
              return review
            }).map((review) => {
              return mongodb.reviews.insert(review)
            })
        )
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

function createComplaints () {
  models.Complaint.create({
    UserId: 3,
    message: 'I\'ll build my own eCommerce business! With Black Jack! And Hookers!'
  })
}

function createRecycles () {
  models.Recycle.create({
    UserId: 2,
    quantity: 800,
    address: 'Starfleet HQ, 24-593 Federation Drive, San Francisco, CA',
    date: '2270-01-17',
    isPickup: true
  })
}

function createSecurityQuestions () {
  models.SecurityQuestion.create({
    question: 'Your eldest siblings middle name?'
  })
  models.SecurityQuestion.create({
    question: 'Mother\'s maiden name?'
  })
  models.SecurityQuestion.create({
    question: 'Mother\'s birth date? (MM/DD/YY)'
  })
  models.SecurityQuestion.create({
    question: 'Father\'s birth date? (MM/DD/YY)'
  })
  models.SecurityQuestion.create({
    question: 'Maternal grandmother\'s first name?'
  })
  models.SecurityQuestion.create({
    question: 'Paternal grandmother\'s first name?'
  })
  models.SecurityQuestion.create({
    question: 'Name of your favorite pet?'
  })
  models.SecurityQuestion.create({
    question: 'Last name of dentist when you were a teenager? (Do not include \'Dr.\')'
  })
  models.SecurityQuestion.create({
    question: 'Your ZIP/postal code when you were a teenager?'
  })
  models.SecurityQuestion.create({
    question: 'Company you first work for as an adult?'
  })
}

function createSecurityAnswers () {
  models.SecurityAnswer.create({
    SecurityQuestionId: 2,
    UserId: 1,
    answer: '@xI98PxDO+06!'
  }).catch(console.error)
  models.SecurityAnswer.create({
    SecurityQuestionId: 1,
    UserId: 2,
    answer: 'Samuel' // https://en.wikipedia.org/wiki/James_T._Kirk
  })
  models.SecurityAnswer.create({
    SecurityQuestionId: 10,
    UserId: 3,
    answer: 'Stop\'n\'Drop' // http://futurama.wikia.com/wiki/Suicide_booth
  })
  models.SecurityAnswer.create({
    SecurityQuestionId: 9,
    UserId: 4,
    answer: 'West-2082' // http://www.alte-postleitzahlen.de/uetersen
  })
  models.SecurityAnswer.create({
    SecurityQuestionId: 7,
    UserId: 5,
    answer: 'Brd?j8sEMziOvvBf§Be?jFZ77H?hgm'
  })
  models.SecurityAnswer.create({
    SecurityQuestionId: 10,
    UserId: 6,
    answer: 'SC OLEA SRL' // http://www.olea.com.ro/
  })
  models.SecurityAnswer.create({
    SecurityQuestionId: 1,
    UserId: 7,
    answer: 'JeRRy' // bruteforcible/
  })
}
