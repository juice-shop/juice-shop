/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
import { AddressModel } from '../models/address'
import { BasketModel } from '../models/basket'
import { BasketItemModel } from '../models/basketitem'
import { CardModel } from '../models/card'
import { ChallengeModel } from '../models/challenge'
import { ComplaintModel } from '../models/complaint'
import { DeliveryModel } from '../models/delivery'
import { FeedbackModel } from '../models/feedback'
import { MemoryModel } from '../models/memory'
import { ProductModel } from '../models/product'
import { QuantityModel } from '../models/quantity'
import { RecycleModel } from '../models/recycle'
import { SecurityAnswerModel } from '../models/securityAnswer'
import { SecurityQuestionModel } from '../models/securityQuestion'
import { UserModel } from '../models/user'
import { WalletModel } from '../models/wallet'
import { Address, Card, Challenge, Delivery, Memory, Product, SecurityQuestion, User } from './types'
const datacache = require('./datacache')
const config = require('config')
const utils = require('../lib/utils')
const mongodb = require('./mongodb')
const security = require('../lib/insecurity')
const logger = require('../lib/logger')

const fs = require('fs')
const path = require('path')
const util = require('util')
const { safeLoad } = require('js-yaml')
const Entities = require('html-entities').AllHtmlEntities
const entities = new Entities()

const readFile = util.promisify(fs.readFile)

