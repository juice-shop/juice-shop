'use strict'

var utils = require('../lib/utils')
var challenges = require('../data/datacache').challenges

exports = module.exports = function fileUpload () {
  return function (req, res) {
    var file = req.file
    if (utils.notSolved(challenges.uploadSizeChallenge) && file.size > 100000) {
      utils.solve(challenges.uploadSizeChallenge)
    }
    if (utils.notSolved(challenges.uploadTypeChallenge) && !utils.endsWith(file.originalname.toLowerCase(), '.pdf')) {
      utils.solve(challenges.uploadTypeChallenge)
    }
    res.status(204).end()
  }
}
