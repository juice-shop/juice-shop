const path = require('path')
const utils = require('../lib/utils')

exports = module.exports = function serveAngularClient () {
  return ({url}, res, next) => {
    if (!utils.startsWith(url, '/api') && !utils.startsWith(url, '/rest')) {
      res.sendFile(path.resolve(__dirname, '../app/index.html'))
    } else {
      next(new Error('Unexpected path: ' + url))
    }
  }
}
