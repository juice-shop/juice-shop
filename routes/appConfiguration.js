'use strict'
var config = require('config')
exports = module.exports = function retrieveAppConfiguration () {
  return function (req, res) {
    res.json({ config: config })
  }
}
