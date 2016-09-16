/* jslint node: true */
'use strict'

var utils = require('../lib/utils')
var challenges = require('../data/datacache').challenges

exports = module.exports = function fileUpload () {
  return function (req, res) {
    var file = req.file
    console.log(req.file)
    if (utils.notSolved(challenges.uploadSize) && file.size > 100000) {
      utils.solve(challenges.uploadSize)
    }
    if (utils.notSolved(challenges.uploadType) && !utils.endsWith(file.originalname.toLowerCase(), '.pdf')) {
      utils.solve(challenges.uploadType)
    }
    res.status(204).end()
  }
}
