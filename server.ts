/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
import i18n from 'i18n'
import cors from 'cors'
import fs from 'node:fs'
import yaml from 'js-yaml'
import config from 'config'
import morgan from 'morgan'
import multer from 'multer'
import helmet from 'helmet'
import http from 'node:http'
import path from 'node:path'
import express from 'express'
import colors from 'colors/safe'
import serveIndex from 'serve-index'
import bodyParser from 'body-parser'
// @ts-expect-error FIXME due to non-existing type definitions for finale-rest
import * as finale from 'finale-rest'
import compression from 'compression'
// @ts-expect-error FIXME due to non-existing type definitions for express-robots-txt
import robots from 'express-robots-txt'
import cookieParser from 'cookie-parser'
import * as Prometheus from 'prom-client'
import swaggerUi from 'swagger-ui-express'
import featurePolicy from 'feature-policy'
import { IpFilter } from 'express-ipfilter'
// @ts-expect-error FIXME due to non-existing type definitions for express-security.txt
import securityTxt from 'express-security.txt'
import { rateLimit } from 'express-rate-limit'
import { getStream } from 'file-stream-rotator'
import type { Request, Response, NextFunction } from 'express'

import { sequelize } from './models'
import { UserModel } from './models/user'
import { CardModel } from './models/card'
import { WalletModel } from './models/wallet'
import { ProductModel } from './models/product'
import { RecycleModel } from './models/recycle'
import { AddressModel } from './models/address'
import { QuantityModel } from './models/quantity'
import { FeedbackModel } from './models/feedback'
import { ComplaintModel } from './models/complaint'
import { ChallengeModel } from './models/challenge'
import { BasketItemModel } from './models/basketitem'
import { SecurityAnswerModel } from './models/securityAnswer'
import { PrivacyRequestModel } from './models/privacyRequests'
import { SecurityQuestionModel } from './models/securityQuestion'
import { HintModel } from './models/hint'

import logger from './lib/logger'
import * as utils from './lib/utils'
import * as antiCheat from './lib/antiCheat'
import * as security from './lib/insecurity'
import validateConfig from './lib/startup/validateConfig'
import cleanupFtpFolder from './lib/startup/cleanupFtpFolder'
import customizeEasterEgg from './lib/startup/customizeEasterEgg' // vuln-code-snippet hide-line
import customizeApplication from './lib/startup/customizeApplication'
import validatePreconditions from './lib/startup/validatePreconditions'
import registerWebsocketEvents from './lib/startup/registerWebsocketEvents'
import restoreOverwrittenFilesWithOriginals from './lib/startup/restoreOverwrittenFilesWithOriginals'

import datacreator from './data/datacreator'
import locales from './data/static/locales.json'

