const applicationRoot = __dirname.replace(/\\/g, '/')
const path = require('path')
const fs = require('fs-extra')
const morgan = require('morgan')
const colors = require('colors/safe')
const epilogue = require('epilogue-js')
const express = require('express')
const helmet = require('helmet')
const errorhandler = require('errorhandler')
const cookieParser = require('cookie-parser')
const serveIndex = require('serve-index')
const favicon = require('serve-favicon')
const bodyParser = require('body-parser')
const cors = require('cors')
const securityTxt = require('express-security.txt')
const robots = require('express-robots')
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200000 } })
const yaml = require('js-yaml')
const swaggerUi = require('swagger-ui-express')
const RateLimit = require('express-rate-limit')
const swaggerDocument = yaml.load(fs.readFileSync('./swagger.yml', 'utf8'))
const fileUpload = require('./routes/fileUpload')
const redirect = require('./routes/redirect')
const angular = require('./routes/angular')
const easterEgg = require('./routes/easterEgg')
const premiumReward = require('./routes/premiumReward')
const appVersion = require('./routes/appVersion')
const repeatNotification = require('./routes/repeatNotification')
const continueCode = require('./routes/continueCode')
const restoreProgress = require('./routes/restoreProgress')
const fileServer = require('./routes/fileServer')
const keyServer = require('./routes/keyServer')
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
const b2bOrder = require('./routes/b2bOrder')
const showProductReviews = require('./routes/showProductReviews')
const createProductReviews = require('./routes/createProductReviews')
const updateProductReviews = require('./routes/updateProductReviews')
const likeProductReviews = require('./routes/likeProductReviews')
const utils = require('./lib/utils')
const insecurity = require('./lib/insecurity')
const models = require('./models')
const datacreator = require('./data/datacreator')
const app = express()
const server = require('http').Server(app)
const appConfiguration = require('./routes/appConfiguration')
const captcha = require('./routes/captcha')
const trackOrder = require('./routes/trackOrder')
const countryMapping = require('./routes/countryMapping')
const basketItems = require('./routes/basketItems')
const config = require('config')

errorhandler.title = 'Juice Shop (Express ' + utils.version('express') + ')'

require('./lib/startup/validateConfig')()
require('./lib/startup/cleanupFtpFolder')()

/* Locals */
app.locals.captchaId = 0
app.locals.captchaReqId = 1
app.locals.captchaBypassReqTimes = []

/* Bludgeon solution for possible CORS problems: Allow everything! */
app.options('*', cors())
app.use(cors())

/* Security middleware */
app.use(helmet.noSniff())
app.use(helmet.frameguard())
// app.use(helmet.xssFilter()); // = no protection from persisted XSS via RESTful API

/* Remove duplicate slashes from URL which allowed bypassing subsequent filters */
app.use((req, res, next) => {
  req.url = req.url.replace(/[/]+/g, '/')
  next()
})

/* Favicon */
let icon = 'favicon_v2.ico'
if (config.get('application.favicon')) {
  icon = config.get('application.favicon')
  if (utils.startsWith(icon, 'http')) {
    const iconPath = icon
    icon = decodeURIComponent(icon.substring(icon.lastIndexOf('/') + 1))
    utils.downloadToFile(iconPath, 'app/public/' + icon)
  }
}
app.use(favicon(path.join(__dirname, 'app/public/' + icon)))

/* Security Policy */
app.get('/security.txt', verify.accessControlChallenges())
app.use('/security.txt', securityTxt({
  contact: config.get('application.securityTxt.contact'),
  encryption: config.get('application.securityTxt.encryption'),
  acknowledgements: config.get('application.securityTxt.acknowledgements')
}))

/* robots.txt */
app.use(robots({UserAgent: '*', Disallow: '/ftp'}))

/* Checks for challenges solved by retrieving a file implicitly or explicitly */
app.use('/public/images/tracking', verify.accessControlChallenges())
app.use('/public/images/products', verify.accessControlChallenges())
app.use('/i18n', verify.accessControlChallenges())

