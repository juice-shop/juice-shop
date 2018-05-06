const MarsDB = require('marsdb')

const reviews = new MarsDB.Collection('posts')
const orders = new MarsDB.Collection('orders')

const db = {
  reviews,
  orders
}

module.exports = db
