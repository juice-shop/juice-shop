const config = require('config')
exports = module.exports = function retrieveAppConfiguration () {
  return (req, res) => {
    res.json({ config: config })
  }
}
