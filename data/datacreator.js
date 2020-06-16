/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
const models = require('../models/index')
const datacache = require('./datacache')
const config = require('config')
const utils = require('../lib/utils')
const mongodb = require('./mongodb')
const insecurity = require('../lib/insecurity')
const logger = require('../lib/logger')

const fs = require('fs')
const path = require('path')
const util = require('util')
const { safeLoad } = require('js-yaml')
const Entities = require('html-entities').AllHtmlEntities
const entities = new Entities()

const readFile = util.promisify(fs.readFile)

function loadStaticData (file) {
  const filePath = path.resolve('./data/static/' + file + '.yml')
  return readFile(filePath, 'utf8')
    .then(safeLoad)
    .catch(() => logger.error('Could not open file: "' + filePath + '"'))
}

module.exports = async () => {
  const creators = [
    createSecurityQuestions,
    createUsers,
    createChallenges,
    createRandomFakeUsers,
    createProducts,
    createBaskets,
    createBasketItems,
    createAnonymousFeedback,
    createComplaints,
    createRecycleItem,
    createOrders,
    createQuantity,
    createPurchaseQuantity,
    createWallet,
    createDeliveryMethods,
    createMemories
  ]

  for (const creator of creators) {
    await creator()
  }
}

async function createChallenges () {
  const showHints = config.get('challenges.showHints')

  const challenges = await loadStaticData('challenges')

  await Promise.all(
    challenges.map(async ({ name, category, description, difficulty, hint, hintUrl, key, disabledEnv, tutorial }) => {
      const effectiveDisabledEnv = utils.determineDisabledEnv(disabledEnv)
      description = description.replace('juice-sh.op', config.get('application.domain'))
      description = description.replace('&lt;iframe width=&quot;100%&quot; height=&quot;166&quot; scrolling=&quot;no&quot; frameborder=&quot;no&quot; allow=&quot;autoplay&quot; src=&quot;https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/771984076&amp;color=%23ff5500&amp;auto_play=true&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;show_teaser=true&quot;&gt;&lt;/iframe&gt;', entities.encode(config.get('challenges.xssBonusPayload')))
      hint = hint.replace(/OWASP Juice Shop's/, `${config.get('application.name')}'s`)

      try {
        datacache.challenges[key] = await models.Challenge.create({
          key,
          name,
          category,
          description: effectiveDisabledEnv ? (description + ' <em>(This challenge is <strong>' + (config.get('challenges.safetyOverride') ? 'potentially harmful' : 'not available') + '</strong> on ' + effectiveDisabledEnv + '!)</em>') : description,
          difficulty,
          solved: false,
          hint: showHints ? hint : null,
          hintUrl: showHints ? hintUrl : null,
          disabledEnv: config.get('challenges.safetyOverride') ? null : effectiveDisabledEnv,
          tutorialOrder: tutorial ? tutorial.order : null
        })
      } catch (err) {
        logger.error(`Could not insert Challenge ${name}: ${err.message}`)
      }
    })
  )
}

async function createUsers () {
  const users = await loadStaticData('users')

  await Promise.all(
    users.map(async ({ username, email, password, customDomain, key, role, deletedFlag, profileImage, securityQuestion, feedback, address, card, totpSecret = '' }) => {
      try {
        const completeEmail = customDomain ? email : `${email}@${config.get('application.domain')}`
        const user = await models.User.create({
          username,
          email: completeEmail,
          password,
          role,
          deluxeToken: role === insecurity.roles.deluxe ? insecurity.deluxeToken(completeEmail) : '',
          profileImage: `assets/public/images/uploads/${profileImage || 'default.svg'}`,
          totpSecret
        })
        datacache.users[key] = user
        if (securityQuestion) {
          await createSecurityAnswer(user.id, securityQuestion.id, securityQuestion.answer)
        } else {
          if (email === 'john@juice.shop') {
            const securityQuestionId = config.get('challenges.geoStalking.securityQuestionIdEasy')
            const securityQuestionAnswer = config.get('challenges.geoStalking.securityAnswerEasy')
            await createSecurityAnswer(user.id, securityQuestionId, securityQuestionAnswer)
          } else if (email === 'emma@juice.shop') {
            const securityQuestionId = config.get('challenges.geoStalking.securityQuestionIdHard')
            const securityQuestionAnswer = config.get('challenges.geoStalking.securityAnswerHard')
            await createSecurityAnswer(user.id, securityQuestionId, securityQuestionAnswer)
          }
        }
        if (feedback) await createFeedback(user.id, feedback.comment, feedback.rating, user.email)
        if (deletedFlag) await deleteUser(user.id)
        if (address) await createAddresses(user.id, address)
        if (card) await createCards(user.id, card)
      } catch (err) {
        logger.error(`Could not insert User ${key}: ${err.message}`)
      }
    })
  )
}

async function createWallet () {
  const users = await loadStaticData('users')
  return Promise.all(
    users.map((user, index) => {
      return models.Wallet.create({
        UserId: index + 1,
        balance: user.walletBalance !== undefined ? user.walletBalance : 0
      }).catch((err) => {
        logger.error(`Could not create wallet: ${err.message}`)
      })
    })
  )
}

async function createDeliveryMethods () {
  const deliveries = await loadStaticData('deliveries')

  await Promise.all(
    deliveries.map(async ({ name, price, deluxePrice, eta, icon }) => {
      try {
        await models.Delivery.create({
          name,
          price,
          deluxePrice,
          eta,
          icon
        })
      } catch (err) {
        logger.error(`Could not insert Delivery Method: ${err.message}`)
      }
    })
  )
}

function createAddresses (UserId, addresses) {
  addresses.map((address) => {
    return models.Address.create({
      UserId: UserId,
      country: address.country,
      fullName: address.fullName,
      mobileNum: address.mobileNum,
      zipCode: address.zipCode,
      streetAddress: address.streetAddress,
      city: address.city,
      state: address.state ? address.state : null
    }).catch((err) => {
      logger.error(`Could not create address: ${err.message}`)
    })
  })
}

function createCards (UserId, cards) {
  cards.map((card) => {
    return models.Card.create({
      UserId: UserId,
      fullName: card.fullName,
      cardNum: card.cardNum,
      expMonth: card.expMonth,
      expYear: card.expYear
    }).catch((err) => {
      logger.error(`Could not create card: ${err.message}`)
    })
  })
}

function deleteUser (userId) {
  return models.User.destroy({ where: { id: userId } }).catch((err) => {
    logger.error(`Could not perform soft delete for the user ${userId}: ${err.message}`)
  })
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

function createQuantity () {
  return Promise.all(
    config.get('products').map((product, index) => {
      return models.Quantity.create({
        ProductId: index + 1,
        quantity: product.quantity !== undefined ? product.quantity : Math.floor(Math.random() * 70 + 30),
        limitPerUser: product.limitPerUser || null
      }).catch((err) => {
        logger.error(`Could not create quantity: ${err.message}`)
      })
    })
  )
}
function createMemories () {
  const memories = [models.Memory.create({
    imagePath: 'assets/public/images/uploads/😼-#zatschi-#whoneedsfourlegs-1572600969477.jpg',
    caption: '😼 #zatschi #whoneedsfourlegs',
    UserId: datacache.users.bjoernOwasp.id
  }).catch((err) => {
    logger.error(`Could not create memory: ${err.message}`)
  })]
  Array.prototype.push.apply(memories, Promise.all(
    config.get('memories').map((memory) => {
      let tmpImageFileName = memory.image
      if (utils.startsWith(memory.image, 'http')) {
        const imageUrl = memory.image
        tmpImageFileName = utils.extractFilename(memory.image)
        utils.downloadToFile(imageUrl, 'frontend/dist/frontend/assets/public/images/uploads/' + tmpImageFileName)
      }
      return models.Memory.create({
        imagePath: 'assets/public/images/uploads/' + tmpImageFileName,
        caption: memory.caption,
        UserId: datacache.users[memory.user].id
      }).catch((err) => {
        logger.error(`Could not create memory: ${err.message}`)
      })
    })
  ))
  return memories
}

function createProducts () {
  const products = utils.thaw(config.get('products')).map((product) => {
    product.price = product.price || Math.floor(Math.random() * 9 + 1)
    product.deluxePrice = product.deluxePrice || product.price
    product.description = product.description || 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.'

    // set default image values
    product.image = product.image || 'undefined.png'
    if (utils.startsWith(product.image, 'http')) {
      const imageUrl = product.image
      product.image = utils.extractFilename(product.image)
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
  const pastebinLeakChallengeProduct = products.find(({ keywordsForPastebinDataLeakChallenge }) => keywordsForPastebinDataLeakChallenge)
  const tamperingChallengeProduct = products.find(({ urlForProductTamperingChallenge }) => urlForProductTamperingChallenge)
  const blueprintRetrivalChallengeProduct = products.find(({ fileForRetrieveBlueprintChallenge }) => fileForRetrieveBlueprintChallenge)

  chrismasChallengeProduct.description += ' (Seasonal special offer! Limited availability!)'
  chrismasChallengeProduct.deletedAt = '2014-12-27 00:00:00.000 +00:00'
  tamperingChallengeProduct.description += ' <a href="' + tamperingChallengeProduct.urlForProductTamperingChallenge + '" target="_blank">More...</a>'
  tamperingChallengeProduct.deletedAt = null
  pastebinLeakChallengeProduct.description += ' (This product is unsafe! We plan to remove it from the stock!)'
  pastebinLeakChallengeProduct.deletedAt = '2019-02-1 00:00:00.000 +00:00'

  let blueprint = blueprintRetrivalChallengeProduct.fileForRetrieveBlueprintChallenge
  if (utils.startsWith(blueprint, 'http')) {
    const blueprintUrl = blueprint
    blueprint = utils.extractFilename(blueprint)
    utils.downloadToFile(blueprintUrl, 'frontend/dist/frontend/assets/public/images/products/' + blueprint)
  }
  datacache.retrieveBlueprintChallengeFile = blueprint

  return Promise.all(
    products.map(
      ({ reviews = [], useForChristmasSpecialChallenge = false, urlForProductTamperingChallenge = false, fileForRetrieveBlueprintChallenge = false, ...product }) =>
        models.Product.create(product).catch(
          (err) => {
            logger.error(`Could not insert Product ${product.name}: ${err.message}`)
          }
        ).then((persistedProduct) => {
          if (useForChristmasSpecialChallenge) { datacache.products.christmasSpecial = persistedProduct }
          if (urlForProductTamperingChallenge) {
            datacache.products.osaft = persistedProduct
            datacache.challenges.changeProductChallenge.update({
              description: customizeChangeProductChallenge(
                datacache.challenges.changeProductChallenge.description,
                config.get('challenges.overwriteUrlForProductTamperingChallenge'),
                persistedProduct)
            })
          }
          if (fileForRetrieveBlueprintChallenge && datacache.challenges.changeProductChallenge.hint) {
            datacache.challenges.retrieveBlueprintChallenge.update({
              hint: customizeRetrieveBlueprintChallenge(
                datacache.challenges.retrieveBlueprintChallenge.hint,
                persistedProduct)
            })
          }
          return persistedProduct
        })
          .then(({ id }) =>
            Promise.all(
              reviews.map(({ text, author }) =>
                mongodb.reviews.insert({
                  message: text,
                  author: datacache.users[author].email,
                  product: id,
                  likesCount: 0,
                  likedBy: []
                }).catch((err) => {
                  logger.error(`Could not insert Product Review ${text}: ${err.message}`)
                })
              )
            )
          )
    )
  )

  function customizeChangeProductChallenge (description, customUrl, customProduct) {
    let customDescription = description.replace(/OWASP SSL Advanced Forensic Tool \(O-Saft\)/g, customProduct.name)
    customDescription = customDescription.replace('https://owasp.slack.com', customUrl)
    return customDescription
  }

  function customizeRetrieveBlueprintChallenge (hint, customProduct) {
    return hint.replace(/OWASP Juice Shop Logo \(3D-printed\)/g, customProduct.name)
  }
}

function createBaskets () {
  const baskets = [
    { UserId: 1 },
    { UserId: 2 },
    { UserId: 3 },
    { UserId: 11 },
    { UserId: 16 }
  ]

  return Promise.all(
    baskets.map(basket => {
      models.Basket.create(basket).catch((err) => {
        logger.error(`Could not insert Basket for UserId ${basket.UserId}: ${err.message}`)
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
      ProductId: 4,
      quantity: 1
    },
    {
      BasketId: 4,
      ProductId: 4,
      quantity: 2
    },
    {
      BasketId: 5,
      ProductId: 3,
      quantity: 5
    },
    {
      BasketId: 5,
      ProductId: 4,
      quantity: 2
    }
  ]

  return Promise.all(
    basketItems.map(basketItem => {
      models.BasketItem.create(basketItem).catch((err) => {
        logger.error(`Could not insert BasketItem for BasketId ${basketItem.BasketId}: ${err.message}`)
      })
    })
  )
}

function createAnonymousFeedback () {
  const feedbacks = [
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
    }
  ]

  return Promise.all(
    feedbacks.map((feedback) => createFeedback(null, feedback.comment, feedback.rating))
  )
}

function createFeedback (UserId, comment, rating, author) {
  const authoredComment = author ? `${comment} (***${author.slice(3)})` : `${comment} (anonymous)`
  return models.Feedback.create({ UserId, comment: authoredComment, rating }).catch((err) => {
    logger.error(`Could not insert Feedback ${authoredComment} mapped to UserId ${UserId}: ${err.message}`)
  })
}

function createComplaints () {
  return models.Complaint.create({
    UserId: 3,
    message: 'I\'ll build my own eCommerce business! With Black Jack! And Hookers!'
  }).catch((err) => {
    logger.error(`Could not insert Complaint: ${err.message}`)
  })
}

function createRecycleItem () {
  const recycles = [
    {
      UserId: 2,
      quantity: 800,
      AddressId: 4,
      date: '2270-01-17',
      isPickup: true
    },
    {
      UserId: 3,
      quantity: 1320,
      AddressId: 6,
      date: '2006-01-14',
      isPickup: true
    },
    {
      UserId: 4,
      quantity: 120,
      AddressId: 1,
      date: '2018-04-16',
      isPickup: true
    },
    {
      UserId: 1,
      quantity: 300,
      AddressId: 3,
      date: '2018-01-17',
      isPickup: true
    },
    {
      UserId: 4,
      quantity: 350,
      AddressId: 1,
      date: '2018-03-17',
      isPickup: true
    },
    {
      UserId: 3,
      quantity: 200,
      AddressId: 6,
      date: '2018-07-17',
      isPickup: true
    },
    {
      UserId: 4,
      quantity: 140,
      AddressId: 1,
      date: '2018-03-19',
      isPickup: true
    },
    {
      UserId: 1,
      quantity: 150,
      AddressId: 3,
      date: '2018-05-12',
      isPickup: true
    },
    {
      UserId: 16,
      quantity: 500,
      AddressId: 2,
      date: '2019-02-18',
      isPickup: true
    }
  ]
  return Promise.all(
    recycles.map((recycle) => createRecycle(recycle))
  )
}

function createRecycle (data) {
  return models.Recycle.create(data).catch((err) => {
    logger.error(`Could not insert Recycling Model: ${err.message}`)
  })
}

async function createSecurityQuestions () {
  const questions = await loadStaticData('securityQuestions')

  await Promise.all(
    questions.map(async ({ question }) => {
      try {
        await models.SecurityQuestion.create({ question })
      } catch (err) {
        logger.error(`Could not insert SecurityQuestion ${question}: ${err.message}`)
      }
    })
  )
}

function createSecurityAnswer (UserId, SecurityQuestionId, answer) {
  return models.SecurityAnswer.create({ SecurityQuestionId, UserId, answer }).catch((err) => {
    logger.error(`Could not insert SecurityAnswer ${answer} mapped to UserId ${UserId}: ${err.message}`)
  })
}

function createOrders () {
  const email = 'admin@' + config.get('application.domain')
  const products = config.get('products')
  const basket1Products = [
    {
      quantity: 3,
      id: products[0].id,
      name: products[0].name,
      price: products[0].price,
      total: products[0].price * 3
    },
    {
      quantity: 1,
      id: products[1].id,
      name: products[1].name,
      price: products[1].price,
      total: products[1].price * 1
    }
  ]

  const basket2Products = [
    {
      quantity: 3,
      id: products[2].id,
      name: products[2].name,
      price: products[2].price,
      total: products[2].price * 3
    }
  ]

  const basket3Products = [
    {
      quantity: 3,
      id: products[0].id,
      name: products[0].name,
      price: products[0].price,
      total: products[0].price * 3
    },
    {
      quantity: 5,
      id: products[3].id,
      name: products[3].name,
      price: products[3].price,
      total: products[3].price * 5
    }
  ]

  const orders = [
    {
      orderId: insecurity.hash(email).slice(0, 4) + '-' + utils.randomHexString(16),
      email: (email ? email.replace(/[aeiou]/gi, '*') : undefined),
      totalPrice: basket1Products[0].total + basket1Products[1].total,
      products: basket1Products,
      eta: Math.floor((Math.random() * 5) + 1).toString(),
      delivered: false
    },
    {
      orderId: insecurity.hash(email).slice(0, 4) + '-' + utils.randomHexString(16),
      email: (email ? email.replace(/[aeiou]/gi, '*') : undefined),
      totalPrice: basket2Products[0].total,
      products: basket2Products,
      eta: '0',
      delivered: true
    },
    {
      orderId: insecurity.hash('demo').slice(0, 4) + '-' + utils.randomHexString(16),
      email: 'demo'.replace(/[aeiou]/gi, '*'),
      totalPrice: basket3Products[0].total + basket3Products[1].total,
      products: basket3Products,
      eta: '0',
      delivered: true
    }
  ]

  return Promise.all(
    orders.map(({ orderId, email, totalPrice, products, eta, delivered }) =>
      mongodb.orders.insert({
        orderId: orderId,
        email: email,
        totalPrice: totalPrice,
        products: products,
        eta: eta,
        delivered: delivered
      }).catch((err) => {
        logger.error(`Could not insert Order ${orderId}: ${err.message}`)
      })
    )
  )
}

function createPurchaseQuantity () {
  const orderedQuantitys = [
    {
      quantity: 3,
      ProductId: 1,
      UserId: 1
    },
    {
      quantity: 1,
      ProductId: 2,
      UserId: 1
    },
    {
      quantity: 3,
      ProductId: 3,
      UserId: 1
    }
  ]

  return Promise.all(
    orderedQuantitys.map(orderedQuantity => {
      models.PurchaseQuantity.create(orderedQuantity).catch((err) => {
        logger.error(`Could not insert ordered quantity: ${err.message}`)
      })
    })
  )
}
