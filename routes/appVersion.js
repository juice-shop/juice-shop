const utils = require('../lib/utils')

exports = module.exports = function retrieveAppVersion () {
  return (req, res) => {
    res.json({ version: utils.version() })
  }
}
