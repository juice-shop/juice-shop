'use strict'

var applicationRoot = __dirname.replace(/\\/g, '/')
var path = require('path')
var fs = require('fs-extra')
var glob = require('glob')
var morgan = require('morgan')
var colors = require('colors/safe')
var restful = require('sequelize-restful')
var express = require('express')
var helmet = require('helmet')
var errorhandler = require('errorhandler')
var cookieParser = require('cookie-parser')
var serveIndex = require('serve-index')
var favicon = require('serve-favicon')
var bodyParser = require('body-parser')
var cors = require('cors')
var multer = require('multer')
var upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200000 } })
var fileUpload = require('./routes/fileUpload')
var redirect = require('./routes/redirect')
var angular = require('./routes/angular')
var easterEgg = require('./routes/easterEgg')
var premiumReward = require('./routes/premiumReward')
var appVersion = require('./routes/appVersion')
var repeatNotification = require('./routes/repeatNotification')
var continueCode = require('./routes/continueCode')
var restoreProgress = require('./routes/restoreProgress')
var fileServer = require('./routes/fileServer')
var keyServer = require('./routes/keyServer')
var authenticatedUsers = require('./routes/authenticatedUsers')
var currentUser = require('./routes/currentUser')
var login = require('./routes/login')
var changePassword = require('./routes/changePassword')
var resetPassword = require('./routes/resetPassword')
var securityQuestion = require('./routes/securityQuestion')
var search = require('./routes/search')
var coupon = require('./routes/coupon')
var basket = require('./routes/basket')
var order = require('./routes/order')
var verify = require('./routes/verify')
var utils = require('./lib/utils')
var insecurity = require('./lib/insecurity')
var models = require('./models')
var datacreator = require('./data/datacreator')
var notifications = require('./data/datacache').notifications
var app = express()
var server = require('http').Server(app)
var io = require('socket.io')(server)
var replace = require('replace')
var appConfiguration = require('./routes/appConfiguration')
const config = require('config')
var firstConnectedSocket = null

global.io = io
errorhandler.title = 'Juice Shop (Express ' + utils.version('express') + ')'

/* Delete old order PDFs */
glob(path.join(__dirname, 'ftp/*.pdf'), function (err, files) {
  if (err) {
    console.log(err)
  } else {
    files.forEach(function (filename) {
      fs.remove(filename)
    })
  }
})

/* Bludgeon solution for possible CORS problems: Allow everything! */
app.options('*', cors())
app.use(cors())

/* Security middleware */
app.use(helmet.noSniff())
app.use(helmet.frameguard())
// app.use(helmet.xssFilter()); // = no protection from persisted XSS via RESTful API

/* Remove duplicate slashes from URL which allowed bypassing subsequent filters */
app.use(function (req, res, next) {
  req.url = req.url.replace(/[/]+/g, '/')
  next()
})

/* Favicon */
var icon = 'favicon_v2.ico'
if (config.get('application.favicon')) {
  icon = config.get('application.favicon')
  if (utils.startsWith(icon, 'http')) {
    var iconPath = icon
    icon = decodeURIComponent(icon.substring(icon.lastIndexOf('/') + 1))
    utils.downloadToFile(iconPath, 'app/public/' + icon)
  }
}
app.use(favicon(path.join(__dirname, 'app/public/' + icon)))

/* Checks for solved challenges */
app.use('/public/images/tracking', verify.accessControlChallenges())
app.use('/public/images/products', verify.accessControlChallenges())
app.use('/i18n', verify.accessControlChallenges())

/* /ftp directory browsing and file download */
app.use('/ftp', serveIndex('ftp', { 'icons': true }))
app.use('/ftp/:file', fileServer())

/* /encryptionkeys directory browsing */
app.use('/encryptionkeys', serveIndex('encryptionkeys', { 'icons': true, 'view': 'details' }))
app.use('/encryptionkeys/:file', keyServer())

app.use(express.static(applicationRoot + '/app'))
app.use(cookieParser('kekse'))
app.use(bodyParser.json())

/* HTTP request logging */
app.use(morgan('dev'))

