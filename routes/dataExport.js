const utils = require('../lib/utils')
const insecurity = require('../lib/insecurity')
const db = require('../data/mongodb')

module.exports = function dataExport () {
  return (req, res, next) => {
    const loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token)
    let userData = {}
    if (loggedInUser && loggedInUser.data && loggedInUser.data.email && loggedInUser.data.id) {
      const username = loggedInUser.data.username === '' ? 'n.a.' : loggedInUser.data.username
      const email = loggedInUser.data.email
      const updatedEmail = email.replace(/[aeiou]/gi, '*')

      db.orders.find({ $where: "this.email === '" + updatedEmail + "'" }).then(orders => {
        const result = utils.queryResultToJson(orders)
        const data = result.data
        if (data.length > 0) {
          let orders = []
          data.map(order => {
            let finalOrder = {
              orderId: order.orderId,
              totalPrice: order.totalPrice,
              products: [...order.products],
              bonus: order.bonus,
              eta: order.eta
            }
            orders.push(finalOrder)
          })

          userData = {
            username,
            email: email,
            orders: orders
          }
        } else {
          userData.orders = 'No orders placed yet'
        }
        res.status(200).send({ userData: JSON.stringify(userData, null, 2), confirmation: 'Your data is being exported' })
      },
      () => {
        next(new Error('Wrong param for finding orders'))
      })
    } else {
      next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
    }
  }
}