function loadStaticData (file: string) {
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
  const showMitigations = config.get('challenges.showMitigations')

  const challenges = await loadStaticData('challenges')

  await Promise.all(
    challenges.map(async ({ name, category, description, difficulty, hint, hintUrl, mitigationUrl, key, disabledEnv, tutorial, tags }: Challenge) => {
      const effectiveDisabledEnv = utils.determineDisabledEnv(disabledEnv)
      description = description.replace('juice-sh.op', config.get('application.domain'))
      description = description.replace('&lt;iframe width=&quot;100%&quot; height=&quot;166&quot; scrolling=&quot;no&quot; frameborder=&quot;no&quot; allow=&quot;autoplay&quot; src=&quot;https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/771984076&amp;color=%23ff5500&amp;auto_play=true&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;show_teaser=true&quot;&gt;&lt;/iframe&gt;', entities.encode(config.get('challenges.xssBonusPayload')))
      hint = hint.replace(/OWASP Juice Shop's/, `${config.get('application.name')}'s`)

      try {
        datacache.challenges[key] = await ChallengeModel.create({
          key,
          name,
          category,
          tags: tags ? tags.join(',') : undefined,
          description: effectiveDisabledEnv ? (description + ' <em>(This challenge is <strong>' + (config.get('challenges.safetyOverride') ? 'potentially harmful' : 'not available') + '</strong> on ' + effectiveDisabledEnv + '!)</em>') : description,
          difficulty,
          solved: false,
          hint: showHints ? hint : null,
          hintUrl: showHints ? hintUrl : null,
          mitigationUrl: showMitigations ? mitigationUrl : null,
          disabledEnv: config.get('challenges.safetyOverride') ? null : effectiveDisabledEnv,
          tutorialOrder: tutorial ? tutorial.order : null,
          codingChallengeStatus: 0
        })
      } catch (err) {
        logger.error(`Could not insert Challenge ${name}: ${utils.getErrorMessage(err)}`)
      }
    })
  )
}

async function createUsers () {
  const users = await loadStaticData('users')

  await Promise.all(
    users.map(async ({ username, email, password, customDomain, key, role, deletedFlag, profileImage, securityQuestion, feedback, address, card, totpSecret = '' }: User) => {
      try {
        const completeEmail = customDomain ? email : `${email}@${config.get('application.domain')}`
        const user = await UserModel.create({
          username,
          email: completeEmail,
          password,
          role,
          deluxeToken: role === security.roles.deluxe ? security.deluxeToken(completeEmail) : '',
          profileImage: `assets/public/images/uploads/${profileImage ?? (role === security.roles.admin ? 'defaultAdmin.png' : 'default.svg')}`,
          totpSecret
        })
        datacache.users[key] = user
        if (securityQuestion) await createSecurityAnswer(user.id, securityQuestion.id, securityQuestion.answer)
        if (feedback) await createFeedback(user.id, feedback.comment, feedback.rating, user.email)
        if (deletedFlag) await deleteUser(user.id)
        if (address) await createAddresses(user.id, address)
        if (card) await createCards(user.id, card)
      } catch (err) {
        logger.error(`Could not insert User ${key}: ${utils.getErrorMessage(err)}`)
      }
    })
  )
}

async function createWallet () {
  const users = await loadStaticData('users')
  return await Promise.all(
    users.map(async (user: User, index: number) => {
      return await WalletModel.create({
        UserId: index + 1,
        balance: user.walletBalance !== undefined ? user.walletBalance : 0
      }).catch((err: unknown) => {
        logger.error(`Could not create wallet: ${utils.getErrorMessage(err)}`)
      })
    })
  )
}

async function createDeliveryMethods () {
  const deliveries = await loadStaticData('deliveries')

  await Promise.all(
    deliveries.map(async ({ name, price, deluxePrice, eta, icon }: Delivery) => {
      try {
        await DeliveryModel.create({
          name,
          price,
          deluxePrice,
          eta,
          icon
        })
      } catch (err) {
        logger.error(`Could not insert Delivery Method: ${utils.getErrorMessage(err)}`)
      }
    })
  )
}

function createAddresses (UserId: number, addresses: Address[]) {
  addresses.map(async (address) => {
    return await AddressModel.create({
      UserId: UserId,
      country: address.country,
      fullName: address.fullName,
      mobileNum: address.mobileNum,
      zipCode: address.zipCode,
      streetAddress: address.streetAddress,
      city: address.city,
      state: address.state ? address.state : null
    }).catch((err: unknown) => {
      logger.error(`Could not create address: ${utils.getErrorMessage(err)}`)
    })
  })
}

async function createCards (UserId: number, cards: Card[]) {
  return await Promise.all(cards.map(async (card) => {
    return await CardModel.create({
      UserId: UserId,
      fullName: card.fullName,
      cardNum: Number(card.cardNum),
      expMonth: card.expMonth,
      expYear: card.expYear
    }).catch((err: unknown) => {
      logger.error(`Could not create card: ${utils.getErrorMessage(err)}`)
    })
  }))
}

async function deleteUser (userId: number) {
  return await UserModel.destroy({ where: { id: userId } }).catch((err: unknown) => {
    logger.error(`Could not perform soft delete for the user ${userId}: ${utils.getErrorMessage(err)}`)
  })
}

async function createRandomFakeUsers () {
  function getGeneratedRandomFakeUserEmail () {
    const randomDomain = makeRandomString(4).toLowerCase() + '.' + makeRandomString(2).toLowerCase()
    return makeRandomString(5).toLowerCase() + '@' + randomDomain
  }

  function makeRandomString (length: number) {
    let text = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (let i = 0; i < length; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)) }

    return text
  }

  return await Promise.all(new Array(config.get('application.numberOfRandomFakeUsers')).fill(0).map(
    async () => await UserModel.create({
      email: getGeneratedRandomFakeUserEmail(),
      password: makeRandomString(5)
    })
  ))
}

async function createQuantity () {
  return await Promise.all(
    config.get('products').map(async (product: Product, index: number) => {
      return await QuantityModel.create({
        ProductId: index + 1,
        quantity: product.quantity !== undefined ? product.quantity : Math.floor(Math.random() * 70 + 30),
        limitPerUser: product.limitPerUser ?? null
      }).catch((err: unknown) => {
        logger.error(`Could not create quantity: ${utils.getErrorMessage(err)}`)
      })
    })
  )
}

async function createMemories () {
  const memories = [
    MemoryModel.create({
      imagePath: 'assets/public/images/uploads/😼-#zatschi-#whoneedsfourlegs-1572600969477.jpg',
      caption: '😼 #zatschi #whoneedsfourlegs',
      UserId: datacache.users.bjoernOwasp.id
    }).catch((err: unknown) => {
      logger.error(`Could not create memory: ${utils.getErrorMessage(err)}`)
    }),
    ...utils.thaw(config.get('memories')).map(async (memory: Memory) => {
      let tmpImageFileName = memory.image
      if (utils.isUrl(memory.image)) {
        const imageUrl = memory.image
        tmpImageFileName = utils.extractFilename(memory.image)
        utils.downloadToFile(imageUrl, 'frontend/dist/frontend/assets/public/images/uploads/' + tmpImageFileName)
      }
      if (memory.geoStalkingMetaSecurityQuestion && memory.geoStalkingMetaSecurityAnswer) {
        await createSecurityAnswer(datacache.users.john.id, memory.geoStalkingMetaSecurityQuestion, memory.geoStalkingMetaSecurityAnswer)
        memory.user = 'john'
      }
      if (memory.geoStalkingVisualSecurityQuestion && memory.geoStalkingVisualSecurityAnswer) {
        await createSecurityAnswer(datacache.users.emma.id, memory.geoStalkingVisualSecurityQuestion, memory.geoStalkingVisualSecurityAnswer)
        memory.user = 'emma'
      }
      return await MemoryModel.create({
        imagePath: 'assets/public/images/uploads/' + tmpImageFileName,
        caption: memory.caption,
        UserId: datacache.users[memory.user].id
      }).catch((err: unknown) => {
        logger.error(`Could not create memory: ${utils.getErrorMessage(err)}`)
      })
    })
  ]

  return await Promise.all(memories)
}

async function createProducts () {
  const products = utils.thaw(config.get('products')).map((product: Product) => {
    product.price = product.price ?? Math.floor(Math.random() * 9 + 1)
    product.deluxePrice = product.deluxePrice ?? product.price
    product.description = product.description || 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.'

    // set default image values
    product.image = product.image ?? 'undefined.png'
    if (utils.isUrl(product.image)) {
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
  const christmasChallengeProduct = products.find(({ useForChristmasSpecialChallenge }: { useForChristmasSpecialChallenge: boolean }) => useForChristmasSpecialChallenge)
  const pastebinLeakChallengeProduct = products.find(({ keywordsForPastebinDataLeakChallenge }: { keywordsForPastebinDataLeakChallenge: string[] }) => keywordsForPastebinDataLeakChallenge)
  const tamperingChallengeProduct = products.find(({ urlForProductTamperingChallenge }: { urlForProductTamperingChallenge: string }) => urlForProductTamperingChallenge)
  const blueprintRetrievalChallengeProduct = products.find(({ fileForRetrieveBlueprintChallenge }: { fileForRetrieveBlueprintChallenge: string }) => fileForRetrieveBlueprintChallenge)

  christmasChallengeProduct.description += ' (Seasonal special offer! Limited availability!)'
  christmasChallengeProduct.deletedAt = '2014-12-27 00:00:00.000 +00:00'
  tamperingChallengeProduct.description += ' <a href="' + tamperingChallengeProduct.urlForProductTamperingChallenge + '" target="_blank">More...</a>'
  tamperingChallengeProduct.deletedAt = null
  pastebinLeakChallengeProduct.description += ' (This product is unsafe! We plan to remove it from the stock!)'
  pastebinLeakChallengeProduct.deletedAt = '2019-02-1 00:00:00.000 +00:00'

  let blueprint = blueprintRetrievalChallengeProduct.fileForRetrieveBlueprintChallenge
  if (utils.isUrl(blueprint)) {
    const blueprintUrl = blueprint
    blueprint = utils.extractFilename(blueprint)
    await utils.downloadToFile(blueprintUrl, 'frontend/dist/frontend/assets/public/images/products/' + blueprint)
  }
  datacache.retrieveBlueprintChallengeFile = blueprint

  return await Promise.all(
    products.map(
      async ({ reviews = [], useForChristmasSpecialChallenge = false, urlForProductTamperingChallenge = false, fileForRetrieveBlueprintChallenge = false, ...product }) =>
        await ProductModel.create({
          name: product.name,
          description: product.description,
          price: product.price,
          deluxePrice: product.deluxePrice,
          image: product.image
        }).catch(
          (err: unknown) => {
            logger.error(`Could not insert Product ${product.name}: ${utils.getErrorMessage(err)}`)
          }
        ).then((persistedProduct) => {
          if (persistedProduct) {
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
          }
          if (!persistedProduct) {
            throw new Error('No persisted product found!')
          }
          return persistedProduct
        })
          .then(async ({ id }: { id: number }) =>
            await Promise.all(
              reviews.map(({ text, author }) =>
                mongodb.reviews.insert({
                  message: text,
                  author: datacache.users[author].email,
                  product: id,
                  likesCount: 0,
                  likedBy: []
                }).catch((err: unknown) => {
                  logger.error(`Could not insert Product Review ${text}: ${utils.getErrorMessage(err)}`)
                })
              )
            )
          )
    )
  )

  function customizeChangeProductChallenge (description: string, customUrl: string, customProduct: Product) {
    let customDescription = description.replace(/OWASP SSL Advanced Forensic Tool \(O-Saft\)/g, customProduct.name)
    customDescription = customDescription.replace('https://owasp.slack.com', customUrl)
    return customDescription
  }

  function customizeRetrieveBlueprintChallenge (hint: string, customProduct: Product) {
    return hint.replace(/OWASP Juice Shop Logo \(3D-printed\)/g, customProduct.name)
  }
}

async function createBaskets () {
  const baskets = [
    { UserId: 1 },
    { UserId: 2 },
    { UserId: 3 },
    { UserId: 11 },
    { UserId: 16 }
  ]

  return await Promise.all(
    baskets.map(async basket => {
      return await BasketModel.create({
        UserModelId: basket.UserId
      }).catch((err: unknown) => {
        logger.error(`Could not insert Basket for UserId ${basket.UserId}: ${utils.getErrorMessage(err)}`)
      })
    })
  )
}

async function createBasketItems () {
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

  return await Promise.all(
    basketItems.map(async basketItem => {
      return await BasketItemModel.create(basketItem).catch((err: unknown) => {
        logger.error(`Could not insert BasketItem for BasketId ${basketItem.BasketId}: ${utils.getErrorMessage(err)}`)
      })
    })
  )
}

async function createAnonymousFeedback () {
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

  return await Promise.all(
    feedbacks.map(async (feedback) => await createFeedback(null, feedback.comment, feedback.rating))
  )
}

async function createFeedback (UserId: number | null, comment: string, rating: number, author?: string) {
  const authoredComment = author ? `${comment} (***${author.slice(3)})` : `${comment} (anonymous)`
  return await FeedbackModel.create({ UserId, comment: authoredComment, rating }).catch((err: unknown) => {
    logger.error(`Could not insert Feedback ${authoredComment} mapped to UserId ${UserId}: ${utils.getErrorMessage(err)}`)
  })
}

async function createComplaints () {
  return await ComplaintModel.create({
    UserId: 3,
    message: 'I\'ll build my own eCommerce business! With Black Jack! And Hookers!'
  }).catch((err: unknown) => {
    logger.error(`Could not insert Complaint: ${utils.getErrorMessage(err)}`)
  })
}

async function createRecycleItem () {
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
  return await Promise.all(
    recycles.map(async (recycle) => await createRecycle(recycle))
  )
}

async function createRecycle (data: { UserId: number, quantity: number, AddressId: number, date: string, isPickup: boolean }) {
  return await RecycleModel.create({
    UserId: data.UserId,
    AddressId: data.AddressId,
    quantity: data.quantity,
    isPickup: data.isPickup,
    date: data.date
  }).catch((err: unknown) => {
    logger.error(`Could not insert Recycling Model: ${utils.getErrorMessage(err)}`)
  })
}

async function createSecurityQuestions () {
  const questions = await loadStaticData('securityQuestions')

  await Promise.all(
    questions.map(async ({ question }: SecurityQuestion) => {
      try {
        await SecurityQuestionModel.create({ question })
      } catch (err) {
        logger.error(`Could not insert SecurityQuestion ${question}: ${utils.getErrorMessage(err)}`)
      }
    })
  )
}

async function createSecurityAnswer (UserId: number, SecurityQuestionId: number, answer: string) {
  return await SecurityAnswerModel.create({ SecurityQuestionModelId: SecurityQuestionId, UserModelId: UserId, answer }).catch((err: unknown) => {
    logger.error(`Could not insert SecurityAnswer ${answer} mapped to UserId ${UserId}: ${utils.getErrorMessage(err)}`)
  })
}

async function createOrders () {
  const products = config.get('products')
  const basket1Products = [
    {
      quantity: 3,
      id: products[0].id,
      name: products[0].name,
      price: products[0].price,
      total: products[0].price * 3,
      bonus: Math.round(products[0].price / 10) * 3
    },
    {
      quantity: 1,
      id: products[1].id,
      name: products[1].name,
      price: products[1].price,
      total: products[1].price * 1,
      bonus: Math.round(products[1].price / 10) * 1
    }
  ]

  const basket2Products = [
    {
      quantity: 3,
      id: products[2].id,
      name: products[2].name,
      price: products[2].price,
      total: products[2].price * 3,
      bonus: Math.round(products[2].price / 10) * 3
    }
  ]

  const basket3Products = [
    {
      quantity: 3,
      id: products[0].id,
      name: products[0].name,
      price: products[0].price,
      total: products[0].price * 3,
      bonus: Math.round(products[0].price / 10) * 3
    },
    {
      quantity: 5,
      id: products[3].id,
      name: products[3].name,
      price: products[3].price,
      total: products[3].price * 5,
      bonus: Math.round(products[3].price / 10) * 5
    }
  ]

  const adminEmail = 'admin@' + config.get('application.domain')
  const orders = [
    {
      orderId: security.hash(adminEmail).slice(0, 4) + '-' + utils.randomHexString(16),
      email: (adminEmail.replace(/[aeiou]/gi, '*')),
      totalPrice: basket1Products[0].total + basket1Products[1].total,
      bonus: basket1Products[0].bonus + basket1Products[1].bonus,
      products: basket1Products,
      eta: Math.floor((Math.random() * 5) + 1).toString(),
      delivered: false
    },
    {
      orderId: security.hash(adminEmail).slice(0, 4) + '-' + utils.randomHexString(16),
      email: (adminEmail.replace(/[aeiou]/gi, '*')),
      totalPrice: basket2Products[0].total,
      bonus: basket2Products[0].bonus,
      products: basket2Products,
      eta: '0',
      delivered: true
    },
    {
      orderId: security.hash('demo').slice(0, 4) + '-' + utils.randomHexString(16),
      email: 'd*m*',
      totalPrice: basket3Products[0].total + basket3Products[1].total,
      bonus: basket3Products[0].bonus + basket3Products[1].bonus,
      products: basket3Products,
      eta: '0',
      delivered: true
    }
  ]

  return await Promise.all(
    orders.map(({ orderId, email, totalPrice, bonus, products, eta, delivered }) =>
      mongodb.orders.insert({
        orderId: orderId,
        email: email,
        totalPrice: totalPrice,
        bonus: bonus,
        products: products,
        eta: eta,
        delivered: delivered
      }).catch((err: unknown) => {
        logger.error(`Could not insert Order ${orderId}: ${utils.getErrorMessage(err)}`)
      })
    )
  )
}