import { login } from './routes/login'
import * as verify from './routes/verify'
import * as address from './routes/address'
import * as chatbot from './routes/chatbot'
import * as metrics from './routes/metrics'
import * as payment from './routes/payment'
import { placeOrder } from './routes/order'
import { b2bOrder } from './routes/b2bOrder'
import * as delivery from './routes/delivery'
import * as recycles from './routes/recycles'
import * as twoFactorAuth from './routes/2fa'
import { applyCoupon } from './routes/coupon'
import dataErasure from './routes/dataErasure'
import { dataExport } from './routes/dataExport'
import { retrieveBasket } from './routes/basket'
import { searchProducts } from './routes/search'
import { trackOrder } from './routes/trackOrder'
import { saveLoginIp } from './routes/saveLoginIp'
import { serveKeyFiles } from './routes/keyServer'
import * as basketItems from './routes/basketItems'
import { performRedirect } from './routes/redirect'
import { serveEasterEgg } from './routes/easterEgg'
import { getLanguageList } from './routes/languages'
import { getUserProfile } from './routes/userProfile'
import { serveAngularClient } from './routes/angular'
import { resetPassword } from './routes/resetPassword'
import { serveLogFiles } from './routes/logfileServer'
import { servePublicFiles } from './routes/fileServer'
import { addMemory, getMemories } from './routes/memory'
import { changePassword } from './routes/changePassword'
import { countryMapping } from './routes/countryMapping'
import { retrieveAppVersion } from './routes/appVersion'
import { captchas, verifyCaptcha } from './routes/captcha'
import * as restoreProgress from './routes/restoreProgress'
import { checkKeys, nftUnlocked } from './routes/checkKeys'
import { retrieveLoggedInUser } from './routes/currentUser'
import authenticatedUsers from './routes/authenticatedUsers'
import { securityQuestion } from './routes/securityQuestion'
import { servePremiumContent } from './routes/premiumReward'
import { contractExploitListener } from './routes/web3Wallet'
import { updateUserProfile } from './routes/updateUserProfile'
import { getVideo, promotionVideo } from './routes/videoHandler'
import { likeProductReviews } from './routes/likeProductReviews'
import { repeatNotification } from './routes/repeatNotification'
import { serveQuarantineFiles } from './routes/quarantineServer'
import { showProductReviews } from './routes/showProductReviews'
import { nftMintListener, walletNFTVerify } from './routes/nftMint'
import { createProductReviews } from './routes/createProductReviews'
import { getWalletBalance, addWalletBalance } from './routes/wallet'
import { retrieveAppConfiguration } from './routes/appConfiguration'
import { updateProductReviews } from './routes/updateProductReviews'
import { servePrivacyPolicyProof } from './routes/privacyPolicyProof'
import { profileImageUrlUpload } from './routes/profileImageUrlUpload'
import { profileImageFileUpload } from './routes/profileImageFileUpload'
import { serveCodeFixes, checkCorrectFix } from './routes/vulnCodeFixes'
import { imageCaptchas, verifyImageCaptcha } from './routes/imageCaptcha'
import { upgradeToDeluxe, deluxeMembershipStatus } from './routes/deluxe'
import { serveCodeSnippet, checkVulnLines } from './routes/vulnCodeSnippet'
import { orderHistory, allOrders, toggleDeliveryStatus } from './routes/orderHistory'
import { continueCode, continueCodeFindIt, continueCodeFixIt } from './routes/continueCode'
import { ensureFileIsPassed, handleZipFileUpload, checkUploadSize, checkFileType, handleXmlUpload, handleYamlUpload } from './routes/fileUpload'

const app = express()
const server = new http.Server(app)

// errorhandler requires us from overwriting a string property on it's module which is a big no-no with esmodules :/
const errorhandler = require('errorhandler')

const startTime = Date.now()

const swaggerDocument = yaml.load(fs.readFileSync('./swagger.yml', 'utf8'))

const appName = config.get<string>('application.customMetricsPrefix')
const startupGauge = new Prometheus.Gauge({
  name: `${appName}_startup_duration_seconds`,
  help: `Duration ${appName} required to perform a certain task during startup`,
  labelNames: ['task']
})

// Wraps the function and measures its (async) execution time
const collectDurationPromise = (name: string, func: (...args: any) => Promise<any>) => {
  return async (...args: any) => {
    const end = startupGauge.startTimer({ task: name })
    try {
      const res = await func(...args)
      end()
      return res
    } catch (err) {
      console.error('Error in timed startup function: ' + name, err)
      throw err
    }
  }
}

/* Sets view engine to hbs */
app.set('view engine', 'hbs')

