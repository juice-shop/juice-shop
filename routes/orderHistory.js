const insecurity = require('../lib/insecurity')
const db = require('../data/mongodb')

module.exports = function orderHistory () {
  return async (req, res, next) => {
    const loggedInUser = insecurity.authenticatedUsers.get(req.headers.authorization.replace('Bearer ', ''))
    if (loggedInUser && loggedInUser.data && loggedInUser.data.email && loggedInUser.data.id) {
      const email = loggedInUser.data.email
      const updatedEmail = email.replace(/[aeiou]/gi, '*')
      const orders = await db.orders.find({ email: updatedEmail })
      res.status(200).json({ status: 'success', data: orders })
    } else {
      next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
    }
  }
}
