const config = require('config')

module.exports = function retrieveAppConfiguration () {
  return (req, res) => {
    res.json({ config })
  }
}
