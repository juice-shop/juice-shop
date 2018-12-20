/* jslint node: true */
const models = require('../models/index')
const datacache = require('./datacache')
const config = require('config')
const utils = require('../lib/utils')
const mongodb = require('./mongodb')
const insecurity = require('../lib/insecurity')

const fs = require('fs')
const path = require('path')
const util = require('util')
const { safeLoad } = require('js-yaml')

const readFile = util.promisify(fs.readFile)

function loadStaticData (file) {
  const filePath = path.resolve('./data/static/' + file + '.yml')
  return readFile(filePath, 'utf8')
    .then(safeLoad)
    .catch(() => console.error('Could not open file: "' + filePath + '"'))
}

module.exports = async () => {
  const creators = [
    createUsers,
    createChallenges,
    createRandomFakeUsers,
    createProducts,
    createBaskets,
    createBasketItems,
    createFeedback,
    createComplaints,
    createRecycles,
    createSecurityQuestions,
    createSecurityAnswers,
    createOrders
  ]

  for (const creator of creators) {
    await creator()
  }
}

async function createChallenges () {
  const showHints = config.get('application.showChallengeHints')

  const challenges = await loadStaticData('challenges')

  await Promise.all(
    challenges.map(async ({ name, category, description, difficulty, hint, hintUrl, key, disabledEnv }) => {
      let effectiveDisabledEnv = utils.determineDisabledContainerEnv(disabledEnv)
      try {
        const challenge = await models.Challenge.create({
          key,
          name,
          category,
          description: effectiveDisabledEnv ? (description + ' <em>(This challenge is <strong>' + (config.get('challenges.safetyOverride') ? 'potentially harmful' : 'not available') + '</strong> on ' + effectiveDisabledEnv + '!)</em>') : description,
          difficulty,
          solved: false,
          hint: showHints ? hint : null,
          hintUrl: showHints ? hintUrl : null,
          disabledEnv: config.get('challenges.safetyOverride') ? null : effectiveDisabledEnv
        })
        datacache.challenges[key] = challenge
      } catch (err) {
        console.error(`Could not insert Challenge ${name}`)
        console.error(err)
      }
    })
  )
}

async function createUsers () {
  const users = await loadStaticData('users')

  await Promise.all(
    users.map(async ({ email, password, customDomain, key, isAdmin, profileImage }) => {
      try {
        const completeEmail = customDomain ? email : `${email}@${config.get('application.domain')}`
        const user = await models.User.create({
          email: completeEmail,
          password,
          isAdmin,
          profileImage: profileImage || 'default.svg'
        })
        datacache.users[key] = user
      } catch (err) {
        console.error(`Could not insert User ${name}`)
        console.error(err)
      }
    })
  )
}

function createRandomFakeUsers () {
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

  return Promise.all(new Array(config.get('application.numberOfRandomFakeUsers')).fill(0).map(
    () => models.User.create({
      email: getGeneratedRandomFakeUserEmail(),
      password: makeRandomString(5)
    })
  ))
}

