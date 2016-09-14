/* jslint node: true */
'use strict'

var applicationRoot = __dirname.replace(/\\/g, '/')
var path = require('path')
var fs = require('fs')
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
var upload = multer({storage: multer.memoryStorage(), limits: {fileSize: 2000000}})
var fileUpload = require('./routes/fileUpload')
var redirect = require('./routes/redirect')
var angular = require('./routes/angular')
var easterEgg = require('./routes/easterEgg')
var appVersion = require('./routes/appVersion')
var fileServer = require('./routes/fileServer')
var authenticatedUsers = require('./routes/authenticatedUsers')
var currentUser = require('./routes/currentUser')
var login = require('./routes/login')
var changePassword = require('./routes/changePassword')
var search = require('./routes/search')
var coupon = require('./routes/coupon')
var basket = require('./routes/basket')
var order = require('./routes/order')
var verify = require('./routes/verify')
var utils = require('./lib/utils')
var insecurity = require('./lib/insecurity')
var models = require('./models')
var datacreator = require('./data/datacreator')
var app = express()

errorhandler.title = 'Juice Shop (Express ' + utils.version('express') + ')'

/* Delete old order PDFs */
glob(path.join(__dirname, 'ftp/*.pdf'), function (err, files) {
  console.log(err)
  files.forEach(function (filename) {
    fs.unlink(filename)
  })
})

/* Bludgeon solution for possible CORS problems: Allow everything! */
app.options('*', cors())
app.use(cors())

/* Security middleware */
app.use(helmet.noSniff())
app.use(helmet.frameguard())
// app.use(helmet.xssFilter()); // = no protection from persisted XSS via RESTful API

/* Remove duplicate slashes from URL which allowed bypassing subsequent filters */
app.use(function (req, res, next) { req.url = req.url.replace(/[/]+/g, '/'); next() })

/* Favicon */
app.use(favicon(path.join(__dirname, 'app/public/favicon_v2.ico')))

/* Checks for solved challenges */
app.use('/public/images/tracking', verify.accessControlChallenges())

/* /ftp directory browsing and file download */
app.use('/ftp', serveIndex('ftp', {'icons': true}))
app.use('/ftp/:file', fileServer())

app.use(express.static(applicationRoot + '/app'))
app.use(morgan('dev'))
app.use(cookieParser('kekse'))
app.use(bodyParser.json())

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
    .put(insecurity.isAuthorized())
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
/* REST API */
app.use('/rest/user/authentication-details', insecurity.isAuthorized())
app.use('/rest/basket/:id', insecurity.isAuthorized())
app.use('/rest/basket/:id/order', insecurity.isAuthorized())

/* Challenge evaluation before sequelize-restful takes over */
app.post('/api/Feedbacks', verify.forgedFeedbackChallenge())

/* Verifying DB related challenges can be postponed until the next request for challenges is coming via sequelize-restful */
app.use(verify.databaseRelatedChallenges())
/* Sequelize Restful APIs */
app.use(restful(models.sequelize, { endpoint: '/api', allowed: ['Users', 'Products', 'Feedbacks', 'BasketItems', 'Challenges', 'Complaints'] }))
/* Custom Restful API */
app.post('/rest/user/login', login())
app.get('/rest/user/change-password', changePassword())
app.get('/rest/user/whoami', currentUser())
app.get('/rest/user/authentication-details', authenticatedUsers())
app.get('/rest/product/search', search())
app.get('/rest/basket/:id', basket())
app.post('/rest/basket/:id/checkout', order())
app.put('/rest/basket/:id/coupon/:coupon', coupon())
app.get('/rest/admin/application-version', appVersion())
app.get('/redirect', redirect())
/* File Upload */
app.post('/file-upload', upload.single('file'), fileUpload())
/* File Serving */
app.get('/the/devs/are/so/funny/they/hid/an/easter/egg/within/the/easter/egg', easterEgg())
app.use(angular())
/* Error Handling */
app.use(verify.errorHandlingChallenge())
app.use(errorhandler())

exports.start = function (config, readyCallback) {
  if (!this.server) {
    models.sequelize.drop()
    models.sequelize.sync().success(function () {
      datacreator()
      this.server = app.listen(config.port, function () {
        console.log(colors.cyan('Listening on port %d'), config.port)
                // callback to call when the server is ready
        if (readyCallback) {
          readyCallback()
        }
      })
    })
  }
}

exports.close = function (exitCode) {
  if (this.server) {
    this.server.close(exitCode)
  } else {
    process.exit(exitCode)
  }
}
