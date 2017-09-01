const insecurity = require('../lib/insecurity')

exports = module.exports = function retrieveLoggedInUser () {
  return (req, res) => {
    const user = insecurity.authenticatedUsers.from(req)
    res.json({user: {id: (user ? user.data.id : undefined), email: (user ? user.data.email : undefined)}})
  }
}