function createProducts () {
  const products = config.get('products').map((product) => {
    // set default price values
    product.price = product.price || Math.floor(Math.random())
    product.description = product.description || 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.'

    // set default image values
    product.image = product.image || 'undefined.png'
    if (utils.startsWith(product.image, 'http')) {
      const imageUrl = product.image
      product.image = decodeURIComponent(product.image.substring(product.image.lastIndexOf('/') + 1))
      // utils.downloadToFile(imageUrl, 'app/public/images/products/' + product.image)
      utils.downloadToFile(imageUrl, 'frontend/dist/frontend/assets/public/images/products/' + product.image)
    }

    // set deleted at values if configured
    if (product.deletedDate) {
      product.deletedAt = product.deletedDate
      delete product.deletedDate
    }

    return product
  })

  // add Challenge specific information
  const chrismasChallengeProduct = products.find(({ useForChristmasSpecialChallenge }) => useForChristmasSpecialChallenge)
  const tamperingChallengeProduct = products.find(({ urlForProductTamperingChallenge }) => urlForProductTamperingChallenge)
  const blueprintRetrivalChallengeProduct = products.find(({ fileForRetrieveBlueprintChallenge }) => fileForRetrieveBlueprintChallenge)

  chrismasChallengeProduct.description += ' (Seasonal special offer! Limited availability!)'
  chrismasChallengeProduct.deletedAt = '2014-12-27 00:00:00.000 +00:00'
  tamperingChallengeProduct.description += ' <a href="' + tamperingChallengeProduct.urlForProductTamperingChallenge + '" target="_blank">More...</a>'
  tamperingChallengeProduct.deletedAt = null

  let blueprint = blueprintRetrivalChallengeProduct.fileForRetrieveBlueprintChallenge
  if (utils.startsWith(blueprint, 'http')) {
    const blueprintUrl = blueprint
    blueprint = decodeURIComponent(blueprint.substring(blueprint.lastIndexOf('/') + 1))
    utils.downloadToFile(blueprintUrl, 'frontend/dist/frontend/assets/public/images/products/' + blueprint)
  }
  datacache.retrieveBlueprintChallengeFile = blueprint

  return Promise.all(
    products.map(
      ({ reviews = [], useForChristmasSpecialChallenge = false, urlForProductTamperingChallenge = false, ...product }) =>
        models.Product.create(product).catch(
          (err) => {
            console.error(`Could not insert Product ${product.name}`)
            console.error(err)
          }
        ).then((persistedProduct) => {
          if (useForChristmasSpecialChallenge) { datacache.products.christmasSpecial = persistedProduct }
          if (urlForProductTamperingChallenge) { datacache.products.osaft = persistedProduct }
          return persistedProduct
        })
          .then(({ id }) =>
            Promise.all(
              reviews.map(({ text, author }) =>
                mongodb.reviews.insert({
                  message: text,
                  author: `${author}@${config.get('application.domain')}`,
                  product: id,
                  likesCount: 0,
                  likedBy: []
                }).catch((err) => {
                  console.error(`Could not insert Product Review ${text}`)
                  console.error(err)
                })
              )
            )
          )
    )
  )
}

function createBaskets () {
  const baskets = [
    { UserId: 1 },
    { UserId: 2 },
    { UserId: 3 }
  ]

  return Promise.all(
    baskets.map(basket => {
      models.Basket.create(basket).catch((err) => {
        console.error(`Could not insert Basket for UserId ${basket.UserId}`)
        console.error(err)
      })
    })
  )
}

function createBasketItems () {
  const basketItems = [
    {
      BasketId: 1,
      ProductId: 1,
      quantity: 2
    },
    {
      BasketId: 1,
      ProductId: 2,
      quantity: 3
    },
    {
      BasketId: 1,
      ProductId: 3,
      quantity: 1
    },
    {
      BasketId: 2,
      ProductId: 4,
      quantity: 2
    },
    {
      BasketId: 3,
      ProductId: 5,
      quantity: 1
    }
  ]

  return Promise.all(
    basketItems.map(basketItem => {
      models.BasketItem.create(basketItem).catch((err) => {
        console.error(`Could not insert BasketItem for BasketId ${basketItem.BasketId}`)
        console.error(err)
      })
    })
  )
}

function createFeedback () {
  const feedbacks = [
    {
      UserId: 1,
      comment: 'I love this shop! Best products in town! Highly recommended!',
      rating: 5
    },
    {
      UserId: 2,
      comment: 'Great shop! Awesome service!',
      rating: 4
    },
    {
      comment: 'Incompetent customer support! Can\'t even upload photo of broken purchase!<br><em>Support Team: Sorry, only order confirmation PDFs can be attached to complaints!</em>',
      rating: 2
    },
    {
      comment: 'This is <b>the</b> store for awesome stuff of all kinds!',
      rating: 4
    },
    {
      comment: 'Never gonna buy anywhere else from now on! Thanks for the great service!',
      rating: 4
    },
    {
      comment: 'Keep up the good work!',
      rating: 3
    },
    {
      UserId: 3,
      comment: 'Nothing useful available here!',
      rating: 1
    }
  ]

  return Promise.all(
    feedbacks.map((feedback) => models.Feedback.create(feedback).catch((err) => {
      console.error(`Could not insert Feedback ${feedback.comment}`)
      console.error(err)
    }))
  )
}

function createComplaints () {
  return models.Complaint.create({
    UserId: 3,
    message: 'I\'ll build my own eCommerce business! With Black Jack! And Hookers!'
  }).catch((err) => {
    console.error(`Could not insert Complaint`)
    console.error(err)
  })
}

function createRecycles () {
  return models.Recycle.create({
    UserId: 2,
    quantity: 800,
    address: 'Starfleet HQ, 24-593 Federation Drive, San Francisco, CA',
    date: '2270-01-17',
    isPickup: true
  }).catch((err) => {
    console.error(`Could not insert Recycling Model`)
    console.error(err)
  })
}

