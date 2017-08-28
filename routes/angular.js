const path = require('path')
const utils = require('../lib/utils')

exports = module.exports = function serveAngularClient () {
  return (req, res, next) => {
    if (!utils.startsWith(req.url, '/api') && !utils.startsWith(req.url, '/rest')) {
      res.sendFile(path.resolve(__dirname, '../app/index.html'))
    } else {
      next(new Error('Unexpected path: ' + req.url))
    }
  }
}
