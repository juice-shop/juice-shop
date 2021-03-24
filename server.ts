/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */
import dataErasure from './routes/dataErasure'
const startTime = Date.now()
const path = require('path')
import fs = require('fs')
const morgan = require('morgan')
const colors = require('colors/safe')
const finale = require('finale-rest')
const express = require('express')
const compression = require('compression')
const helmet = require('helmet')
const featurePolicy = require('feature-policy')
const errorhandler = require('errorhandler')
const cookieParser = require('cookie-parser')
const serveIndex = require('serve-index')
const bodyParser = require('body-parser')
const cors = require('cors')
const securityTxt = require('express-security.txt')
const robots = require('express-robots-txt')
const yaml = require('js-yaml')
const swaggerUi = require('swagger-ui-express')
const RateLimit = require('express-rate-limit')
const client = require('prom-client')
const swaggerDocument = yaml.load(fs.readFileSync('./swagger.yml', 'utf8'))
const {
  ensureFileIsPassed,
  handleZipFileUpload,
  checkUploadSize,
  checkFileType,
  handleXmlUpload
} = require('./routes/fileUpload')
const profileImageFileUpload = require('./routes/profileImageFileUpload')
const profileImageUrlUpload = require('./routes/profileImageUrlUpload')
const redirect = require('./routes/redirect')
const vulnCodeSnippet = require('./routes/vulnCodeSnippet')
const angular = require('./routes/angular')
const easterEgg = require('./routes/easterEgg')
const premiumReward = require('./routes/premiumReward')
const privacyPolicyProof = require('./routes/privacyPolicyProof')
const appVersion = require('./routes/appVersion')
const repeatNotification = require('./routes/repeatNotification')
const continueCode = require('./routes/continueCode')
const restoreProgress = require('./routes/restoreProgress')
const fileServer = require('./routes/fileServer')
const quarantineServer = require('./routes/quarantineServer')
const keyServer = require('./routes/keyServer')
const logFileServer = require('./routes/logfileServer')
const metrics = require('./routes/metrics')
const authenticatedUsers = require('./routes/authenticatedUsers')
const currentUser = require('./routes/currentUser')
const login = require('./routes/login')
const changePassword = require('./routes/changePassword')
const resetPassword = require('./routes/resetPassword')
const securityQuestion = require('./routes/securityQuestion')
const search = require('./routes/search')
const coupon = require('./routes/coupon')
const basket = require('./routes/basket')
const order = require('./routes/order')
const verify = require('./routes/verify')
const recycles = require('./routes/recycles')
const b2bOrder = require('./routes/b2bOrder')
const showProductReviews = require('./routes/showProductReviews')
const createProductReviews = require('./routes/createProductReviews')
const updateProductReviews = require('./routes/updateProductReviews')
const likeProductReviews = require('./routes/likeProductReviews')
const logger = require('./lib/logger')
const utils = require('./lib/utils')
const security = require('./lib/insecurity')
const models = require('./models')
const datacreator = require('./data/datacreator')
const app = express()
const server = require('http').Server(app)
const appConfiguration = require('./routes/appConfiguration')
const captcha = require('./routes/captcha')
const trackOrder = require('./routes/trackOrder')
const countryMapping = require('./routes/countryMapping')
const basketItems = require('./routes/basketItems')
const saveLoginIp = require('./routes/saveLoginIp')
const userProfile = require('./routes/userProfile')
const updateUserProfile = require('./routes/updateUserProfile')
const videoHandler = require('./routes/videoHandler')
const twoFactorAuth = require('./routes/2fa')
const languageList = require('./routes/languages')
const config = require('config')
const imageCaptcha = require('./routes/imageCaptcha')
const dataExport = require('./routes/dataExport')
const address = require('./routes/address')
const payment = require('./routes/payment')
const wallet = require('./routes/wallet')
const orderHistory = require('./routes/orderHistory')
const delivery = require('./routes/delivery')
const deluxe = require('./routes/deluxe')
const memory = require('./routes/memory')
const chatbot = require('./routes/chatbot')
const locales = require('./data/static/locales.json')
const i18n = require('i18n')