function createSecurityQuestions () {
  const questions = [
    'Your eldest siblings middle name?',
    'Mother\'s maiden name?',
    'Mother\'s birth date? (MM/DD/YY)',
    'Father\'s birth date? (MM/DD/YY)',
    'Maternal grandmother\'s first name?',
    'Paternal grandmother\'s first name?',
    'Name of your favorite pet?',
    'Last name of dentist when you were a teenager? (Do not include \'Dr.\')',
    'Your ZIP/postal code when you were a teenager?',
    'Company you first work for as an adult?'
  ]

  return Promise.all(
    questions.map((question) => models.SecurityQuestion.create({ question }).catch((err) => {
      console.error(`Could not insert SecurityQuestion ${question}`)
      console.error(err)
    }))
  )
}

function createSecurityAnswers () {
  const answers = [{
    SecurityQuestionId: 2,
    UserId: 1,
    answer: '@xI98PxDO+06!'
  }, {
    SecurityQuestionId: 1,
    UserId: 2,
    answer: 'Samuel' // https://en.wikipedia.org/wiki/James_T._Kirk
  }, {
    SecurityQuestionId: 10,
    UserId: 3,
    answer: 'Stop\'n\'Drop' // http://futurama.wikia.com/wiki/Suicide_booth
  }, {
    SecurityQuestionId: 7,
    UserId: 5,
    answer: 'Brd?j8sEMziOvvBf§Be?jFZ77H?hgm'
  }, {
    SecurityQuestionId: 10,
    UserId: 6,
    answer: 'SC OLEA SRL' // http://www.olea.com.ro/
  }, {
    SecurityQuestionId: 7,
    UserId: 7,
    answer: '5N0wb41L' // http://rickandmorty.wikia.com/wiki/Snuffles
  }, {
    SecurityQuestionId: 1,
    UserId: 8,
    answer: 'I even shared my pizza bagels with you!'
  }, {
    SecurityQuestionId: 1,
    UserId: 9,
    answer: 'azjTLprq2im6p86RbFrA41L'
  }, {
    SecurityQuestionId: 1,
    UserId: 10,
    answer: 'NZMJLjEinU7TFElDIYW8'
  }, {
    SecurityQuestionId: 8,
    UserId: 11,
    answer: 'Dr. Dr. Dr. Dr. Zoidberg'
  }, {
    SecurityQuestionId: 9,
    UserId: 12,
    answer: 'West-2082' // http://www.alte-postleitzahlen.de/uetersen
  }, {
    SecurityQuestionId: 7,
    UserId: 13,
    answer: 'Zaya'
  }]

  return Promise.all(
    answers.map(answer => models.SecurityAnswer.create(answer).catch(err => {
      console.error(`Could not insert SecurityAnswer for UserId ${answer.UserId}`)
      console.error(err)
    }))
  )
}

function createOrders () {
  const email = 'admin@' + config.get('application.domain')
  const products = config.get('products')
  const basket1Products = [
    {
      quantity: 3,
      name: products[0].name,
      price: products[0].price,
      total: products[0].price * 3
    },
    {
      quantity: 1,
      name: products[1].name,
      price: products[1].price,
      total: products[1].price * 1
    }
  ]

  const basket2Products = [
    {
      quantity: 3,
      name: products[2].name,
      price: products[2].price,
      total: products[2].price * 3
    }
  ]

  const orders = [
    {
      orderId: insecurity.hash(email).slice(0, 4) + '-' + utils.randomHexString(16),
      email: (email ? email.replace(/[aeiou]/gi, '*') : undefined),
      totalPrice: basket1Products[0].total + basket1Products[1].total,
      products: basket1Products,
      eta: Math.floor((Math.random() * 5) + 1).toString()
    },
    {
      orderId: insecurity.hash(email).slice(0, 4) + '-' + utils.randomHexString(16),
      email: (email ? email.replace(/[aeiou]/gi, '*') : undefined),
      totalPrice: basket2Products[0].total,
      products: basket2Products,
      eta: Math.floor((Math.random() * 5) + 1).toString()
    }
  ]

  return Promise.all(
    orders.map(({ orderId, email, totalPrice, products, eta }) =>
      mongodb.orders.insert({
        orderId: orderId,
        email: email,
        totalPrice: totalPrice,
        products: products,
        eta: eta
      }).catch((err) => {
        console.error(`Could not insert Order ${orderId}`)
        console.error(err)
      })
    )
  )
}