void collectDurationPromise('validatePreconditions', validatePreconditions)()
void collectDurationPromise('cleanupFtpFolder', cleanupFtpFolder)()
void collectDurationPromise('validateConfig', validateConfig)({})

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

  /* Hiring header */
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.append('X-Recruiting', config.get('application.securityTxt.hiring'))
    next()
  })

  /* Remove duplicate slashes from URL which allowed bypassing subsequent filters */
  app.use((req: Request, res: Response, next: NextFunction) => {
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
    'Preferred-Languages': [...new Set(locales.map((locale: { key: string }) => locale.key.substr(0, 2)))].join(', '),
    hiring: config.get('application.securityTxt.hiring'),
    csaf: config.get<string>('server.baseUrl') + config.get<string>('application.securityTxt.csaf'),
    expires: securityTxtExpiration.toUTCString()
  }))

  /* robots.txt */
  app.use(robots({ UserAgent: '*', Disallow: '/ftp' }))

  /* Check for any URLs having been called that would be expected for challenge solving without cheating */
  app.use(antiCheat.checkForPreSolveInteractions())

  /* Checks for challenges solved by retrieving a file implicitly or explicitly */
  app.use('/assets/public/images/padding', verify.accessControlChallenges())
  app.use('/assets/public/images/products', verify.accessControlChallenges())
  app.use('/assets/public/images/uploads', verify.accessControlChallenges())
  app.use('/assets/i18n', verify.accessControlChallenges())

  /* Checks for challenges solved by abusing SSTi and SSRF bugs */
  app.use('/solve/challenges/server-side', verify.serverSideChallenges())

  /* Create middleware to change paths from the serve-index plugin from absolute to relative */
  const serveIndexMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const origEnd = res.end
    // @ts-expect-error FIXME assignment broken due to seemingly void return value
    res.end = function () {
      if (arguments.length) {
        const reqPath = req.originalUrl.replace(/\?.*$/, '')
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const currentFolder = reqPath.split('/').pop()!
        arguments[0] = arguments[0].replace(/a href="([^"]+?)"/gi, function (matchString: string, matchedUrl: string) {
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
      // @ts-expect-error FIXME passed argument has wrong type
      origEnd.apply(this, arguments)
    }
    next()
  }

  // vuln-code-snippet start directoryListingChallenge accessLogDisclosureChallenge
  /* /ftp directory browsing and file download */ // vuln-code-snippet neutral-line directoryListingChallenge
  app.use('/ftp', serveIndexMiddleware, serveIndex('ftp', { icons: true })) // vuln-code-snippet vuln-line directoryListingChallenge
  app.use('/ftp(?!/quarantine)/:file', servePublicFiles()) // vuln-code-snippet vuln-line directoryListingChallenge
  app.use('/ftp/quarantine/:file', serveQuarantineFiles()) // vuln-code-snippet neutral-line directoryListingChallenge

  app.use('/.well-known', serveIndexMiddleware, serveIndex('.well-known', { icons: true, view: 'details' }))
  app.use('/.well-known', express.static('.well-known'))

  /* /encryptionkeys directory browsing */
  app.use('/encryptionkeys', serveIndexMiddleware, serveIndex('encryptionkeys', { icons: true, view: 'details' }))
  app.use('/encryptionkeys/:file', serveKeyFiles())

  /* /logs directory browsing */ // vuln-code-snippet neutral-line accessLogDisclosureChallenge
  app.use('/support/logs', serveIndexMiddleware, serveIndex('logs', { icons: true, view: 'details' })) // vuln-code-snippet vuln-line accessLogDisclosureChallenge
  app.use('/support/logs', verify.accessControlChallenges()) // vuln-code-snippet hide-line
  app.use('/support/logs/:file', serveLogFiles()) // vuln-code-snippet vuln-line accessLogDisclosureChallenge

  /* Swagger documentation for B2B v2 endpoints */
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

  app.use(express.static(path.resolve('frontend/dist/frontend')))
  app.use(cookieParser('kekse'))
  // vuln-code-snippet end directoryListingChallenge accessLogDisclosureChallenge

  /* Configure and enable backend-side i18n */
  i18n.configure({
    locales: locales.map((locale: { key: string }) => locale.key),
    directory: path.resolve('i18n'),
    cookie: 'language',
    defaultLocale: 'en',
    autoReload: true
  })
  app.use(i18n.init)

  app.use(bodyParser.urlencoded({ extended: true }))
  /* File Upload */
  app.post('/file-upload', uploadToMemory.single('file'), ensureFileIsPassed, metrics.observeFileUploadMetricsMiddleware(), checkUploadSize, checkFileType, handleZipFileUpload, handleXmlUpload, handleYamlUpload)
  app.post('/profile/image/file', uploadToMemory.single('file'), ensureFileIsPassed, metrics.observeFileUploadMetricsMiddleware(), profileImageFileUpload())
  app.post('/profile/image/url', uploadToMemory.single('file'), profileImageUrlUpload())
  app.post('/rest/memories', uploadToDisk.single('image'), ensureFileIsPassed, security.appendUserId(), metrics.observeFileUploadMetricsMiddleware(), addMemory())

  app.use(bodyParser.text({ type: '*/*' }))
  app.use(function jsonParser (req: Request, res: Response, next: NextFunction) {
    // @ts-expect-error FIXME intentionally saving original request in this property
    req.rawBody = req.body
    if (req.headers['content-type']?.includes('application/json')) {
      if (!req.body) {
        req.body = {}
      }
      if (req.body !== Object(req.body)) { // Expensive workaround for 500 errors during Frisby test run (see #640)
        req.body = JSON.parse(req.body)
      }
    }
    next()
  })

  /* HTTP request logging */
  const accessLogStream = getStream({
    filename: path.resolve('logs/access.log.%DATE%'),
    date_format: 'YYYY-MM-DD',
    audit_file: 'logs/audit.json',
    frequency: 'daily',
    verbose: false,
    max_logs: '2d'
  })
  app.use(morgan('combined', { stream: accessLogStream }))

  // vuln-code-snippet start resetPasswordMortyChallenge
  /* Rate limiting */
  app.enable('trust proxy')
  app.use('/rest/user/reset-password', rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100,
    keyGenerator ({ headers, ip }: { headers: any, ip: any }) { return headers['X-Forwarded-For'] ?? ip } // vuln-code-snippet vuln-line resetPasswordMortyChallenge
  }))
  // vuln-code-snippet end resetPasswordMortyChallenge

  // vuln-code-snippet start changeProductChallenge
  /** Authorization **/
  /* Checks on JWT in Authorization header */ // vuln-code-snippet hide-line
  app.use(verify.jwtChallenges()) // vuln-code-snippet hide-line
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
  /* Products: Only GET is allowed in order to view products */ // vuln-code-snippet neutral-line changeProductChallenge
  app.post('/api/Products', security.isAuthorized()) // vuln-code-snippet neutral-line changeProductChallenge
  // app.put('/api/Products/:id', security.isAuthorized()) // vuln-code-snippet vuln-line changeProductChallenge
  app.delete('/api/Products/:id', security.denyAll())
  /* Challenges: GET list of challenges allowed. Everything else forbidden entirely */
  app.post('/api/Challenges', security.denyAll())
  app.use('/api/Challenges/:id', security.denyAll())
  /* Hints: GET and PUT hints allowed. Everything else forbidden */
  app.post('/api/Hints', security.denyAll())
  app.route('/api/Hints/:id')
    .get(security.denyAll())
    .delete(security.denyAll())
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
  app.post('/api/Feedbacks', verifyCaptcha())
  /* Captcha Bypass challenge verification */
  app.post('/api/Feedbacks', verify.captchaBypassChallenge())
  /* User registration challenge verifications before finale takes over */
  app.post('/api/Users', (req: Request, res: Response, next: NextFunction) => {
    if (req.body.email !== undefined && req.body.password !== undefined && req.body.passwordRepeat !== undefined) {
      if (req.body.email.length !== 0 && req.body.password.length !== 0) {
        req.body.email = req.body.email.trim()
        req.body.password = req.body.password.trim()
        req.body.passwordRepeat = req.body.passwordRepeat.trim()
      } else {
        res.status(400).send(res.__('Invalid email/password cannot be empty'))
      }
    }
    next()
  })
  app.post('/api/Users', verify.registerAdminChallenge())
  app.post('/api/Users', verify.passwordRepeatChallenge()) // vuln-code-snippet hide-end
  app.post('/api/Users', verify.emptyUserRegistration())
  /* Unauthorized users are not allowed to access B2B API */
  app.use('/b2b/v2', security.isAuthorized())
  /* Check if the quantity is available in stock and limit per user not exceeded, then add item to basket */
  app.put('/api/BasketItems/:id', security.appendUserId(), basketItems.quantityCheckBeforeBasketItemUpdate())
  app.post('/api/BasketItems', security.appendUserId(), basketItems.quantityCheckBeforeBasketItemAddition(), basketItems.addBasketItem())
  /* Accounting users are allowed to check and update quantities */
  app.delete('/api/Quantitys/:id', security.denyAll())
  app.post('/api/Quantitys', security.denyAll())
  app.use('/api/Quantitys/:id', security.isAccounting(), IpFilter(['123.456.789'], { mode: 'allow' }))
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
    rateLimit({ windowMs: 5 * 60 * 1000, max: 100, validate: false }),
    twoFactorAuth.verify
  )
  /* Check 2FA Status for the current User */
  app.get('/rest/2fa/status', security.isAuthorized(), twoFactorAuth.status)
  /* Enable 2FA for the current User */
  app.post('/rest/2fa/setup',
    rateLimit({ windowMs: 5 * 60 * 1000, max: 100, validate: false }),
    security.isAuthorized(),
    twoFactorAuth.setup
  )
  /* Disable 2FA Status for the current User */
  app.post('/rest/2fa/disable',
    rateLimit({ windowMs: 5 * 60 * 1000, max: 100, validate: false }),
    security.isAuthorized(),
    twoFactorAuth.disable
  )
  /* Verifying DB related challenges can be postponed until the next request for challenges is coming via finale */
  app.use(verify.databaseRelatedChallenges())

  // vuln-code-snippet start registerAdminChallenge
  /* Generated API endpoints */
  finale.initialize({ app, sequelize })

  const autoModels = [
    { name: 'User', exclude: ['password', 'totpSecret'], model: UserModel },
    { name: 'Product', exclude: [], model: ProductModel },
    { name: 'Feedback', exclude: [], model: FeedbackModel },
    { name: 'BasketItem', exclude: [], model: BasketItemModel },
    { name: 'Challenge', exclude: [], model: ChallengeModel },
    { name: 'Complaint', exclude: [], model: ComplaintModel },
    { name: 'Recycle', exclude: [], model: RecycleModel },
    { name: 'SecurityQuestion', exclude: [], model: SecurityQuestionModel },
    { name: 'SecurityAnswer', exclude: [], model: SecurityAnswerModel },
    { name: 'Address', exclude: [], model: AddressModel },
    { name: 'PrivacyRequest', exclude: [], model: PrivacyRequestModel },
    { name: 'Card', exclude: [], model: CardModel },
    { name: 'Quantity', exclude: [], model: QuantityModel },
    { name: 'Hint', exclude: [], model: HintModel }
  ]

  for (const { name, exclude, model } of autoModels) {
    const resource = finale.resource({
      model,
      endpoints: [`/api/${name}s`, `/api/${name}s/:id`],
      excludeAttributes: exclude,
      pagination: false
    })

    // create a wallet when a new user is registered using API
    if (name === 'User') { // vuln-code-snippet neutral-line registerAdminChallenge
      resource.create.send.before((req: Request, res: Response, context: { instance: { id: any }, continue: any }) => { // vuln-code-snippet vuln-line registerAdminChallenge
        WalletModel.create({ UserId: context.instance.id }).catch((err: unknown) => {
          console.log(err)
        })
        return context.continue // vuln-code-snippet neutral-line registerAdminChallenge
      }) // vuln-code-snippet neutral-line registerAdminChallenge
    } // vuln-code-snippet neutral-line registerAdminChallenge
    // vuln-code-snippet end registerAdminChallenge

    // translate challenge descriptions on-the-fly
    if (name === 'Challenge') {
      resource.list.fetch.after((req: Request, res: Response, context: { instance: string | any[], continue: any }) => {
        for (let i = 0; i < context.instance.length; i++) {
          let description = context.instance[i].description
          if (utils.contains(description, '<em>(This challenge is <strong>')) {
            const warning = description.substring(description.indexOf(' <em>(This challenge is <strong>'))
            description = description.substring(0, description.indexOf(' <em>(This challenge is <strong>'))
            context.instance[i].description = req.__(description) + req.__(warning)
          } else {
            context.instance[i].description = req.__(description)
          }
        }
        return context.continue
      })
      resource.read.send.before((req: Request, res: Response, context: { instance: { description: string, hint: string }, continue: any }) => {
        context.instance.description = req.__(context.instance.description)
        return context.continue
      })
    }

    // translate security questions on-the-fly
    if (name === 'SecurityQuestion') {
      resource.list.fetch.after((req: Request, res: Response, context: { instance: string | any[], continue: any }) => {
        for (let i = 0; i < context.instance.length; i++) {
          context.instance[i].question = req.__(context.instance[i].question)
        }
        return context.continue
      })
      resource.read.send.before((req: Request, res: Response, context: { instance: { question: string }, continue: any }) => {
        context.instance.question = req.__(context.instance.question)
        return context.continue
      })
    }

    // translate hints on-the-fly
    if (name === 'Hint') {
      resource.list.fetch.after((req: Request, res: Response, context: { instance: string | any[], continue: any }) => {
        for (let i = 0; i < context.instance.length; i++) {
          context.instance[i].text = req.__(context.instance[i].text)
        }
        return context.continue
      })
      resource.read.send.before((req: Request, res: Response, context: { instance: { text: string }, continue: any }) => {
        context.instance.text = req.__(context.instance.text)
        return context.continue
      })
    }

    // translate product names and descriptions on-the-fly
    if (name === 'Product') {
      resource.list.fetch.after((req: Request, res: Response, context: { instance: any[], continue: any }) => {
        for (let i = 0; i < context.instance.length; i++) {
          context.instance[i].name = req.__(context.instance[i].name)
          context.instance[i].description = req.__(context.instance[i].description)
        }
        return context.continue
      })
      resource.read.send.before((req: Request, res: Response, context: { instance: { name: string, description: string }, continue: any }) => {
        context.instance.name = req.__(context.instance.name)
        context.instance.description = req.__(context.instance.description)
        return context.continue
      })
    }

    // fix the api difference between finale (fka epilogue) and previously used sequlize-restful
    resource.all.send.before((req: Request, res: Response, context: { instance: { status: string, data: any }, continue: any }) => {
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
  app.get('/rest/user/whoami', security.updateAuthenticatedUsers(), retrieveLoggedInUser())
  app.get('/rest/user/authentication-details', authenticatedUsers())
  app.get('/rest/products/search', searchProducts())
  app.get('/rest/basket/:id', retrieveBasket())
  app.post('/rest/basket/:id/checkout', placeOrder())
  app.put('/rest/basket/:id/coupon/:coupon', applyCoupon())
  app.get('/rest/admin/application-version', retrieveAppVersion())
  app.get('/rest/admin/application-configuration', retrieveAppConfiguration())
  app.get('/rest/repeat-notification', repeatNotification())
  app.get('/rest/continue-code', continueCode())
  app.get('/rest/continue-code-findIt', continueCodeFindIt())
  app.get('/rest/continue-code-fixIt', continueCodeFixIt())
  app.put('/rest/continue-code-findIt/apply/:continueCode', restoreProgress.restoreProgressFindIt())
  app.put('/rest/continue-code-fixIt/apply/:continueCode', restoreProgress.restoreProgressFixIt())
  app.put('/rest/continue-code/apply/:continueCode', restoreProgress.restoreProgress())
  app.get('/rest/captcha', captchas())
  app.get('/rest/image-captcha', imageCaptchas())
  app.get('/rest/track-order/:id', trackOrder())
  app.get('/rest/country-mapping', countryMapping())
  app.get('/rest/saveLoginIp', saveLoginIp())
  app.post('/rest/user/data-export', security.appendUserId(), verifyImageCaptcha())
  app.post('/rest/user/data-export', security.appendUserId(), dataExport())
  app.get('/rest/languages', getLanguageList())
  app.get('/rest/order-history', orderHistory())
  app.get('/rest/order-history/orders', security.isAccounting(), allOrders())
  app.put('/rest/order-history/:id/delivery-status', security.isAccounting(), toggleDeliveryStatus())
  app.get('/rest/wallet/balance', security.appendUserId(), getWalletBalance())
  app.put('/rest/wallet/balance', security.appendUserId(), addWalletBalance())
  app.get('/rest/deluxe-membership', deluxeMembershipStatus())
  app.post('/rest/deluxe-membership', security.appendUserId(), upgradeToDeluxe())
  app.get('/rest/memories', getMemories())
  app.get('/rest/chatbot/status', chatbot.status())
  app.post('/rest/chatbot/respond', chatbot.process())
  /* NoSQL API endpoints */
  app.get('/rest/products/:id/reviews', showProductReviews())
  app.put('/rest/products/:id/reviews', createProductReviews())
  app.patch('/rest/products/reviews', security.isAuthorized(), updateProductReviews())
  app.post('/rest/products/reviews', security.isAuthorized(), likeProductReviews())

  /* Web3 API endpoints */
  app.post('/rest/web3/submitKey', checkKeys())
  app.get('/rest/web3/nftUnlocked', nftUnlocked())
  app.get('/rest/web3/nftMintListen', nftMintListener())
  app.post('/rest/web3/walletNFTVerify', walletNFTVerify())
  app.post('/rest/web3/walletExploitAddress', contractExploitListener())

  /* B2B Order API */
  app.post('/b2b/v2/orders', b2bOrder())

  /* File Serving */
  app.get('/the/devs/are/so/funny/they/hid/an/easter/egg/within/the/easter/egg', serveEasterEgg())
  app.get('/this/page/is/hidden/behind/an/incredibly/high/paywall/that/could/only/be/unlocked/by/sending/1btc/to/us', servePremiumContent())
  app.get('/we/may/also/instruct/you/to/refuse/all/reasonably/necessary/responsibility', servePrivacyPolicyProof())

  /* Route for dataerasure page */
  app.use('/dataerasure', dataErasure)

  /* Route for redirects */
  app.get('/redirect', performRedirect())

  /* Routes for promotion video page */
  app.get('/promotion', promotionVideo())
  app.get('/video', getVideo())

  /* Routes for profile page */
  app.get('/profile', security.updateAuthenticatedUsers(), getUserProfile())
  app.post('/profile', updateUserProfile())

  /* Route for vulnerable code snippets */
  app.get('/snippets/:challenge', serveCodeSnippet())
  app.post('/snippets/verdict', checkVulnLines())
  app.get('/snippets/fixes/:key', serveCodeFixes())
  app.post('/snippets/fixes', checkCorrectFix())

  app.use(serveAngularClient())

  /* Error Handling */
  app.use(verify.errorHandlingChallenge())
  app.use(errorhandler())
}).catch((err) => {
  console.error(err)
})

const uploadToMemory = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200000 } })
const mimeTypeMap: any = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
}
const uploadToDisk = multer({
  storage: multer.diskStorage({
    destination: (req: Request, file: any, cb: any) => {
      const isValid = mimeTypeMap[file.mimetype]
      let error: Error | null = new Error('Invalid mime type')
      if (isValid) {
        error = null
      }
      cb(error, path.resolve('frontend/dist/frontend/assets/public/images/uploads/'))
    },
    filename: (req: Request, file: any, cb: any) => {
      const name = security.sanitizeFilename(file.originalname)
        .toLowerCase()
        .split(' ')
        .join('-')
      const ext = mimeTypeMap[file.mimetype]
      cb(null, name + '-' + Date.now() + '.' + ext)
    }
  })
})

