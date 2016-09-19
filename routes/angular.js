'use strict'

var path = require('path')
var utils = require('../lib/utils')

exports = module.exports = function serveAngularClient () {
  return function (req, res, next) {
    if (!utils.startsWith(req.url, '/api') && !utils.startsWith(req.url, '/rest')) {
      res.sendFile(path.resolve(__dirname, '../app/index.html'))
    } else {
      next(new Error('Unexpected path: ' + req.url))
    }
  }
}
