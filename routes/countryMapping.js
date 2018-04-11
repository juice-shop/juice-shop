const config = require('config')

module.exports = function countryMapping () {
  return (req, res, next) => {
    try {
      const countryMapping = config.get('application.countryMapping')
      res.send(countryMapping)
    } catch (err) {
      console.log('CountryMapping was requested but was not found in the selected config file. Take a look at the fbctf.yml config file to find out how to configure the country mapping.')
      res.status(500).send()
    }
  }
}