/* Authorization */
/* Baskets: Unauthorized users are not allowed to access baskets */
app.use('/rest/basket', insecurity.isAuthorized())
/* BasketItems: API only accessible for authenticated users */
app.use('/api/BasketItems', insecurity.isAuthorized())
app.use('/api/BasketItems/:id', insecurity.isAuthorized())
/* Feedbacks: GET allowed for feedback carousel, POST allowed in order to provide feedback without being logged in */
app.use('/api/Feedbacks/:id', insecurity.isAuthorized())
/* Users: Only POST is allowed in order to register a new uer */
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

/* Challenge evaluation before sequelize-restful takes over */
app.post('/api/Feedbacks', verify.forgedFeedbackChallenge())

/* Verifying DB related challenges can be postponed until the next request for challenges is coming via sequelize-restful */
app.use(verify.databaseRelatedChallenges())
/* Sequelize Restful APIs */
app.use(restful(models.sequelize, {
  endpoint: '/api',
  allowed: [ 'Users', 'Products', 'Feedbacks', 'BasketItems', 'Challenges', 'Complaints', 'Recycles', 'SecurityQuestions', 'SecurityAnswers' ]
}))
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
/* File Upload */
app.post('/file-upload', upload.single('file'), fileUpload())
/* File Serving */
app.get('/the/devs/are/so/funny/they/hid/an/easter/egg/within/the/easter/egg', easterEgg())
app.get('/this/page/is/hidden/behind/an/incredibly/high/paywall/that/could/only/be/unlocked/by/sending/1btc/to/us', premiumReward())
app.use(angular())
/* Error Handling */
app.use(verify.errorHandlingChallenge())
app.use(errorhandler())

exports.start = function (readyCallback) {
  function registerWebsocketEvents () {
    io.on('connection', function (socket) {
      // notify only first client to connect about server start
      if (firstConnectedSocket === null) {
        socket.emit('server started')
        firstConnectedSocket = socket.id
      }

      // send all outstanding notifications on (re)connect
      notifications.forEach(function (notification) {
        socket.emit('challenge solved', notification)
      })

      socket.on('notification received', function (data) {
        var i = notifications.findIndex(function (element) {
          return element.flag === data
        })
        if (i > -1) {
          notifications.splice(i, 1)
        }
      })
    })
  }

  function populateIndexTemplate () {
    fs.copy('app/index.template.html', 'app/index.html', { overwrite: true }, function () {
      if (config.get('application.logo')) {
        var logo = config.get('application.logo')
        if (utils.startsWith(logo, 'http')) {
          var logoPath = logo
          logo = decodeURIComponent(logo.substring(logo.lastIndexOf('/') + 1))
          utils.downloadToFile(logoPath, 'app/public/images/' + logo)
        }
        var logoImageTag = '<img class="navbar-brand navbar-logo" src="/public/images/' + logo + '">'
        replace({
          regex: /<img class="navbar-brand navbar-logo"(.*?)>/,
          replacement: logoImageTag,
          paths: [ 'app/index.html' ],
          recursive: false,
          silent: true
        })
      }
      if (config.get('application.theme')) {
        var themeCss = 'bower_components/bootswatch/' + config.get('application.theme') + '/bootstrap.min.css'
        replace({
          regex: /bower_components\/bootswatch\/.*\/bootstrap\.min\.css/,
          replacement: themeCss,
          paths: [ 'app/index.html' ],
          recursive: false,
          silent: true
        })
      }
    })
  }

  if (!this.server) {
    models.sequelize.drop()
    models.sequelize.sync().success(function () {
      datacreator()
      this.server = server.listen(process.env.PORT || config.get('server.port'), function () {
        console.log(colors.yellow('Server listening on port %d'), config.get('server.port'))
        registerWebsocketEvents()
        if (readyCallback) {
          readyCallback()
        }
      })
    })
    populateIndexTemplate()
  }
}

exports.close = function (exitCode) {
  if (this.server) {
    this.server.close(exitCode)
  } else {
    process.exit(exitCode)
  }
}
