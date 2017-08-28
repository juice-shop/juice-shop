'use strict'

const utils = require('../lib/utils')

exports = module.exports = function retrieveAppVersion () {
  return function (req, res) {
    res.json({ version: utils.version() })
  }
}