/* /ftp directory browsing and file download */
app.use('/ftp', serveIndex('ftp', { 'icons': true }))
app.use('/ftp/:file', fileServer())

/* /encryptionkeys directory browsing */
app.use('/encryptionkeys', serveIndex('encryptionkeys', { 'icons': true, 'view': 'details' }))
app.use('/encryptionkeys/:file', keyServer())

/* Swagger documentation for B2B v2 endpoints */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use(express.static(applicationRoot + '/app'))
app.use(cookieParser('kekse'))

/* File Upload */
app.post('/file-upload', upload.single('file'), fileUpload())

app.use(bodyParser.text({type: '*/*'}))
app.use(function jsonParser (req, res, next) {
  req.rawBody = req.body
  if (req.headers['content-type'] !== undefined && req.headers['content-type'].indexOf('application/json') > -1) {
    req.body = JSON.parse(req.body)
  }
  next()
})

/* HTTP request logging */
let accessLogStream = require('file-stream-rotator').getStream({filename: './access.log', frequency: 'daily', verbose: false, max_logs: '2d'})
app.use(morgan('combined', {stream: accessLogStream}))

/* Rate limiting */
app.enable('trust proxy')
app.use('/rest/user/reset-password', new RateLimit({ windowMs: 5 * 60 * 1000, max: 100, keyGenerator ({headers, ip}) { return headers['X-Forwarded-For'] || ip }, delayMs: 0 }))

/** Authorization **/
/* Checks on JWT in Authorization header */
app.use(verify.jwtChallenges())
/* Baskets: Unauthorized users are not allowed to access baskets */
app.use('/rest/basket', insecurity.isAuthorized())
/* BasketItems: API only accessible for authenticated users */
app.use('/api/BasketItems', insecurity.isAuthorized())
app.use('/api/BasketItems/:id', insecurity.isAuthorized())
/* Feedbacks: GET allowed for feedback carousel, POST allowed in order to provide feedback without being logged in */
app.use('/api/Feedbacks/:id', insecurity.isAuthorized())
/* Users: Only POST is allowed in order to register a new user */
app.get('/api/Users', insecurity.isAuthorized())
app.route('/api/Users/:id')
  .get(insecurity.isAuthorized())
  .put(insecurity.denyAll()) // Updating users is forbidden to make the password change challenge harder
  .delete(insecurity.denyAll()) // Deleting users is forbidden entirely to keep login challenges solvable
/* Products: Only GET is allowed in order to view products */
app.post('/api/Products', insecurity.isAuthorized())
// app.put('/api/Products/:id', insecurity.isAuthorized()); // = missing function-level access control vulnerability
app.delete('/api/Products/:id', insecurity.denyAll()) // Deleting products is forbidden entirely to keep the O-Saft url-change challenge solvable
/* Challenges: GET list of challenges allowed. Everything else forbidden independent of authorization (hence the random secret) */
app.post('/api/Challenges', insecurity.denyAll())
app.use('/api/Challenges/:id', insecurity.denyAll())
/* Complaints: POST and GET allowed when logged in only */
app.get('/api/Complaints', insecurity.isAuthorized())
app.post('/api/Complaints', insecurity.isAuthorized())
app.use('/api/Complaints/:id', insecurity.denyAll())
/* Recycles: POST and GET allowed when logged in only */
app.get('/api/Recycles', insecurity.isAuthorized())
app.post('/api/Recycles', insecurity.isAuthorized())
app.use('/api/Recycles/:id', insecurity.denyAll())
/* SecurityQuestions: Only GET list of questions allowed. */
app.post('/api/SecurityQuestions', insecurity.denyAll())
app.use('/api/SecurityQuestions/:id', insecurity.denyAll())
/* SecurityAnswers: Only POST of answer allowed. */
app.get('/api/SecurityAnswers', insecurity.denyAll())
app.use('/api/SecurityAnswers/:id', insecurity.denyAll())
/* REST API */
app.use('/rest/user/authentication-details', insecurity.isAuthorized())
app.use('/rest/basket/:id', insecurity.isAuthorized())
app.use('/rest/basket/:id/order', insecurity.isAuthorized())
/* Challenge evaluation before epilogue takes over */
app.post('/api/Feedbacks', verify.forgedFeedbackChallenge())
/* Captcha verification before epilogue takes over */
app.post('/api/Feedbacks', insecurity.verifyCaptcha())
/* Captcha Bypass challenge verification */
app.post('/api/Feedbacks', verify.captchaBypassChallenge())
/* Register admin challenge verification */
app.post('/api/Users', verify.registerAdminChallenge())
/* Unauthorized users are not allowed to access B2B API */
app.use('/b2b/v2', insecurity.isAuthorized())
/* Add item to basket */
app.post('/api/BasketItems', basketItems())