const appName = config.get('application.customMetricsPrefix')
const startupGauge = new client.Gauge({
  name: `${appName}_startup_duration_seconds`,
  help: `Duration ${appName} required to perform a certain task during startup`,
  labelNames: ['task']
})

// Wraps the function and measures its (async) execution time
const collectDurationPromise = (name, func) => {
  return async (...args) => {
    const end = startupGauge.startTimer({ task: name })
    const res = await func(...args)
    end()
    return res
  }
}
void collectDurationPromise('validatePreconditions', require('./lib/startup/validatePreconditions'))()
void collectDurationPromise('cleanupFtpFolder', require('./lib/startup/cleanupFtpFolder'))()
void collectDurationPromise('validateConfig', require('./lib/startup/validateConfig'))()

// Reloads the i18n files in case of server restarts or starts.
async function restoreOverwrittenFilesWithOriginals () {
  await collectDurationPromise('restoreOverwrittenFilesWithOriginals', require('./lib/startup/restoreOverwrittenFilesWithOriginals'))()
}

/* Sets view engine to hbs */
app.set('view engine', 'hbs')

// Function called first to ensure that all the i18n files are reloaded successfully before other linked operations.
restoreOverwrittenFilesWithOriginals().then(() => {
  /* Locals */
  app.locals.captchaId = 0
  app.locals.captchaReqId = 1
  app.locals.captchaBypassReqTimes = []
  app.locals.abused_ssti_bug = false
  app.locals.abused_ssrf_bug = false

  /* Compression for all requests */
  app.use(compression())

  /* Bludgeon solution for possible CORS problems: Allow everything! */
  app.options('*', cors())
  app.use(cors())

  /* Security middleware */
  app.use(helmet.noSniff())
  app.use(helmet.frameguard())
  // app.use(helmet.xssFilter()); // = no protection from persisted XSS via RESTful API
  app.disable('x-powered-by')
  app.use(featurePolicy({
    features: {
      payment: ["'self'"]
    }
  }))

  /* Remove duplicate slashes from URL which allowed bypassing subsequent filters */
  app.use((req, res, next) => {
    req.url = req.url.replace(/[/]+/g, '/')
    next()
  })

  /* Increase request counter metric for every request */
  app.use(metrics.observeRequestMetricsMiddleware())

  /* Security Policy */
  const securityTxtExpiration = new Date()
  securityTxtExpiration.setFullYear(securityTxtExpiration.getFullYear() + 1)
  app.get(['/.well-known/security.txt', '/security.txt'], verify.accessControlChallenges())
  app.use(['/.well-known/security.txt', '/security.txt'], securityTxt({
    contact: config.get('application.securityTxt.contact'),
    encryption: config.get('application.securityTxt.encryption'),
    acknowledgements: config.get('application.securityTxt.acknowledgements'),
    'Preferred-Languages': [...new Set(locales.map(locale => locale.key.substr(0, 2)))].join(', '),
    expires: securityTxtExpiration.toUTCString()
  }))

  /* robots.txt */
  app.use(robots({ UserAgent: '*', Disallow: '/ftp' }))

  /* Checks for challenges solved by retrieving a file implicitly or explicitly */
  app.use('/assets/public/images/padding', verify.accessControlChallenges())
  app.use('/assets/public/images/products', verify.accessControlChallenges())
  app.use('/assets/public/images/uploads', verify.accessControlChallenges())
  app.use('/assets/i18n', verify.accessControlChallenges())

  /* Checks for challenges solved by abusing SSTi and SSRF bugs */
  app.use('/solve/challenges/server-side', verify.serverSideChallenges())

  /* Create middleware to change paths from the serve-index plugin from absolute to relative */
  const serveIndexMiddleware = (req, res, next) => {
    const origEnd = res.end
    res.end = function () {
      if (arguments.length) {
        const reqPath = req.originalUrl.replace(/\?.*$/, '')
        const currentFolder = reqPath.split('/').pop()
        arguments[0] = arguments[0].replace(/a href="([^"]+?)"/gi, function (matchString, matchedUrl) {
          let relativePath = path.relative(reqPath, matchedUrl)
          if (relativePath === '') {
            relativePath = currentFolder
          } else if (!relativePath.startsWith('.') && currentFolder !== '') {
            relativePath = currentFolder + '/' + relativePath
          } else {
            relativePath = relativePath.replace('..', '.')
          }
          return 'a href="' + relativePath + '"'
        })
      }
      origEnd.apply(this, arguments)
    }
    next()
  }

  // vuln-code-snippet start directoryListingChallenge accessLogDisclosureChallenge
  /* /ftp directory browsing and file download */
  app.use('/ftp', serveIndexMiddleware, serveIndex('ftp', { icons: true })) // vuln-code-snippet vuln-line directoryListingChallenge
  app.use('/ftp(?!/quarantine)/:file', fileServer())
  app.use('/ftp/quarantine/:file', quarantineServer())

  /* /encryptionkeys directory browsing */
  app.use('/encryptionkeys', serveIndexMiddleware, serveIndex('encryptionkeys', { icons: true, view: 'details' }))
  app.use('/encryptionkeys/:file', keyServer())

  /* /logs directory browsing */
  app.use('/support/logs', serveIndexMiddleware, serveIndex('logs', { icons: true, view: 'details' })) // vuln-code-snippet vuln-line accessLogDisclosureChallenge
  app.use('/support/logs', verify.accessControlChallenges()) // vuln-code-snippet hide-line
  app.use('/support/logs/:file', logFileServer()) // vuln-code-snippet vuln-line accessLogDisclosureChallenge

  /* Swagger documentation for B2B v2 endpoints */
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

  app.use(express.static(path.resolve('frontend/dist/frontend')))
  app.use(cookieParser('kekse'))
  // vuln-code-snippet end directoryListingChallenge accessLogDisclosureChallenge

  /* Configure and enable backend-side i18n */
  i18n.configure({
    locales: locales.map(locale => locale.key),
    directory: path.resolve('i18n'),
    cookie: 'language',
    defaultLocale: 'en',
    autoReload: true
  })
  app.use(i18n.init)

  app.use(bodyParser.urlencoded({ extended: true }))
  /* File Upload */
  app.post('/file-upload', uploadToMemory.single('file'), ensureFileIsPassed, metrics.observeFileUploadMetricsMiddleware(), handleZipFileUpload, checkUploadSize, checkFileType, handleXmlUpload)
  app.post('/profile/image/file', uploadToMemory.single('file'), ensureFileIsPassed, metrics.observeFileUploadMetricsMiddleware(), profileImageFileUpload())
  app.post('/profile/image/url', uploadToMemory.single('file'), profileImageUrlUpload())
  app.post('/rest/memories', uploadToDisk.single('image'), ensureFileIsPassed, security.appendUserId(), metrics.observeFileUploadMetricsMiddleware(), memory.addMemory())

  app.use(bodyParser.text({ type: '*/*' }))
  app.use(function jsonParser (req, res, next) {
    req.rawBody = req.body
    if (req.headers['content-type'] !== undefined && req.headers['content-type'].indexOf('application/json') > -1) {
      if (req.body && req.body !== Object(req.body)) { // Expensive workaround for 500 errors during Frisby test run (see #640)
        req.body = JSON.parse(req.body)
      }
    }
    next()
  })
  /* HTTP request logging */
  const accessLogStream = require('file-stream-rotator').getStream({
    filename: path.resolve('logs/access.log'),
    frequency: 'daily',
    verbose: false,
    max_logs: '2d'
  })
  app.use(morgan('combined', { stream: accessLogStream }))

  // vuln-code-snippet start resetPasswordMortyChallenge
  /* Rate limiting */
  app.enable('trust proxy')
  app.use('/rest/user/reset-password', new RateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100,
    keyGenerator ({ headers, ip }) { return headers['X-Forwarded-For'] || ip }, // vuln-code-snippet vuln-line resetPasswordMortyChallenge
    delayMs: 0
  }))
  // vuln-code-snippet end resetPasswordMortyChallenge

  // vuln-code-snippet start changeProductChallenge
  /** Authorization **/
  /* Checks on JWT in Authorization header */
  app.use(verify.jwtChallenges())
  /* Baskets: Unauthorized users are not allowed to access baskets */
  app.use('/rest/basket', security.isAuthorized(), security.appendUserId())
  /* BasketItems: API only accessible for authenticated users */
  app.use('/api/BasketItems', security.isAuthorized())
  app.use('/api/BasketItems/:id', security.isAuthorized())
  /* Feedbacks: GET allowed for feedback carousel, POST allowed in order to provide feedback without being logged in */
  app.use('/api/Feedbacks/:id', security.isAuthorized())
  /* Users: Only POST is allowed in order to register a new user */
  app.get('/api/Users', security.isAuthorized())
  app.route('/api/Users/:id')
    .get(security.isAuthorized())
    .put(security.denyAll())
    .delete(security.denyAll())
  /* Products: Only GET is allowed in order to view products */
  app.post('/api/Products', security.isAuthorized())
  // app.put('/api/Products/:id', security.isAuthorized()) // vuln-code-snippet vuln-line changeProductChallenge
  app.delete('/api/Products/:id', security.denyAll())
  /* Challenges: GET list of challenges allowed. Everything else forbidden entirely */
  app.post('/api/Challenges', security.denyAll())
  app.use('/api/Challenges/:id', security.denyAll())
  /* Complaints: POST and GET allowed when logged in only */
  app.get('/api/Complaints', security.isAuthorized())
  app.post('/api/Complaints', security.isAuthorized())
  app.use('/api/Complaints/:id', security.denyAll())
  /* Recycles: POST and GET allowed when logged in only */
  app.get('/api/Recycles', recycles.blockRecycleItems())
  app.post('/api/Recycles', security.isAuthorized())
  /* Challenge evaluation before finale takes over */
  app.get('/api/Recycles/:id', recycles.getRecycleItem())
  app.put('/api/Recycles/:id', security.denyAll())
  app.delete('/api/Recycles/:id', security.denyAll())
  /* SecurityQuestions: Only GET list of questions allowed. */
  app.post('/api/SecurityQuestions', security.denyAll())
  app.use('/api/SecurityQuestions/:id', security.denyAll())
  /* SecurityAnswers: Only POST of answer allowed. */
  app.get('/api/SecurityAnswers', security.denyAll())
  app.use('/api/SecurityAnswers/:id', security.denyAll())
  /* REST API */
  app.use('/rest/user/authentication-details', security.isAuthorized())
  app.use('/rest/basket/:id', security.isAuthorized())
  app.use('/rest/basket/:id/order', security.isAuthorized())
  /* Challenge evaluation before finale takes over */ // vuln-code-snippet hide-start
  app.post('/api/Feedbacks', verify.forgedFeedbackChallenge())
  /* Captcha verification before finale takes over */
  app.post('/api/Feedbacks', captcha.verifyCaptcha())
  /* Captcha Bypass challenge verification */
  app.post('/api/Feedbacks', verify.captchaBypassChallenge())
  /* User registration challenge verifications before finale takes over */
  app.post('/api/Users', verify.registerAdminChallenge())
  app.post('/api/Users', verify.passwordRepeatChallenge()) // vuln-code-snippet hide-end
  /* Unauthorized users are not allowed to access B2B API */
  app.use('/b2b/v2', security.isAuthorized())
  /* Check if the quantity is available in stock and limit per user not exceeded, then add item to basket */
  app.put('/api/BasketItems/:id', security.appendUserId(), basketItems.quantityCheckBeforeBasketItemUpdate())
  app.post('/api/BasketItems', security.appendUserId(), basketItems.quantityCheckBeforeBasketItemAddition(), basketItems.addBasketItem())
  /* Accounting users are allowed to check and update quantities */
  app.delete('/api/Quantitys/:id', security.denyAll())
  app.post('/api/Quantitys', security.denyAll())
  app.use('/api/Quantitys/:id', security.isAccounting())
  /* Feedbacks: Do not allow changes of existing feedback */
  app.put('/api/Feedbacks/:id', security.denyAll())
  /* PrivacyRequests: Only allowed for authenticated users */
  app.use('/api/PrivacyRequests', security.isAuthorized())
  app.use('/api/PrivacyRequests/:id', security.isAuthorized())
  /* PaymentMethodRequests: Only allowed for authenticated users */
  app.post('/api/Cards', security.appendUserId())
  app.get('/api/Cards', security.appendUserId(), payment.getPaymentMethods())
  app.put('/api/Cards/:id', security.denyAll())
  app.delete('/api/Cards/:id', security.appendUserId(), payment.delPaymentMethodById())
  app.get('/api/Cards/:id', security.appendUserId(), payment.getPaymentMethodById())
  /* PrivacyRequests: Only POST allowed for authenticated users */
  app.post('/api/PrivacyRequests', security.isAuthorized())
  app.get('/api/PrivacyRequests', security.denyAll())
  app.use('/api/PrivacyRequests/:id', security.denyAll())

  app.post('/api/Addresss', security.appendUserId())
  app.get('/api/Addresss', security.appendUserId(), address.getAddress())
  app.put('/api/Addresss/:id', security.appendUserId())
  app.delete('/api/Addresss/:id', security.appendUserId(), address.delAddressById())
  app.get('/api/Addresss/:id', security.appendUserId(), address.getAddressById())
  app.get('/api/Deliverys', delivery.getDeliveryMethods())
  app.get('/api/Deliverys/:id', delivery.getDeliveryMethod())
  // vuln-code-snippet end changeProductChallenge

  /* Verify the 2FA Token */
  app.post('/rest/2fa/verify',
    new RateLimit({ windowMs: 5 * 60 * 1000, max: 100 }),
    twoFactorAuth.verify()
  )
  /* Check 2FA Status for the current User */
  app.get('/rest/2fa/status', security.isAuthorized(), twoFactorAuth.status())
  /* Enable 2FA for the current User */
  app.post('/rest/2fa/setup',
    new RateLimit({ windowMs: 5 * 60 * 1000, max: 100 }),
    security.isAuthorized(),
    twoFactorAuth.setup()
  )
  /* Disable 2FA Status for the current User */
  app.post('/rest/2fa/disable',
    new RateLimit({ windowMs: 5 * 60 * 1000, max: 100 }),
    security.isAuthorized(),
    twoFactorAuth.disable()
  )
  /* Verifying DB related challenges can be postponed until the next request for challenges is coming via finale */
  app.use(verify.databaseRelatedChallenges())

  // vuln-code-snippet start registerAdminChallenge
  /* Generated API endpoints */
  finale.initialize({ app, sequelize: models.sequelize })

  const autoModels = [
    { name: 'User', exclude: ['password', 'totpSecret'] },
    { name: 'Product', exclude: [] },
    { name: 'Feedback', exclude: [] },
    { name: 'BasketItem', exclude: [] },
    { name: 'Challenge', exclude: [] },
    { name: 'Complaint', exclude: [] },
    { name: 'Recycle', exclude: [] },
    { name: 'SecurityQuestion', exclude: [] },
    { name: 'SecurityAnswer', exclude: [] },
    { name: 'Address', exclude: [] },
    { name: 'PrivacyRequest', exclude: [] },
    { name: 'Card', exclude: [] },
    { name: 'Quantity', exclude: [] }
  ]

  for (const { name, exclude } of autoModels) {
    const resource = finale.resource({
      model: models[name],
      endpoints: [`/api/${name}s`, `/api/${name}s/:id`],
      excludeAttributes: exclude
    })

    // create a wallet when a new user is registered using API
    if (name === 'User') {
      resource.create.send.before((req, res, context) => { // vuln-code-snippet vuln-line registerAdminChallenge
        models.Wallet.create({ UserId: context.instance.id }).catch((err) => {
          console.log(err)
        })
        return context.continue
      })
    }
    // vuln-code-snippet end registerAdminChallenge

    // translate challenge descriptions and hints on-the-fly
    if (name === 'Challenge') {
      resource.list.fetch.after((req, res, context) => {
        for (let i = 0; i < context.instance.length; i++) {
          let description = context.instance[i].description
          if (utils.contains(description, '<em>(This challenge is <strong>')) {
            const warning = description.substring(description.indexOf(' <em>(This challenge is <strong>'))
            description = description.substring(0, description.indexOf(' <em>(This challenge is <strong>'))
            context.instance[i].description = req.__(description) + req.__(warning)
          } else {
            context.instance[i].description = req.__(description)
          }
          if (context.instance[i].hint) {
            context.instance[i].hint = req.__(context.instance[i].hint)
          }
        }
        return context.continue
      })
      resource.read.send.before((req, res, context) => {
        context.instance.description = req.__(context.instance.description)
        if (context.instance.hint) {
          context.instance.hint = req.__(context.instance.hint)
        }
        return context.continue
      })
    }

    // translate security questions on-the-fly
    if (name === 'SecurityQuestion') {
      resource.list.fetch.after((req, res, context) => {
        for (let i = 0; i < context.instance.length; i++) {
          context.instance[i].question = req.__(context.instance[i].question)
        }
        return context.continue
      })
      resource.read.send.before((req, res, context) => {
        context.instance.question = req.__(context.instance.question)
        return context.continue
      })
    }

    // translate product names and descriptions on-the-fly
    if (name === 'Product') {
      resource.list.fetch.after((req, res, context) => {
        for (let i = 0; i < context.instance.length; i++) {
          context.instance[i].name = req.__(context.instance[i].name)
          context.instance[i].description = req.__(context.instance[i].description)
        }
        return context.continue
      })
      resource.read.send.before((req, res, context) => {
        context.instance.name = req.__(context.instance.name)
        context.instance.description = req.__(context.instance.description)
        return context.continue
      })
    }

    // fix the api difference between finale (fka epilogue) and previously used sequlize-restful
    resource.all.send.before((req, res, context) => {
      context.instance = {
        status: 'success',
        data: context.instance
      }
      return context.continue
    })
  }

  /* Custom Restful API */
  app.post('/rest/user/login', login())
  app.get('/rest/user/change-password', changePassword())
  app.post('/rest/user/reset-password', resetPassword())
  app.get('/rest/user/security-question', securityQuestion())
  app.get('/rest/user/whoami', security.updateAuthenticatedUsers(), currentUser())
  app.get('/rest/user/authentication-details', authenticatedUsers())
  app.get('/rest/products/search', search())
  app.get('/rest/basket/:id', basket())
  app.post('/rest/basket/:id/checkout', order())
  app.put('/rest/basket/:id/coupon/:coupon', coupon())
  app.get('/rest/admin/application-version', appVersion())
  app.get('/rest/admin/application-configuration', appConfiguration())
  app.get('/rest/repeat-notification', repeatNotification())
  app.get('/rest/continue-code', continueCode())
  app.put('/rest/continue-code/apply/:continueCode', restoreProgress())
  app.get('/rest/admin/application-version', appVersion())
  app.get('/rest/captcha', captcha())
  app.get('/rest/image-captcha', imageCaptcha())
  app.get('/rest/track-order/:id', trackOrder())
  app.get('/rest/country-mapping', countryMapping())
  app.get('/rest/saveLoginIp', saveLoginIp())
  app.post('/rest/user/data-export', security.appendUserId(), imageCaptcha.verifyCaptcha())
  app.post('/rest/user/data-export', security.appendUserId(), dataExport())
  app.get('/rest/languages', languageList())
  app.get('/rest/order-history', orderHistory.orderHistory())
  app.get('/rest/order-history/orders', security.isAccounting(), orderHistory.allOrders())
  app.put('/rest/order-history/:id/delivery-status', security.isAccounting(), orderHistory.toggleDeliveryStatus())
  app.get('/rest/wallet/balance', security.appendUserId(), wallet.getWalletBalance())
  app.put('/rest/wallet/balance', security.appendUserId(), wallet.addWalletBalance())
  app.get('/rest/deluxe-membership', deluxe.deluxeMembershipStatus())
  app.post('/rest/deluxe-membership', security.appendUserId(), deluxe.upgradeToDeluxe())
  app.get('/rest/memories', memory.getMemories())
  app.get('/rest/chatbot/status', chatbot.status())
  app.post('/rest/chatbot/respond', chatbot.process())
  /* NoSQL API endpoints */
  app.get('/rest/products/:id/reviews', showProductReviews())
  app.put('/rest/products/:id/reviews', createProductReviews())
  app.patch('/rest/products/reviews', security.isAuthorized(), updateProductReviews())
  app.post('/rest/products/reviews', security.isAuthorized(), likeProductReviews())

  /* B2B Order API */
  app.post('/b2b/v2/orders', b2bOrder())

  /* File Serving */
  app.get('/the/devs/are/so/funny/they/hid/an/easter/egg/within/the/easter/egg', easterEgg())
  app.get('/this/page/is/hidden/behind/an/incredibly/high/paywall/that/could/only/be/unlocked/by/sending/1btc/to/us', premiumReward())
  app.get('/we/may/also/instruct/you/to/refuse/all/reasonably/necessary/responsibility', privacyPolicyProof())

  /* Route for dataerasure page */
  app.use('/dataerasure', dataErasure)

  /* Route for redirects */
  app.get('/redirect', redirect())

  /* Routes for promotion video page */
  app.get('/promotion', videoHandler.promotionVideo())
  app.get('/video', videoHandler.getVideo())

  /* Routes for profile page */
  app.get('/profile', security.updateAuthenticatedUsers(), userProfile())
  app.post('/profile', updateUserProfile())

  /* Route for vulnerable code snippets */
  app.get('/snippets', vulnCodeSnippet.challengesWithCodeSnippet())
  app.get('/snippets/:challenge', vulnCodeSnippet.serveCodeSnippet())

  app.use(angular())

  /* Error Handling */
  app.use(verify.errorHandlingChallenge())
  app.use(errorhandler())
}).catch((err) => {
  console.error(err)
})