const expectedModels = ['Address', 'Basket', 'BasketItem', 'Captcha', 'Card', 'Challenge', 'Complaint', 'Delivery', 'Feedback', 'ImageCaptcha', 'Memory', 'PrivacyRequestModel', 'Product', 'Quantity', 'Recycle', 'SecurityAnswer', 'SecurityQuestion', 'User', 'Wallet', 'Hint']
while (!expectedModels.every(model => Object.keys(sequelize.models).includes(model))) {
  logger.info(`Entity models ${colors.bold(Object.keys(sequelize.models).length.toString())} of ${colors.bold(expectedModels.length.toString())} are initialized (${colors.yellow('WAITING')})`)
}
logger.info(`Entity models ${colors.bold(Object.keys(sequelize.models).length.toString())} of ${colors.bold(expectedModels.length.toString())} are initialized (${colors.green('OK')})`)

// vuln-code-snippet start exposedMetricsChallenge
/* Serve metrics */
let metricsUpdateLoop: any
const Metrics = metrics.observeMetrics() // vuln-code-snippet neutral-line exposedMetricsChallenge
app.get('/metrics', metrics.serveMetrics()) // vuln-code-snippet vuln-line exposedMetricsChallenge
errorhandler.title = `${config.get<string>('application.name')} (Express ${utils.version('express')})`