/* Verifying DB related challenges can be postponed until the next request for challenges is coming via epilogue */
app.use(verify.databaseRelatedChallenges())

/* Generated API endpoints */
epilogue.initialize({ app, sequelize: models.sequelize })

const autoModels = ['User', 'Product', 'Feedback', 'BasketItem', 'Challenge', 'Complaint', 'Recycle', 'SecurityQuestion', 'SecurityAnswer']

for (const modelName of autoModels) {
  const resource = epilogue.resource({
    model: models[modelName],
    endpoints: [`/api/${modelName}s`, `/api/${modelName}s/:id`]
  })

  // fix the api difference between epilogue and previously used sequlize-restful
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
app.get('/rest/user/whoami', currentUser())
app.get('/rest/user/authentication-details', authenticatedUsers())
app.get('/rest/product/search', search())
app.get('/rest/basket/:id', basket())
app.post('/rest/basket/:id/checkout', order())
app.put('/rest/basket/:id/coupon/:coupon', coupon())
app.get('/rest/admin/application-version', appVersion())
app.get('/rest/admin/application-configuration', appConfiguration())
app.get('/rest/repeat-notification', repeatNotification())
app.get('/rest/continue-code', continueCode())
app.put('/rest/continue-code/apply/:continueCode', restoreProgress())
app.get('/rest/admin/application-version', appVersion())
app.get('/redirect', redirect())
app.get('/rest/captcha', captcha())
app.get('/rest/track-order/:id', trackOrder())
app.get('/rest/country-mapping', countryMapping())

/* NoSQL API endpoints */
app.get('/rest/product/:id/reviews', showProductReviews())
app.put('/rest/product/:id/reviews', createProductReviews())
app.patch('/rest/product/reviews', insecurity.isAuthorized(), updateProductReviews())
app.post('/rest/product/reviews', insecurity.isAuthorized(), likeProductReviews())

/* B2B Order API */
app.post('/b2b/v2/orders', b2bOrder())

/* File Serving */
app.get('/the/devs/are/so/funny/they/hid/an/easter/egg/within/the/easter/egg', easterEgg())
app.get('/this/page/is/hidden/behind/an/incredibly/high/paywall/that/could/only/be/unlocked/by/sending/1btc/to/us', premiumReward())
app.use(angular())

/* Error Handling */
app.use(verify.errorHandlingChallenge())
app.use(errorhandler())

exports.start = async function (readyCallback) {
  await models.sequelize.sync({ force: true })
  await datacreator()

  server.listen(process.env.PORT || config.get('server.port'), () => {
    console.log(colors.yellow('Server listening on port %d'), config.get('server.port'))
    require('./lib/startup/registerWebsocketEvents')(server)
    if (readyCallback) {
      readyCallback()
    }
  })

  require('./lib/startup/populateIndexTemplate')()
  require('./lib/startup/populateThreeJsTemplate')()
}

exports.close = function (exitCode) {
  if (this.server) {
    this.server.close(exitCode)
  } else {
    process.exit(exitCode)
  }
}
