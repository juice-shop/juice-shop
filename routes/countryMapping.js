const config = require('config')

module.exports = function countryMapping () {
  return (req, res, next) => {
    try {
      const countryMapping = config.get('ctf.countryMapping')
      res.send(countryMapping)
    } catch (err) {
      console.log('countryMapping was requested but was not found in the selected config file. Take a look at the fbctf.yml config file to find out how to configure the country mappings required by FBCTF.')
      res.status(500).send()
    }
  }
}
