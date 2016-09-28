'use strict'

var utils = require('../lib/utils')

exports = module.exports = function socketUrl () {
  return function (req, res) {
    res.json({url: req.protocol + '://' + req.hostname + ':' + utils.ioPort})
  }
}