const multer = require('multer')
const uploadToMemory = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200000 } })
const mimeTypeMap = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
}
const uploadToDisk = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const isValid = mimeTypeMap[file.mimetype]
      let error = new Error('Invalid mime type')
      if (isValid) {
        error = null
      }
      cb(error, path.resolve('frontend/dist/frontend/assets/public/images/uploads/'))
    },
    filename: (req, file, cb) => {
      const name = security.sanitizeFilename(file.originalname)
        .toLowerCase()
        .split(' ')
        .join('-')
      const ext = mimeTypeMap[file.mimetype]
      cb(null, name + '-' + Date.now() + '.' + ext)
    }
  })
})

// vuln-code-snippet start exposedMetricsChallenge
/* Serve metrics */
const Metrics = metrics.observeMetrics()
const metricsUpdateLoop = Metrics.updateLoop
app.get('/metrics', metrics.serveMetrics()) // vuln-code-snippet vuln-line exposedMetricsChallenge
// vuln-code-snippet end exposedMetricsChallenge
errorhandler.title = `${config.get('application.name')} (Express ${utils.version('express')})`

const registerWebsocketEvents = require('./lib/startup/registerWebsocketEvents')
const customizeApplication = require('./lib/startup/customizeApplication')
const customizeEasterEgg = require('./lib/startup/customizeEasterEgg')

export async function start (readyCallback) {
  const datacreatorEnd = startupGauge.startTimer({ task: 'datacreator' })
  await models.sequelize.sync({ force: true })
  await datacreator()
  datacreatorEnd()
  const port = process.env.PORT || config.get('server.port')
  process.env.BASE_PATH = process.env.BASE_PATH || config.get('server.basePath')

  server.listen(port, () => {
    logger.info(colors.cyan(`Server listening on port ${colors.bold(port)}`))
    startupGauge.set({ task: 'ready' }, (Date.now() - startTime) / 1000)
    if (process.env.BASE_PATH !== '') {
      logger.info(colors.cyan(`Server using proxy base path ${colors.bold(process.env.BASE_PATH)} for redirects`))
    }
    registerWebsocketEvents(server)
    if (readyCallback) {
      readyCallback()
    }
  })

  void collectDurationPromise('customizeApplication', customizeApplication)()
  void collectDurationPromise('customizeEasterEgg', customizeEasterEgg)()
}

export function close (exitCode) {
  if (server) {
    clearInterval(metricsUpdateLoop)
    server.close()
  }
  if (exitCode !== undefined) {
    process.exit(exitCode)
  }
}
