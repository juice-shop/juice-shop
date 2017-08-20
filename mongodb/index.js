const MarsDB = require('marsdb')

const reviews = new MarsDB.Collection('posts')

const db = {
  reviews: reviews
}

module.exports = db