export async function start (readyCallback?: () => void) {
  const datacreatorEnd = startupGauge.startTimer({ task: 'datacreator' })
  await sequelize.sync({ force: true })
  await datacreator()
  datacreatorEnd()
  const port = process.env.PORT ?? config.get('server.port')
  process.env.BASE_PATH = process.env.BASE_PATH ?? config.get('server.basePath')

  metricsUpdateLoop = Metrics.updateLoop() // vuln-code-snippet neutral-line exposedMetricsChallenge

  server.listen(port, () => {
    logger.info(colors.cyan(`Server listening on port ${colors.bold(`${port}`)}`))
    startupGauge.set({ task: 'ready' }, (Date.now() - startTime) / 1000)
    if (process.env.BASE_PATH !== '') {
      logger.info(colors.cyan(`Server using proxy base path ${colors.bold(`${process.env.BASE_PATH}`)} for redirects`))
    }
    registerWebsocketEvents(server)
    if (readyCallback) {
      readyCallback()
    }
  })

  void collectDurationPromise('customizeApplication', customizeApplication)() // vuln-code-snippet hide-line
  void collectDurationPromise('customizeEasterEgg', customizeEasterEgg)() // vuln-code-snippet hide-line
}

export function close (exitCode: number | undefined) {
  if (server) {
    clearInterval(metricsUpdateLoop)
    server.close()
  }
  if (exitCode !== undefined) {
    process.exit(exitCode)
  }
}
// vuln-code-snippet end exposedMetricsChallenge

// stop server on sigint or sigterm signals
process.on('SIGINT', () => { close(0) })
process.on('SIGTERM', () => { close(0) })
