const MarsDB = require('marsdb')

const reviews = new MarsDB.Collection('posts')

const db = {
  reviews
}

module.exports = db
