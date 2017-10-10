const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges

exports = module.exports = function fileUpload () {
  return (req, res) => {
    const file = req.file
    if (utils.notSolved(challenges.uploadSizeChallenge) && file.size > 100000) {
      utils.solve(challenges.uploadSizeChallenge)
    }
    if (utils.notSolved(challenges.uploadTypeChallenge) && !utils.endsWith(file.originalname.toLowerCase(), '.pdf')) {
      utils.solve(challenges.uploadTypeChallenge)
    }
    res.status(204).end()
  }
}
