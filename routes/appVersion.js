const utils = require('../lib/utils')
const config = require('config')

module.exports = function retrieveAppVersion () {
  return (req, res) => {
    res.json({
      version: config.get('application.showVersionNumber') ? utils.version() : ''
    })
  }
}
