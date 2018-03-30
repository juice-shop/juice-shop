const insecurity = require('../lib/insecurity')

module.exports = function retrieveLoggedInUser () {
  return (req, res) => {
    const user = insecurity.authenticatedUsers.from(req)
    res.json({user: {id: (user && user.data ? user.data.id : undefined), email: (user && user.data ? user.data.email : undefined)}})
  }
}
