const config = require('config')
const logger = require('../lib/logger')

module.exports = function countryMapping () {
  return (req, res) => {
    try {
      const countryMapping = config.get('ctf.countryMapping')
      res.send(countryMapping)
    } catch (err) {
      logger.warn('countryMapping was requested but was not found in the selected config file. Take a look at the fbctf.yml config file to find out how to configure the country mappings required by FBCTF.')
      res.status(500).send()
    }
  }
}
